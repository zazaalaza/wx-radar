import fs from 'fs';
import path from 'path';
import { Station } from '@/lib/weather-stations/stations';
import { getErrorMessage } from '@/lib/shared/errors';
import { toDateKey } from '@/lib/shared/time-utils';
import { API_HOST, FRAME_BATCH_DELAY_MS, FRAME_CONCURRENCY, FRAME_FETCH_RETRIES, FRAME_RETRY_DELAY_MS, GIF_TOTAL_MS, IMAGE_HEIGHT, IMAGE_WIDTH, LANGUAGE, LOD, MAP_STYLE, PRODUCT, REQUEST_HEADERS, SUN_V3_API_KEY } from '@/lib/weather-com/config';
import { weatherComGeocode } from '@/lib/weather-com/geocode';
import { buildGif } from '@/lib/weather-com/gif';
import { frameFileName, framesDir as framesDirFor, gifPath as gifPathFor, latestJsonPath, metaJsonPath, rawCaptureDir } from '@/lib/weather-com/paths';
import { SatradSeries } from '@/lib/weather-com/series';

export type CaptureStatus = 'SUCCESS' | 'SKIPPED' | 'FAILED';

export interface CaptureResult {
  station: string;
  icao: string;
  status: CaptureStatus;
  datetime?: string;
  frameCount?: number;
  message?: string;
}

/** Per-station latest.json change-detection fingerprint. */
export interface LatestPointer {
  ts: number;
  ftsFirst: number;
  ftsLast: number;
  frameCount: number;
  datetime: string;
  date: string;
}

function readLatest(folder: string, code: string): LatestPointer | null {
  try {
    const raw = fs.readFileSync(latestJsonPath(folder, code), 'utf-8');
    const parsed = JSON.parse(raw) as LatestPointer;
    return typeof parsed?.ts === 'number' ? parsed : null;
  } catch {
    return null;
  }
}

/** True when the saved pointer already represents this exact series. */
function pointerMatchesSeries(pointer: LatestPointer | null, series: SatradSeries): boolean {
  if (!pointer) return false;
  return (
    pointer.ts === series.ts &&
    pointer.frameCount === series.fts.length &&
    pointer.ftsFirst === series.fts[0] &&
    pointer.ftsLast === series.fts[series.fts.length - 1]
  );
}

/** Compact UTC timestamp, e.g. 20260617T163000Z. */
function utcDateTimeStamp(now: Date): string {
  return now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function frameUrl(geocode: string, ts: number, fts: number): string {
  const params = new URLSearchParams({
    geocode,
    h: String(IMAGE_HEIGHT),
    w: String(IMAGE_WIDTH),
    lod: String(LOD),
    product: PRODUCT,
    map: MAP_STYLE,
    format: 'jpg',
    language: LANGUAGE,
    apiKey: SUN_V3_API_KEY,
    a: '0',
    ts: String(ts),
    fts: String(fts),
  });
  return `https://${API_HOST}/v2/maps/dynamic?${params.toString()}`;
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function fetchFrameOnce(url: string, destPath: string): Promise<void> {
  const res = await fetch(url, {
    headers: REQUEST_HEADERS,
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) {
    // Release the undici connection/buffer instead of leaking it.
    await res.body?.cancel().catch(() => {});
    throw new Error(`frame fetch failed: HTTP ${res.status}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buffer);
}

async function downloadFrame(url: string, destPath: string): Promise<void> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= FRAME_FETCH_RETRIES; attempt++) {
    try {
      await fetchFrameOnce(url, destPath);
      return;
    } catch (err) {
      lastError = err;
      if (attempt < FRAME_FETCH_RETRIES) {
        await sleep(FRAME_RETRY_DELAY_MS * attempt);
      }
    }
  }
  throw lastError;
}

function missingFrameIndices(frameDir: string, frameCount: number): number[] {
  return Array.from({ length: frameCount }, (_, index) => index).filter(
    (index) => !fs.existsSync(path.join(frameDir, frameFileName(index))),
  );
}

async function downloadFrameAtIndex(
  frameDir: string,
  geocode: string,
  seriesTs: number,
  fts: number,
  index: number,
): Promise<void> {
  const fileName = frameFileName(index);
  await downloadFrame(frameUrl(geocode, seriesTs, fts), path.join(frameDir, fileName));
}

/** Re-download any frames missing after the batched pass (partial batch failures). */
async function ensureAllFramesDownloaded(
  frameDir: string,
  frameCount: number,
  series: SatradSeries,
  geocode: string,
): Promise<void> {
  let missing = missingFrameIndices(frameDir, frameCount);
  if (missing.length === 0) return;

  for (const index of missing) {
    await downloadFrameAtIndex(frameDir, geocode, series.ts, series.fts[index], index);
  }

  missing = missingFrameIndices(frameDir, frameCount);
  if (missing.length > 0) {
    const names = missing.map((index) => frameFileName(index)).join(', ');
    throw new Error(`missing frames after refill: ${names}`);
  }
}

/** Remove transient frame downloads for a capture attempt. */
function removeRawCaptureDir(folder: string, code: string, date: string, datetime: string): void {
  const rawDir = path.dirname(rawCaptureDir(folder, code, date, datetime));
  try {
    fs.rmSync(rawDir, { recursive: true, force: true });
  } catch {
    // Best-effort; raw frames must not leak into the data repo commit.
  }
}

/**
 * Fetch + persist the satradFcst capture for one station, unless its latest.json
 * already matches the current series (in which case nothing is downloaded).
 *
 * On success the raw JPG frames are deleted once the GIF is built — wx-radar-data
 * only retains GIFs, meta.json and latest.json. Raw frames are also removed on
 * failure so partial captures do not leak into the data repo commit.
 */
export async function captureStation(station: Station, series: SatradSeries): Promise<CaptureResult> {
  const { folder, code } = station;
  const base: CaptureResult = { station: station.name, icao: code, status: 'SKIPPED' };

  const pointer = readLatest(folder, code);
  if (pointerMatchesSeries(pointer, series)) {
    return { ...base, status: 'SKIPPED', message: 'series unchanged' };
  }

  const now = new Date();
  const datetime = utcDateTimeStamp(now);
  const date = toDateKey(Math.floor(now.getTime() / 1000), station.timezone);
  const geocode = weatherComGeocode(station.lat, station.lon);
  const frameCount = series.fts.length;
  let rawStarted = false;

  try {
    const frameDir = framesDirFor(folder, code, date, datetime);
    fs.mkdirSync(frameDir, { recursive: true });
    rawStarted = true;

    const frameMeta: { index: number; fts: number; file: string }[] = [];

    // Download frames in bounded-concurrency batches (oldest -> newest).
    for (let i = 0; i < frameCount; i += FRAME_CONCURRENCY) {
      const batch = series.fts.slice(i, i + FRAME_CONCURRENCY);
      await Promise.allSettled(
        batch.map(async (fts, j) => {
          const index = i + j;
          await downloadFrameAtIndex(frameDir, geocode, series.ts, fts, index);
        }),
      );
      if (i + FRAME_CONCURRENCY < frameCount) {
        await sleep(FRAME_BATCH_DELAY_MS);
      }
    }

    await ensureAllFramesDownloaded(frameDir, frameCount, series, geocode);

    for (let index = 0; index < frameCount; index++) {
      const fileName = frameFileName(index);
      frameMeta[index] = { index, fts: series.fts[index], file: `${PRODUCT}/${fileName}` };
    }

    const gifFsPath = gifPathFor(folder, code, date, datetime);
    const metaFsPath = metaJsonPath(folder, code, date, datetime);

    const meta = {
      fetchedAt: datetime,
      date,
      datetime,
      source: `${API_HOST}/v2/maps/dynamic`,
      location: {
        icaoCode: code,
        name: station.name,
        geocode,
        latitude: station.lat,
        longitude: station.lon,
      },
      product: {
        name: PRODUCT,
        map: MAP_STYLE,
        ts: series.ts,
        frameCount,
        startFrameUnixTimestamp: series.fts[0],
        endFrameUnixTimestamp: series.fts[frameCount - 1],
        frames: frameMeta,
      },
      gif: {
        playbackDurationMs: GIF_TOTAL_MS,
        path: path.relative(path.dirname(metaFsPath), gifFsPath),
      },
    };
    fs.mkdirSync(path.dirname(metaFsPath), { recursive: true });
    fs.writeFileSync(metaFsPath, JSON.stringify(meta, null, 2));

    await buildGif(frameDir, gifFsPath, frameCount);

    const newPointer: LatestPointer = {
      ts: series.ts,
      ftsFirst: series.fts[0],
      ftsLast: series.fts[frameCount - 1],
      frameCount,
      datetime,
      date,
    };
    const latestPath = latestJsonPath(folder, code);
    fs.mkdirSync(path.dirname(latestPath), { recursive: true });
    fs.writeFileSync(latestPath, JSON.stringify(newPointer, null, 2));

    return { ...base, status: 'SUCCESS', datetime, frameCount };
  } catch (err) {
    return { ...base, status: 'FAILED', datetime, message: getErrorMessage(err) };
  } finally {
    if (rawStarted) {
      removeRawCaptureDir(folder, code, date, datetime);
    }
  }
}

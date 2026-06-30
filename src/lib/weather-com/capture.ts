import fs from 'fs';
import path from 'path';
import { Station } from '@/lib/weather-stations/stations';
import { getErrorMessage } from '@/lib/shared/errors';
import { toDateKey } from '@/lib/shared/time-utils';
import { API_HOST, FRAME_BATCH_DELAY_MS, FRAME_CONCURRENCY, GIF_TOTAL_MS, IMAGE_HEIGHT, IMAGE_WIDTH, LANGUAGE, LOD, MAP_STYLE, PRODUCT, REQUEST_HEADERS, SUN_V3_API_KEY } from '@/lib/weather-com/config';
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

async function downloadFrame(url: string, destPath: string): Promise<void> {
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

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Fetch + persist the satradFcst capture for one station, unless its latest.json
 * already matches the current series (in which case nothing is downloaded).
 *
 * On success the raw JPG frames are deleted once the GIF is built — wx-radar-data
 * only retains GIFs, meta.json and latest.json.
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

  try {
    const frameDir = framesDirFor(folder, code, date, datetime);
    fs.mkdirSync(frameDir, { recursive: true });

    const frameMeta: { index: number; fts: number; file: string }[] = [];

    // Download frames in bounded-concurrency batches (oldest -> newest).
    for (let i = 0; i < frameCount; i += FRAME_CONCURRENCY) {
      const batch = series.fts.slice(i, i + FRAME_CONCURRENCY);
      await Promise.all(
        batch.map(async (fts, j) => {
          const index = i + j;
          const fileName = frameFileName(index);
          await downloadFrame(frameUrl(geocode, series.ts, fts), path.join(frameDir, fileName));
          frameMeta[index] = { index, fts, file: `${PRODUCT}/${fileName}` };
        }),
      );
      if (i + FRAME_CONCURRENCY < frameCount) {
        await sleep(FRAME_BATCH_DELAY_MS);
      }
    }

    const gifFsPath = gifPathFor(folder, code, date, datetime);
    const metaFsPath = metaJsonPath(folder, code, date, datetime);

    const meta = {
      fetchedAt: datetime,
      date,
      datetime,
      source: `${API_HOST}/v2/maps/dynamic`,
      location: {
        station: folder,
        icaoCode: code,
        geocode,
        latitude: station.lat,
        longitude: station.lon,
      },
      product: {
        name: PRODUCT,
        map: MAP_STYLE,
        ts: series.ts,
        frameCount,
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

    // Raw frames are transient — keep the repo to GIFs + JSON only. Remove the
    // whole date/raw tree so no empty directories are committed.
    fs.rmSync(path.dirname(rawCaptureDir(folder, code, date, datetime)), { recursive: true, force: true });

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
  }
}

import fs from 'fs';
import { indexJsonPath } from '@/lib/shared/data-path';
import { RadarHistory, RadarIndex } from '@/lib/index/types';
import { historyJsonPath } from '@/lib/weather-com/paths';
import { STATIONS } from '@/lib/weather-stations/stations';

function dataRepoSlug(): { repo: string; branch: string } {
  return {
    repo: process.env.DATA_REPO ?? 'zazaalaza/wx-radar-data',
    branch: process.env.DATA_BRANCH ?? 'main',
  };
}

function remoteIndexUrl(): string {
  const { repo, branch } = dataRepoSlug();
  return `https://raw.githubusercontent.com/${repo}/${branch}/index.json`;
}

function remoteHistoryUrl(folder: string, code: string): string {
  const { repo, branch } = dataRepoSlug();
  return `https://raw.githubusercontent.com/${repo}/${branch}/stations/${folder}/${code}/history.json`;
}

/**
 * Load the radar index manifest.
 *
 * - When DATA_DIR is set (local dev / collector runner) read it from disk.
 * - Otherwise (Vercel) always fetch the latest from the data repo's raw URL.
 *   Caching is disabled end-to-end: Next data cache is bypassed (`no-store`)
 *   and a timestamp query param defeats the raw.githubusercontent.com CDN.
 */
export async function readIndex(): Promise<RadarIndex> {
  if (process.env.DATA_DIR) {
    const raw = fs.readFileSync(indexJsonPath(), 'utf-8');
    return JSON.parse(raw) as RadarIndex;
  }

  const res = await fetch(`${remoteIndexUrl()}?t=${Date.now()}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`index fetch failed: HTTP ${res.status}`);
  }
  return (await res.json()) as RadarIndex;
}

/**
 * Load a station's capture history manifest.
 *
 * Returns `null` for an unknown ICAO. A known station with no captures yet
 * resolves to an empty `captures` array. Storage mirrors {@link readIndex}:
 * disk when `DATA_DIR` is set, otherwise the data repo's raw URL.
 */
export async function readHistory(icao: string): Promise<RadarHistory | null> {
  const station = STATIONS.find((s) => s.code === icao);
  if (!station) return null;
  const { folder, code } = station;

  if (process.env.DATA_DIR) {
    try {
      const raw = fs.readFileSync(historyJsonPath(folder, code), 'utf-8');
      return JSON.parse(raw) as RadarHistory;
    } catch {
      return { icao: code, captures: [] };
    }
  }

  const res = await fetch(`${remoteHistoryUrl(folder, code)}?t=${Date.now()}`, { cache: 'no-store' });
  if (res.status === 404) {
    return { icao: code, captures: [] };
  }
  if (!res.ok) {
    throw new Error(`history fetch failed: HTTP ${res.status}`);
  }
  return (await res.json()) as RadarHistory;
}

import fs from 'fs';
import { indexJsonPath } from '@/lib/shared/data-path';
import { RadarIndex } from '@/lib/index/types';

function remoteIndexUrl(): string {
  const repo = process.env.DATA_REPO ?? 'zazaalaza/wx-radar-data';
  const branch = process.env.DATA_BRANCH ?? 'main';
  return `https://raw.githubusercontent.com/${repo}/${branch}/index.json`;
}

/**
 * Load the radar index manifest.
 *
 * - When DATA_DIR is set (local dev / collector runner) read it from disk.
 * - Otherwise (Vercel) fetch it from the public data repo's raw URL, cached
 *   for `revalidateSeconds` via Next's data cache.
 */
export async function readIndex(revalidateSeconds = 300): Promise<RadarIndex> {
  if (process.env.DATA_DIR) {
    const raw = fs.readFileSync(indexJsonPath(), 'utf-8');
    return JSON.parse(raw) as RadarIndex;
  }

  const res = await fetch(remoteIndexUrl(), { next: { revalidate: revalidateSeconds } });
  if (!res.ok) {
    throw new Error(`index fetch failed: HTTP ${res.status}`);
  }
  return (await res.json()) as RadarIndex;
}

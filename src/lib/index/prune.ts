import fs from 'fs';
import path from 'path';
import { toDateKey } from '@/lib/shared/time-utils';
import { stationDir } from '@/lib/weather-com/paths';
import { Station } from '@/lib/weather-stations/stations';

const DATE_DIR = /^\d{8}$/;

/** Keep this many trailing calendar days of gif/meta/raw per station. */
export const HISTORY_RETENTION_DAYS = 3;

/**
 * Delete on-disk date directories older than the retention window.
 *
 * Removes `gif/`, `meta/`, and any leftover `raw/` under each stale
 * `YYYYMMDD` dir. Safe to call every tick — history.json is rebuilt from
 * whatever remains on disk afterward.
 */
export function pruneStationHistory(
  station: Station,
  retentionDays = HISTORY_RETENTION_DAYS,
): string[] {
  const root = stationDir(station.folder, station.code);
  if (!fs.existsSync(root)) return [];

  const cutoffSec = Math.floor(Date.now() / 1000) - retentionDays * 86_400;
  const cutoff = toDateKey(cutoffSec, station.timezone);

  let dates: string[] = [];
  try {
    dates = fs
      .readdirSync(root, { withFileTypes: true })
      .filter((d) => d.isDirectory() && DATE_DIR.test(d.name))
      .map((d) => d.name);
  } catch {
    return [];
  }

  const pruned: string[] = [];
  for (const date of dates) {
    if (date >= cutoff) continue;
    fs.rmSync(path.join(root, date), { recursive: true, force: true });
    pruned.push(date);
  }
  return pruned;
}

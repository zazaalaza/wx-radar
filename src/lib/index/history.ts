import fs from 'fs';
import path from 'path';
import { gifUrlFor } from '@/lib/index/build';
import { RadarCapture, RadarHistory } from '@/lib/index/types';
import { historyJsonPath, stationDir } from '@/lib/weather-com/paths';
import { Station } from '@/lib/weather-stations/stations';

const DATE_DIR = /^\d{8}$/;

/** Pull the series model-run ts (when the forecast was issued) out of a capture's meta.json. */
function readSeriesTs(metaFile: string): number | null {
  try {
    const meta = JSON.parse(fs.readFileSync(metaFile, 'utf-8'));
    const ts = meta?.product?.ts;
    return typeof ts === 'number' ? ts : null;
  } catch {
    return null;
  }
}

/**
 * Rebuild a station's capture history by scanning its on-disk meta.json files.
 *
 * Rebuilding from disk (rather than appending) makes the manifest self-healing:
 * it backfills GIFs already present in the data repo and never drifts from the
 * actual archive. Requires a checked-out data tree (DATA_DIR / collector run).
 */
export function buildStationHistory(station: Station): RadarHistory {
  const { folder, code } = station;
  const root = stationDir(folder, code);
  const captures: RadarCapture[] = [];

  let dates: string[] = [];
  try {
    dates = fs
      .readdirSync(root, { withFileTypes: true })
      .filter((d) => d.isDirectory() && DATE_DIR.test(d.name))
      .map((d) => d.name);
  } catch {
    return { icao: code, captures };
  }

  for (const date of dates) {
    const metaDir = path.join(root, date, 'meta');
    let files: string[];
    try {
      files = fs.readdirSync(metaDir).filter((f) => f.endsWith('.json'));
    } catch {
      continue;
    }
    for (const file of files) {
      const metaPath = path.join(metaDir, file);
      const ts = readSeriesTs(metaPath);
      if (ts === null) continue;
      const datetime = file.replace(/\.json$/, '');
      captures.push({ ts, datetime, date, gifUrl: gifUrlFor(folder, code, date, datetime) });
    }
  }

  captures.sort((a, b) => a.ts - b.ts);
  return { icao: code, captures };
}

/**
 * Rebuild and persist `history.json` for a station. No-op when the station has
 * never been captured (avoids committing empty station directories).
 */
export function updateStationHistory(station: Station): RadarHistory | null {
  const root = stationDir(station.folder, station.code);
  if (!fs.existsSync(root)) return null;

  const history = buildStationHistory(station);
  const dest = historyJsonPath(station.folder, station.code);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, `${JSON.stringify(history, null, 2)}\n`);
  return history;
}

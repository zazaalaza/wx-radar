import fs from 'fs';
import { indexJsonPath } from '@/lib/shared/data-path';
import { compactUtcToIso } from '@/lib/shared/time-utils';
import { latestJsonPath } from '@/lib/weather-com/paths';
import { STATIONS } from '@/lib/weather-stations/stations';
import { LatestPointer } from '@/lib/weather-com/capture';
import { RadarIndex, RadarStation } from '@/lib/index/types';

function dataRepo(): { owner: string; repo: string; branch: string } {
  const repo = process.env.DATA_REPO ?? 'zazaalaza/wx-radar-data';
  const branch = process.env.DATA_BRANCH ?? 'main';
  const [owner, name] = repo.split('/');
  return { owner, repo: name, branch };
}

function gifUrlFor(folder: string, code: string, date: string, datetime: string): string {
  const { owner, repo, branch } = dataRepo();
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/stations/${folder}/${code}/${date}/gif/${datetime}.gif`;
}

function readPointer(folder: string, code: string): LatestPointer | null {
  try {
    const raw = fs.readFileSync(latestJsonPath(folder, code), 'utf-8');
    const parsed = JSON.parse(raw) as LatestPointer;
    return typeof parsed?.datetime === 'string' && typeof parsed?.date === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Rebuild the root index.json manifest from every station's latest.json.
 * Gives the UI and API a single file to read instead of one request per station.
 */
export function updateIndexJson(seriesTs: number | null): RadarIndex {
  const stations: RadarStation[] = [];

  for (const station of STATIONS) {
    const pointer = readPointer(station.folder, station.code);
    if (!pointer) continue;
    stations.push({
      icao: station.code,
      location: station.name,
      latitude: station.lat,
      longitude: station.lon,
      seriesTs: pointer.ts,
      startFrameUnixTimestamp: pointer.ftsFirst,
      endFrameUnixTimestamp: pointer.ftsLast,
      frameCount: pointer.frameCount,
      gifUrl: gifUrlFor(station.folder, station.code, pointer.date, pointer.datetime),
      updatedAt: compactUtcToIso(pointer.datetime),
    });
  }

  const index: RadarIndex = {
    updatedAt: new Date().toISOString(),
    seriesTs,
    stations,
  };

  fs.writeFileSync(indexJsonPath(), `${JSON.stringify(index, null, 2)}\n`);
  return index;
}

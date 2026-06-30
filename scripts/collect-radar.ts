import { STATIONS } from '@/lib/weather-stations/stations';
import { getErrorMessage } from '@/lib/shared/errors';
import { fetchSatradSeries } from '@/lib/weather-com/series';
import { captureStation, CaptureResult } from '@/lib/weather-com/capture';
import { updateIndexJson } from '@/lib/index/build';
import { updateStationHistory } from '@/lib/index/history';

const TAG = '[WX-RADAR]';

/**
 * One-shot satradFcst archiver tick. Designed to run from GitHub Actions cron:
 * fetch the global series, capture every station whose series changed, then
 * rebuild index.json. Stations with an unchanged series are skipped (no
 * download), so most ticks are cheap.
 *
 * Set WX_STATION_CODES (comma-separated ICAO list) to limit the run locally.
 */
async function main(): Promise<void> {
  const filter = process.env.WX_STATION_CODES?.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean);
  const stations = filter && filter.length > 0 ? STATIONS.filter((s) => filter.includes(s.code)) : STATIONS;

  console.log(`${TAG} Starting tick for ${stations.length} station(s).`);

  const series = await fetchSatradSeries();
  console.log(
    `${TAG} Series ts=${series.ts} frames=${series.fts.length} ` +
      `(${series.fts[0]} -> ${series.fts[series.fts.length - 1]}).`,
  );

  let saved = 0;
  let skipped = 0;
  let failed = 0;

  for (const station of stations) {
    let result: CaptureResult;
    try {
      result = await captureStation(station, series);
    } catch (err) {
      result = { station: station.name, icao: station.code, status: 'FAILED', message: getErrorMessage(err) };
    }

    switch (result.status) {
      case 'SUCCESS':
        saved++;
        console.log(`${TAG} SUCCESS ${result.icao} ${result.datetime} (${result.frameCount} frames).`);
        break;
      case 'SKIPPED':
        skipped++;
        break;
      case 'FAILED':
        failed++;
        console.error(`${TAG} FAILED ${result.icao}: ${result.message}`);
        break;
    }

    // Rebuild from disk every tick so the manifest is self-healing and backfills
    // any GIFs already present in the data repo (no-op for never-captured stations).
    updateStationHistory(station);
  }

  updateIndexJson(series.ts);

  console.log(`${TAG} Tick done — saved=${saved} skipped=${skipped} failed=${failed}.`);
}

main().catch((err) => {
  console.error(`${TAG} Tick aborted: ${getErrorMessage(err)}`);
  process.exit(1);
});

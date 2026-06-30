import { API_HOST, LANGUAGE, PRODUCT, REQUEST_HEADERS, SUN_V3_API_KEY } from '@/lib/weather-com/config';

/** Resolved timeline for one satradFcst model run. */
export interface SatradSeries {
  /** Model run / valid time (unix seconds) — advances when new data is published. */
  ts: number;
  /** Forecast valid times ordered oldest -> newest (playback order). */
  fts: number[];
}

interface SeriesEntry {
  ts: number;
  fts: number[];
}

interface SeriesResponse {
  seriesInfo?: {
    [product: string]: {
      series?: SeriesEntry[];
    };
  };
}

/**
 * Fetch the satradFcst timeline from the TileServer series endpoint.
 * Returns the latest series entry with fts sorted ascending for playback.
 */
export async function fetchSatradSeries(): Promise<SatradSeries> {
  const url =
    `https://${API_HOST}/v3/TileServer/series/productSet/PPAcore` +
    `?apiKey=${SUN_V3_API_KEY}&format=json&language=${LANGUAGE}&filter=${PRODUCT}`;

  const res = await fetch(url, { headers: REQUEST_HEADERS });
  if (!res.ok) {
    throw new Error(`series fetch failed: HTTP ${res.status}`);
  }

  const data = (await res.json()) as SeriesResponse;
  const series = data.seriesInfo?.[PRODUCT]?.series;
  if (!series || series.length === 0) {
    throw new Error(`series response missing seriesInfo.${PRODUCT}.series`);
  }

  // Pick the entry with the newest model run, then sort its fts ascending.
  const latest = series.reduce((acc, cur) => (cur.ts > acc.ts ? cur : acc), series[0]);
  if (typeof latest.ts !== 'number' || !Array.isArray(latest.fts) || latest.fts.length === 0) {
    throw new Error('series entry missing ts/fts');
  }

  const fts = [...latest.fts].sort((a, b) => a - b);
  return { ts: latest.ts, fts };
}

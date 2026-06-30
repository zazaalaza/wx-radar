import { NextResponse } from 'next/server';
import { readIndex } from '@/lib/index/read';
import { RadarStation } from '@/lib/index/types';
import { getErrorMessage } from '@/lib/shared/errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CACHE_HEADER = 'no-store, no-cache, must-revalidate';

/** Attach the absolute self-link to this station's history endpoint, keeping `updatedAt` last. */
function withHistoryUrl(station: RadarStation, origin: string): RadarStation {
  const { updatedAt, ...rest } = station;
  return {
    ...rest,
    gifUrlHistory: `${origin}/api/radar/history?code=${station.icao}`,
    updatedAt,
  };
}

/**
 * GET /api/radar            -> full index ({ updatedAt, seriesTs, stations[] })
 * GET /api/radar?code=KORD  -> single station metadata object
 */
export async function GET(request: Request) {
  try {
    const { origin, searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    const index = await readIndex();

    if (code) {
      const icao = code.toUpperCase();
      const station = index.stations.find((s) => s.icao === icao);
      if (!station) {
        return NextResponse.json({ error: `Unknown station code: ${icao}` }, { status: 404 });
      }
      return NextResponse.json(withHistoryUrl(station, origin), { headers: { 'Cache-Control': CACHE_HEADER } });
    }

    const body = { ...index, stations: index.stations.map((s) => withHistoryUrl(s, origin)) };
    return NextResponse.json(body, { headers: { 'Cache-Control': CACHE_HEADER } });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 502 });
  }
}

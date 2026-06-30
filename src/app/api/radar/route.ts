import { NextResponse } from 'next/server';
import { readIndex } from '@/lib/index/read';
import { getErrorMessage } from '@/lib/shared/errors';

export const runtime = 'nodejs';

const CACHE_HEADER = 'public, s-maxage=300, stale-while-revalidate=600';

/**
 * GET /api/radar            -> full index ({ updatedAt, seriesTs, stations[] })
 * GET /api/radar?code=KORD  -> single station metadata object
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    const index = await readIndex();

    if (code) {
      const icao = code.toUpperCase();
      const station = index.stations.find((s) => s.icao === icao);
      if (!station) {
        return NextResponse.json({ error: `Unknown station code: ${icao}` }, { status: 404 });
      }
      return NextResponse.json(station, { headers: { 'Cache-Control': CACHE_HEADER } });
    }

    return NextResponse.json(index, { headers: { 'Cache-Control': CACHE_HEADER } });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 502 });
  }
}

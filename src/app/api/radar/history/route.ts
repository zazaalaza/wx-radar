import { NextResponse } from 'next/server';
import { readHistory } from '@/lib/index/read';
import { getErrorMessage } from '@/lib/shared/errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CACHE_HEADER = 'no-store, no-cache, must-revalidate';

/**
 * GET /api/radar/history?code=KLGA
 *   -> { icao, captures: [{ ts, datetime, date, gifUrl }] } sorted ascending by ts.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    if (!code) {
      return NextResponse.json({ error: 'Missing required query param: code' }, { status: 400 });
    }

    const icao = code.toUpperCase();
    const history = await readHistory(icao);
    if (!history) {
      return NextResponse.json({ error: `Unknown station code: ${icao}` }, { status: 404 });
    }

    return NextResponse.json(history, { headers: { 'Cache-Control': CACHE_HEADER } });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 502 });
  }
}

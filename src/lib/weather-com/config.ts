/**
 * Configuration for the weather.com satradFcst radar archiver.
 *
 * The API key is the SUN_V3 client key used by weather.com's web maps. It must
 * be provided via the WEATHER_COM_API_KEY env var (GitHub Actions secret).
 */
function requireApiKey(): string {
  const key = process.env.WEATHER_COM_API_KEY;
  if (!key) {
    throw new Error('WEATHER_COM_API_KEY is not set (provide it via env var / GitHub secret).');
  }
  return key;
}

export const SUN_V3_API_KEY = requireApiKey();

export const API_HOST = 'api.weather.com';

/** Single-product archive equivalent of the interactive "Radar + Clouds" view. */
export const PRODUCT = 'satradFcst';

/** Basemap style baked into each pre-rendered JPG frame. */
export const MAP_STYLE = 'dark';

/** v2/maps/dynamic image geometry. */
export const IMAGE_WIDTH = 568;
export const IMAGE_HEIGHT = 320;
export const LOD = 6;

export const LANGUAGE = 'en-US';

/** Headers required for api.weather.com to return 200 server-side. */
export const REQUEST_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  Referer: 'https://weather.com/',
  Accept: 'application/json,image/jpeg,*/*',
};

/** Target total playback duration for the derived GIF. */
export const GIF_TOTAL_MS = 2000;

/** Max concurrent frame downloads per station (politeness vs throughput). */
export const FRAME_CONCURRENCY = 4;

/** Small delay between frame-download batches (ms). */
export const FRAME_BATCH_DELAY_MS = 100;

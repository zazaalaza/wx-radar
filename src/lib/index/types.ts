/** Public metadata for a single station's latest radar capture. */
export interface RadarStation {
  icao: string;
  /** Human-readable city/location name, e.g. "CHICAGO". */
  location: string;
  /** Station latitude (decimal degrees). */
  latitude: number;
  /** Station longitude (decimal degrees). */
  longitude: number;
  /** IANA timezone of the station, e.g. "America/Chicago". */
  timezone: string;
  /** Model run time (unix seconds) — when weather.com issued this forecast. */
  seriesTs: number;
  /** Valid time of the first frame in the GIF (unix seconds). */
  startFrameUnixTimestamp: number;
  /** Valid time of the last frame in the GIF (unix seconds). */
  endFrameUnixTimestamp: number;
  /** Number of frames composited into the GIF. */
  frameCount: number;
  gifUrl: string;
  /** ISO timestamp of when this capture was taken. */
  updatedAt: string;
}

/** Root manifest written to the data repo and served by /api/radar. */
export interface RadarIndex {
  /** ISO timestamp of the last index rebuild. */
  updatedAt: string;
  /** Current weather.com series model run (unix seconds), or null before any capture. */
  seriesTs: number | null;
  stations: RadarStation[];
}

/** A single archived capture in a station's history manifest. */
export interface RadarCapture {
  /** weather.com series model run (unix seconds) — when the forecast was issued. */
  ts: number;
  /** Compact UTC capture stamp, e.g. "20260630T133251Z". */
  datetime: string;
  /** Local date key (station timezone), e.g. "20260630". */
  date: string;
  gifUrl: string;
}

/** Per-station history manifest served by /api/radar/history. */
export interface RadarHistory {
  icao: string;
  /** All captures for the station, sorted ascending by `ts`. */
  captures: RadarCapture[];
}

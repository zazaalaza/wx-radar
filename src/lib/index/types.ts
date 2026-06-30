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

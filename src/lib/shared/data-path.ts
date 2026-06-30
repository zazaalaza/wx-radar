import path from 'path';

/**
 * Root of the wx-radar-data working tree.
 *
 * In GitHub Actions the data repo is checked out into `$DATA_DIR`; locally it
 * defaults to `./data` (clone wx-radar-data there). The collector writes
 * `index.json` at this root and per-station files under `stations/`.
 */
export function dataRoot(): string {
  return process.env.DATA_DIR ?? path.join(process.cwd(), 'data');
}

export function stationsRoot(): string {
  return path.join(dataRoot(), 'stations');
}

export function indexJsonPath(): string {
  return path.join(dataRoot(), 'index.json');
}

import path from 'path';
import { stationsRoot } from '@/lib/shared/data-path';
import { PRODUCT } from '@/lib/weather-com/config';

/**
 * On-disk layout inside the wx-radar-data working tree:
 *
 *   stations/[folder]/[code]/
 *     latest.json
 *     [date]/
 *       meta/[datetime].json
 *       raw/[datetime]/
 *         satradFcst/frame.00.jpg, frame.01.jpg, ...   (transient; deleted after GIF)
 *       gif/[datetime].gif
 *
 * [folder] = station.folder, [code] = station.code (ICAO),
 * [date]   = local YYYYMMDD, [datetime] = UTC compact YYYYMMDDTHHMMSSZ.
 */

export function stationDir(folder: string, code: string): string {
  return path.join(stationsRoot(), folder, code);
}

export function latestJsonPath(folder: string, code: string): string {
  return path.join(stationDir(folder, code), 'latest.json');
}

export function historyJsonPath(folder: string, code: string): string {
  return path.join(stationDir(folder, code), 'history.json');
}

export function rawCaptureDir(folder: string, code: string, date: string, datetime: string): string {
  return path.join(stationDir(folder, code), date, 'raw', datetime);
}

export function framesDir(folder: string, code: string, date: string, datetime: string): string {
  return path.join(rawCaptureDir(folder, code, date, datetime), PRODUCT);
}

export function metaJsonPath(folder: string, code: string, date: string, datetime: string): string {
  return path.join(stationDir(folder, code), date, 'meta', `${datetime}.json`);
}

export function gifPath(folder: string, code: string, date: string, datetime: string): string {
  return path.join(stationDir(folder, code), date, 'gif', `${datetime}.gif`);
}

/** Zero-padded frame filename, e.g. frame.00.jpg (matches ffmpeg %02d pattern). */
export function frameFileName(index: number): string {
  return `frame.${String(index).padStart(2, '0')}.jpg`;
}

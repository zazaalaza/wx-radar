/**
 * weather.com's v2/maps/dynamic endpoint rejects raw lat/lon (HTTP 400).
 * Coordinates must be snapped to whole degrees with a `.0` suffix per axis.
 *
 *   weatherComGeocode(41.979, -87.905)  => "42.0,-88.0"
 *   weatherComGeocode(-41.327, 174.805) => "-41.0,175.0"
 */
export function weatherComGeocode(lat: number, lon: number): string {
  return `${Math.round(lat)}.0,${Math.round(lon)}.0`;
}

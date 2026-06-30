export const getLocalDateComponents = (t: number, timezone: string) => {
  const formatter = new Intl.DateTimeFormat('en-US', { timeZone: timezone, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false });
  const parts = formatter.formatToParts(new Date(t * 1000));
  const p: Partial<Record<Intl.DateTimeFormatPartTypes, string>> = {};
  parts.forEach(part => p[part.type] = part.value);
  return { y: parseInt(p.year ?? ''), m: parseInt(p.month ?? '') - 1, d: parseInt(p.day ?? ''), h: parseInt(p.hour ?? ''), min: parseInt(p.minute ?? ''), s: parseInt(p.second ?? '') };
};

/** Convert unix timestamp to YYYYMMDD date key in the given timezone. */
export const toDateKey = (t: number, timezone: string): string => {
  const comps = getLocalDateComponents(t, timezone);
  return `${comps.y}${String(comps.m + 1).padStart(2, '0')}${String(comps.d).padStart(2, '0')}`;
};

/**
 * Expand a compact UTC capture stamp into a standard ISO string.
 *   "20260630T163000Z" -> "2026-06-30T16:30:00Z"
 * Returns the input unchanged if it does not match the expected format.
 */
export const compactUtcToIso = (datetime: string): string => {
  const m = datetime.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  if (!m) return datetime;
  const [, y, mo, d, h, min, s] = m;
  return `${y}-${mo}-${d}T${h}:${min}:${s}Z`;
};

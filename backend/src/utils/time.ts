export const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_TZ_OFFSET_MINUTES = 14 * 60;

export function parseTzOffset(value: unknown): number {
  const tz = Number(value);
  return Number.isFinite(tz) && Math.abs(tz) <= MAX_TZ_OFFSET_MINUTES ? tz : 0;
}

export function localDay(date: Date, tzOffset: number): string {
  return new Date(date.getTime() - tzOffset * 60_000).toISOString().slice(0, 10);
}

export function localMidnight(day: string, tzOffset: number): Date {
  return new Date(Date.parse(day) + tzOffset * 60_000);
}

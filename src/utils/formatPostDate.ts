/**
 * "9 September, 2026" — the date format the design prints under every title.
 *
 * `en-GB` gives day-first without an ordinal suffix; the comma before the year
 * is not something Intl will produce, so the parts are assembled by hand.
 * Formatting is pinned to UTC because `publishedDate` is a date-only value
 * stored at midnight UTC — rendering it in a negative-offset timezone would
 * otherwise show the previous day.
 */
const formatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export default function formatPostDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const parts = formatter.formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  return `${part("day")} ${part("month")}, ${part("year")}`;
}

/** The year a post is filed under on the index — also UTC, for the same reason. */
export function postYear(value: string | Date): number {
  const date = value instanceof Date ? value : new Date(value);
  return date.getUTCFullYear();
}

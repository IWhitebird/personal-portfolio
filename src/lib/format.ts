const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

/** Splits "2026-08" / "2026-08-14" into numbers, defaulting anything absent to 1. */
function dateParts(iso: string): { year: number; month: number; day: number } {
  const [year = 0, month = 1, day = 1] = iso.split("-").map(Number);
  return { year, month, day };
}

const monthName = (month: number) => MONTHS[Math.min(11, Math.max(0, month - 1))];

/** "2025-07" → "Jul 2025" */
export function formatMonth(ym: string): string {
  const { year, month } = dateParts(ym);
  return `${monthName(month)} ${year}`;
}

/** "2023-12", "2025-07" → "Dec 2023 – Jul 2025"; null end → "Present" */
export function formatRange(start: string, end: string | null): string {
  return `${formatMonth(start)} – ${end ? formatMonth(end) : "Present"}`;
}

/** Whole-month duration as "1 yr 2 mo" / "8 mo". `end` null means today. */
export function formatDuration(start: string, end: string | null, now = new Date()): string {
  const from = dateParts(start);
  const to = end ? dateParts(end) : { year: now.getFullYear(), month: now.getMonth() + 1, day: 1 };
  const months = Math.max(1, (to.year - from.year) * 12 + (to.month - from.month) + 1);
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts: string[] = [];
  if (years) parts.push(`${years} yr${years > 1 ? "s" : ""}`);
  if (rest) parts.push(`${rest} mo`);
  return parts.join(" ");
}

/** "2026-08-14" → "14 Aug 2026" */
export function formatPostDate(isoDate: string): string {
  const { year, month, day } = dateParts(isoDate);
  return `${day} ${monthName(month)} ${year}`;
}

/** ISO timestamp → "8 Sep 2026" */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${monthName(d.getMonth() + 1)} ${d.getFullYear()}`;
}

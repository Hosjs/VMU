export function isoWeekFromDate(date: Date): { iso_year: number; iso_week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { iso_year: d.getUTCFullYear(), iso_week: week };
}

export function isoWeekRange(year: number, week: number): { start: Date; end: Date } {
  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const day = simple.getUTCDay();
  const start = new Date(simple);
  start.setUTCDate(simple.getUTCDate() + (day <= 4 ? 1 - day : 8 - day));
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  return { start, end };
}

export function formatIsoWeekLabel(year: number, week: number): string {
  const { start, end } = isoWeekRange(year, week);
  const fmt = (d: Date) => `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  return `Tuần ISO ${week}/${year} (${fmt(start)} - ${fmt(end)})`;
}

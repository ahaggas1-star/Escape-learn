// منطق نقي لحساب أطول سلسلة أيام متتالية من النشاط — قابل للاختبار.

// يقبل قائمة طوابع زمنية (ISO)، ويعيد أطول عدد أيام متتالية فريدة.
export function longestStreak(dates: string[]): number {
  const days = Array.from(new Set(dates.map((d) => d.slice(0, 10)))).sort();
  if (days.length === 0) return 0;
  let best = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1] + "T00:00:00Z").getTime();
    const cur = new Date(days[i] + "T00:00:00Z").getTime();
    const diffDays = Math.round((cur - prev) / 86400000);
    run = diffDays === 1 ? run + 1 : 1;
    if (run > best) best = run;
  }
  return best;
}

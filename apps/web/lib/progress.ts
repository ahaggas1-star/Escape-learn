// منطق نقي لحساب المستوى والتقدّم من XP — قابل للاختبار بلا اعتماد على الخادم.

export interface Level {
  id: string;
  key: string;
  label_ar: string;
  min_xp: number;
  sort_order: number;
}

export interface LevelProgress {
  level: Level | null;
  nextLevel: Level | null;
  progressPct: number; // 0–100 نحو المستوى التالي
  xpIntoLevel: number;
  xpForNextLevel: number | null;
}

// يحسب المستوى الحالي والتقدّم نحو التالي. `levels` تُرتَّب تصاعديًا حسب min_xp.
export function computeLevelProgress(totalXp: number, levels: Level[]): LevelProgress {
  const sorted = [...levels].sort((a, b) => a.min_xp - b.min_xp);

  let level: Level | null = null;
  let nextLevel: Level | null = null;
  for (let i = 0; i < sorted.length; i++) {
    if (totalXp >= sorted[i].min_xp) {
      level = sorted[i];
      nextLevel = sorted[i + 1] ?? null;
    }
  }
  if (!level && sorted.length > 0) nextLevel = sorted[0];

  const base = level?.min_xp ?? 0;
  const xpIntoLevel = totalXp - base;
  const xpForNextLevel = nextLevel ? nextLevel.min_xp - base : null;
  const progressPct =
    xpForNextLevel && xpForNextLevel > 0
      ? Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100))
      : 100;

  return { level, nextLevel, progressPct, xpIntoLevel, xpForNextLevel };
}

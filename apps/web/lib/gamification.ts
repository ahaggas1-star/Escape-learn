import { createClient } from "@/lib/supabase/server";

export interface Level {
  id: string;
  key: string;
  label_ar: string;
  min_xp: number;
  sort_order: number;
}

export interface ChildProgress {
  totalXp: number;
  level: Level | null;
  nextLevel: Level | null;
  // نسبة التقدم نحو المستوى التالي (0–100)
  progressPct: number;
  xpIntoLevel: number;
  xpForNextLevel: number | null;
}

// يحسب XP الإجمالي من سجل الأحداث (xp_events) — وليس من رقم مخزّن.
export async function getChildProgress(childId: string): Promise<ChildProgress> {
  const supabase = createClient();

  const [{ data: events }, { data: levelsData }] = await Promise.all([
    supabase.from("xp_events").select("amount").eq("child_id", childId),
    supabase.from("levels").select("*").order("min_xp", { ascending: true }),
  ]);

  const totalXp = (events ?? []).reduce(
    (sum, e: { amount: number }) => sum + (e.amount ?? 0),
    0
  );
  const levels = (levelsData ?? []) as Level[];

  let level: Level | null = null;
  let nextLevel: Level | null = null;
  for (let i = 0; i < levels.length; i++) {
    if (totalXp >= levels[i].min_xp) {
      level = levels[i];
      nextLevel = levels[i + 1] ?? null;
    }
  }
  // إن لم يبلغ أول مستوى (لا يحدث عادة لأن أول مستوى min_xp=0)
  if (!level && levels.length > 0) {
    nextLevel = levels[0];
  }

  const base = level?.min_xp ?? 0;
  const xpIntoLevel = totalXp - base;
  const xpForNextLevel = nextLevel ? nextLevel.min_xp - base : null;
  const progressPct =
    xpForNextLevel && xpForNextLevel > 0
      ? Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100))
      : 100;

  return { totalXp, level, nextLevel, progressPct, xpIntoLevel, xpForNextLevel };
}

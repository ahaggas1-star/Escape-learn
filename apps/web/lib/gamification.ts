import { createClient } from "@/lib/supabase/server";
import { computeLevelProgress, type Level, type LevelProgress } from "@/lib/progress";

export type { Level } from "@/lib/progress";

export interface ChildProgress extends LevelProgress {
  totalXp: number;
}

// يحسب XP الإجمالي من سجل الأحداث (xp_events) — وليس من رقم مخزّن — ثم المستوى/التقدّم.
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

  return { totalXp, ...computeLevelProgress(totalXp, levels) };
}

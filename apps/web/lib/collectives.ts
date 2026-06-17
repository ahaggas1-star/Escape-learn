import { createClient } from "@/lib/supabase/server";
import type { Collective, ChildRank } from "@/lib/collectives-shared";

export type { Collective, ChildRank } from "@/lib/collectives-shared";
export { cheer } from "@/lib/collectives-shared";

export async function getFamilyCollectives(): Promise<Collective[]> {
  const supabase = createClient();
  const { data } = await supabase.rpc("family_collectives");
  const rows = (data as Omit<Collective, "pct">[]) ?? [];
  return rows.map((r) => ({
    ...r,
    pct: r.target > 0 ? Math.min(100, Math.round((r.current / r.target) * 100)) : 0,
  }));
}

export async function getChildrenLeaderboard(): Promise<ChildRank[]> {
  const supabase = createClient();
  const { data } = await supabase.rpc("children_leaderboard", { p_limit: 20 });
  return (data as ChildRank[]) ?? [];
}

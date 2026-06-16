import { createClient } from "@/lib/supabase/server";

export interface LeaderRow {
  family_id: string;
  total_xp: number;
  approved_tasks: number;
  rank: number;
}

export interface Leaderboard {
  rows: LeaderRow[];
  total: number;
  self: LeaderRow | null;
  // أعلى نسبة مئوية تقع فيها الأسرة (مثال: 20 يعني ضمن أعلى 20%).
  selfTopPercent: number | null;
}

// ترتيب الأسر — مجهول الهوية. يميّز أسرة المستخدم الحالي فقط.
export async function getLeaderboard(ownFamilyId: string | null): Promise<Leaderboard> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("family_leaderboard");
  if (error || !data) return { rows: [], total: 0, self: null, selfTopPercent: null };

  const rows = (data as LeaderRow[]) ?? [];
  const total = rows.length;
  const self = ownFamilyId ? rows.find((r) => r.family_id === ownFamilyId) ?? null : null;
  const selfTopPercent =
    self && total > 0 ? Math.max(1, Math.round((self.rank / total) * 100)) : null;

  return { rows, total, self, selfTopPercent };
}

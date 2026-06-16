import { createClient } from "@/lib/supabase/server";
import { getChildProgress, type ChildProgress } from "@/lib/gamification";

const today = () => new Date().toISOString().slice(0, 10);

export interface ChildReport {
  progress: ChildProgress;
  goalsActive: number;
  tasksTotal: number;
  tasksApproved: number;
  tasksLate: number;
  completionRate: number;
  badges: number;
  achievements: number;
  topValue: string | null;
}

type AssignedForReport = {
  status: string;
  end_date: string | null;
  tasks: { core_value_id: string | null } | { core_value_id: string | null }[] | null;
};

// تقرير الابن — مقيّد بـ RLS (ولي الأمر يرى أبناءه فقط).
export async function getChildReport(childId: string): Promise<ChildReport> {
  const supabase = createClient();
  const d = today();

  const [progress, { data: atData }, { data: goalsActive }, { count: badges }, { count: achievements }, { data: coreVals }] =
    await Promise.all([
      getChildProgress(childId),
      supabase
        .from("assigned_tasks")
        .select("status, end_date, tasks(core_value_id)")
        .eq("child_id", childId),
      supabase.from("goals").select("id").eq("child_id", childId).eq("status", "active"),
      supabase.from("child_badges").select("id", { count: "exact", head: true }).eq("child_id", childId),
      supabase.from("child_achievements").select("id", { count: "exact", head: true }).eq("child_id", childId),
      supabase.from("core_values").select("id, label_ar"),
    ]);

  const rows = (atData ?? []) as AssignedForReport[];
  const tasksTotal = rows.length;
  const tasksApproved = rows.filter((r) => r.status === "approved").length;
  const tasksLate = rows.filter(
    (r) => r.end_date && r.end_date < d && r.status !== "approved"
  ).length;
  const completionRate = tasksTotal === 0 ? 0 : Math.round((tasksApproved / tasksTotal) * 100);

  // أكثر قيمة تفاعلت (الأكثر مهامًا معتمدة).
  const valueCount = new Map<string, number>();
  for (const r of rows) {
    if (r.status !== "approved") continue;
    const t = Array.isArray(r.tasks) ? r.tasks[0] : r.tasks;
    if (t?.core_value_id) valueCount.set(t.core_value_id, (valueCount.get(t.core_value_id) ?? 0) + 1);
  }
  let topValueId: string | null = null;
  let max = 0;
  for (const [id, c] of valueCount) if (c > max) { max = c; topValueId = id; }
  const labels = new Map((coreVals ?? []).map((c: { id: string; label_ar: string }) => [c.id, c.label_ar]));
  const topValue = topValueId ? labels.get(topValueId) ?? null : null;

  return {
    progress,
    goalsActive: goalsActive?.length ?? 0,
    tasksTotal,
    tasksApproved,
    tasksLate,
    completionRate,
    badges: badges ?? 0,
    achievements: achievements ?? 0,
    topValue,
  };
}

export interface FamilyReport {
  childrenCount: number;
  goalsActive: number;
  tasksTotal: number;
  tasksApproved: number;
  completionRate: number;
  approvedLast7: number;
  challenges: number;
  topValues: { value: string; count: number }[];
}

type FamilyAssigned = { status: string; created_at: string };

// تقرير الأسرة — مقيّد بـ RLS.
export async function getFamilyReport(familyId: string): Promise<FamilyReport> {
  const supabase = createClient();
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const [{ count: childrenCount }, { data: goals }, { data: assigned }, { count: challenges }, { data: coreVals }] =
    await Promise.all([
      supabase.from("children").select("id", { count: "exact", head: true }).eq("family_id", familyId),
      supabase.from("goals").select("core_value_id, status").eq("family_id", familyId),
      supabase
        .from("assigned_tasks")
        .select("status, created_at, children!inner(family_id)")
        .eq("children.family_id", familyId),
      supabase.from("family_challenges").select("id", { count: "exact", head: true }).eq("family_id", familyId),
      supabase.from("core_values").select("id, label_ar"),
    ]);

  const goalRows = (goals ?? []) as { core_value_id: string; status: string }[];
  const atRows = (assigned ?? []) as FamilyAssigned[];

  const tasksTotal = atRows.length;
  const tasksApproved = atRows.filter((r) => r.status === "approved").length;
  const completionRate = tasksTotal === 0 ? 0 : Math.round((tasksApproved / tasksTotal) * 100);
  const approvedLast7 = atRows.filter((r) => r.status === "approved" && r.created_at >= weekAgo).length;
  const goalsActive = goalRows.filter((g) => g.status === "active").length;

  const labels = new Map((coreVals ?? []).map((c: { id: string; label_ar: string }) => [c.id, c.label_ar]));
  const valueCount = new Map<string, number>();
  for (const g of goalRows) valueCount.set(g.core_value_id, (valueCount.get(g.core_value_id) ?? 0) + 1);
  const topValues = Array.from(valueCount.entries())
    .map(([id, count]) => ({ value: labels.get(id) ?? "—", count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  return {
    childrenCount: childrenCount ?? 0,
    goalsActive,
    tasksTotal,
    tasksApproved,
    completionRate,
    approvedLast7,
    challenges: challenges ?? 0,
    topValues,
  };
}

export interface PlatformMetrics {
  families: number;
  children: number;
  goals: number;
  goals_custom: number;
  tasks_assigned: number;
  tasks_completed: number;
  reward_opens: number;
  badges_awarded: number;
  completion_rate: number;
  top_values: { value: string; goals: number }[];
}

// مؤشرات عامة مجهولة الهوية عبر RPC آمنة (تجميع فقط).
export async function getPlatformMetrics(): Promise<PlatformMetrics | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("platform_metrics");
  if (error || !data) return null;
  return data as PlatformMetrics;
}

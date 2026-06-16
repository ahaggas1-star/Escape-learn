import { createClient } from "@/lib/supabase/server";

// =============================================================================
// محرّك التلعيب الآمن
// المبدأ: لا تُمنح شارة/إنجاز/صندوق إلا بعد إنجاز حقيقي وبشرط واضح (لا عشوائية).
// يُستدعى بعد منح XP (إكمال بلا اعتماد، أو اعتماد ولي الأمر).
// =============================================================================

// قواعد الشارات: مفتاح الشارة → الشرط (نوع القيمة + المفتاح + العتبة).
type BadgeRule =
  | { badge: string; kind: "core"; key: string; threshold: number }
  | { badge: string; kind: "sub"; key: string; threshold: number };

const BADGE_RULES: BadgeRule[] = [
  { badge: "respect_badge", kind: "core", key: "respect", threshold: 5 },
  { badge: "cooperation_badge", kind: "core", key: "cooperation", threshold: 5 },
  { badge: "care_badge", kind: "core", key: "care", threshold: 5 },
  { badge: "commitment_badge", kind: "core", key: "commitment", threshold: 5 },
  { badge: "organization_badge", kind: "sub", key: "organization", threshold: 3 },
  { badge: "generosity_badge", kind: "sub", key: "generosity", threshold: 3 },
  { badge: "honesty_badge", kind: "sub", key: "honesty", threshold: 3 },
  { badge: "appreciation_badge", kind: "sub", key: "appreciation", threshold: 5 },
];

type ApprovedTask = {
  tasks:
    | { core_value_id: string | null; sub_value_id: string | null }
    | { core_value_id: string | null; sub_value_id: string | null }[]
    | null;
};

// يضمن وجود صندوق مكافآت افتراضي للأسرة مع عناصره، ويعيد معرّفه.
async function ensureFamilyRewardBox(familyId: string): Promise<string | null> {
  const supabase = createClient();
  const { data: existing } = await supabase
    .from("reward_boxes")
    .select("id")
    .eq("family_id", familyId)
    .limit(1)
    .maybeSingle();
  if (existing) return existing.id;

  const { data: box } = await supabase
    .from("reward_boxes")
    .insert({
      family_id: familyId,
      title_ar: "صندوق الإنجاز",
      unlock_condition_ar: "يُفتح بعد تحقيق إنجاز حقيقي (شارة أو إنجاز جديد).",
    })
    .select("id")
    .single();
  if (!box) return null;

  await supabase.from("reward_box_items").insert([
    { reward_box_id: box.id, kind: "message", label_ar: "رسالة تشجيع: أحسنت! استمر في الغرس 🌱", sort_order: 1 },
    { reward_box_id: box.id, kind: "xp", label_ar: "‎+10 XP", payload: { xp: 10 }, sort_order: 2 },
    { reward_box_id: box.id, kind: "appreciation", label_ar: "بطاقة تقدير من العائلة", sort_order: 3 },
  ]);

  return box.id;
}

// يمنح عددًا من صناديق المكافآت "المتاحة" للابن (واحد لكل إنجاز/شارة جديدة).
async function grantRewardBoxes(familyId: string, childId: string, count: number) {
  if (count <= 0) return;
  const boxId = await ensureFamilyRewardBox(familyId);
  if (!boxId) return;
  const supabase = createClient();
  const rows = Array.from({ length: count }, () => ({
    reward_box_id: boxId,
    child_id: childId,
    status: "available" as const,
  }));
  await supabase.from("reward_box_openings").insert(rows);
}

// أطول سلسلة أيام متتالية من النشاط (لإنجاز "5 أيام متتالية").
function longestStreak(dates: string[]): number {
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

// التقييم الكامل لابن: شارات + إنجازات + صناديق متاحة. آمن للاستدعاء المتكرر (idempotent).
export async function evaluateChild(childId: string): Promise<void> {
  const supabase = createClient();

  const [{ data: child }, { data: approved }, { data: coreVals }, { data: subVals }, { data: badges }, { data: achievements }, { data: completedXp }, { count: challengeXp }] =
    await Promise.all([
      supabase.from("children").select("family_id").eq("id", childId).maybeSingle(),
      supabase
        .from("assigned_tasks")
        .select("tasks(core_value_id, sub_value_id)")
        .eq("child_id", childId)
        .eq("status", "approved"),
      supabase.from("core_values").select("id, key"),
      supabase.from("sub_values").select("id, key"),
      supabase.from("badges").select("id, key"),
      supabase.from("achievements").select("id, key"),
      supabase
        .from("xp_events")
        .select("created_at")
        .eq("child_id", childId)
        .eq("reason_key", "task_completed"),
      supabase
        .from("xp_events")
        .select("id", { count: "exact", head: true })
        .eq("child_id", childId)
        .eq("reason_key", "family_challenge"),
    ]);

  if (!child) return;
  const familyId = child.family_id as string;

  // عدّ المهام المعتمدة لكل قيمة رئيسية/فرعية.
  const coreCount = new Map<string, number>();
  const subCount = new Map<string, number>();
  const rows = (approved ?? []) as ApprovedTask[];
  let approvedTotal = 0;
  for (const r of rows) {
    const t = Array.isArray(r.tasks) ? r.tasks[0] : r.tasks;
    if (!t) continue;
    approvedTotal++;
    if (t.core_value_id) coreCount.set(t.core_value_id, (coreCount.get(t.core_value_id) ?? 0) + 1);
    if (t.sub_value_id) subCount.set(t.sub_value_id, (subCount.get(t.sub_value_id) ?? 0) + 1);
  }

  const coreKeyToId = new Map((coreVals ?? []).map((c: { id: string; key: string }) => [c.key, c.id]));
  const subKeyToId = new Map((subVals ?? []).map((s: { id: string; key: string }) => [s.key, s.id]));
  const badgeKeyToId = new Map((badges ?? []).map((b: { id: string; key: string }) => [b.key, b.id]));
  const achKeyToId = new Map((achievements ?? []).map((a: { id: string; key: string }) => [a.key, a.id]));

  // الشارات المستحقّة.
  const earnedBadgeIds: string[] = [];
  for (const rule of BADGE_RULES) {
    const id = rule.kind === "core" ? coreKeyToId.get(rule.key) : subKeyToId.get(rule.key);
    if (!id) continue;
    const count = rule.kind === "core" ? coreCount.get(id) ?? 0 : subCount.get(id) ?? 0;
    if (count >= rule.threshold) {
      const badgeId = badgeKeyToId.get(rule.badge);
      if (badgeId) earnedBadgeIds.push(badgeId);
    }
  }

  // الإنجازات المستحقّة.
  const streak = longestStreak((completedXp ?? []).map((e: { created_at: string }) => e.created_at));
  const earnedAchKeys: string[] = [];
  if (approvedTotal >= 1) earnedAchKeys.push("first_task");
  if (streak >= 5) earnedAchKeys.push("streak_5");
  if ((challengeXp ?? 0) >= 1) earnedAchKeys.push("first_challenge");
  // أول هدف مكتمل: هدف للابن جميع مهامه معتمدة (وله مهمة واحدة على الأقل).
  if (await hasCompletedGoal(childId)) earnedAchKeys.push("first_goal");
  const earnedAchIds = earnedAchKeys
    .map((k) => achKeyToId.get(k))
    .filter((v): v is string => Boolean(v));

  // منح الشارات (idempotent) — الجديد فقط يُعاد.
  let newGrants = 0;
  if (earnedBadgeIds.length > 0) {
    const { data: inserted } = await supabase
      .from("child_badges")
      .upsert(
        earnedBadgeIds.map((badge_id) => ({ child_id: childId, badge_id })),
        { onConflict: "child_id,badge_id", ignoreDuplicates: true }
      )
      .select("id");
    newGrants += inserted?.length ?? 0;
  }
  if (earnedAchIds.length > 0) {
    const { data: inserted } = await supabase
      .from("child_achievements")
      .upsert(
        earnedAchIds.map((achievement_id) => ({ child_id: childId, achievement_id })),
        { onConflict: "child_id,achievement_id", ignoreDuplicates: true }
      )
      .select("id");
    newGrants += inserted?.length ?? 0;
  }

  // صندوق مكافأة متاح لكل إنجاز/شارة جديدة.
  await grantRewardBoxes(familyId, childId, newGrants);

  // إكمال الأهداف التي اكتملت كل مهامها (تحديث الحالة).
  await markCompletedGoals(childId);
}

// يحدّث حالة الأهداف النشطة التي اعتُمدت كل مهامها إلى "مكتمل".
async function markCompletedGoals(childId: string): Promise<void> {
  const supabase = createClient();
  const { data: goals } = await supabase
    .from("goals")
    .select("id")
    .eq("child_id", childId)
    .eq("status", "active");
  for (const g of goals ?? []) {
    const { data: tasks } = await supabase
      .from("tasks")
      .select("id, assigned_tasks(status)")
      .eq("goal_id", g.id);
    const list = tasks ?? [];
    if (list.length === 0) continue;
    const allApproved = list.every((t: { assigned_tasks: { status: string }[] }) => {
      const a = t.assigned_tasks ?? [];
      return a.length > 0 && a.every((x) => x.status === "approved");
    });
    if (allApproved) {
      await supabase.from("goals").update({ status: "completed" }).eq("id", g.id);
    }
  }
}

// هل للابن هدف واحد على الأقل جميع مهامه المسندة معتمدة؟
async function hasCompletedGoal(childId: string): Promise<boolean> {
  const supabase = createClient();
  const { data: goals } = await supabase
    .from("goals")
    .select("id")
    .eq("child_id", childId);
  for (const g of goals ?? []) {
    const { data: tasks } = await supabase
      .from("tasks")
      .select("id, assigned_tasks(status)")
      .eq("goal_id", g.id);
    const list = tasks ?? [];
    if (list.length === 0) continue;
    const allApproved = list.every((t: { assigned_tasks: { status: string }[] }) => {
      const a = t.assigned_tasks ?? [];
      return a.length > 0 && a.every((x) => x.status === "approved");
    });
    if (allApproved) return true;
  }
  return false;
}

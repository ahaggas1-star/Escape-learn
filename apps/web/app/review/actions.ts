"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { evaluateChild } from "@/lib/gamification-engine";

type ReviewKind = "approve" | "reject" | "redo";

const STATUS: Record<ReviewKind, string> = {
  approve: "approved",
  reject: "rejected",
  redo: "redo_requested",
};
const ACTION: Record<ReviewKind, string> = {
  approve: "approved",
  reject: "rejected",
  redo: "redo",
};

// مراجعة ولي الأمر لإكمال مهمة: اعتماد / رفض / إعادة، مع XP إضافي اختياري.
export async function reviewCompletion(_prev: unknown, formData: FormData) {
  const completionId = String(formData.get("completion_id") ?? "");
  const kind = String(formData.get("kind") ?? "") as ReviewKind;
  const comment = String(formData.get("comment") ?? "").trim();
  const bonusXp = Math.max(0, Number(formData.get("bonus_xp") ?? 0) || 0);

  if (!completionId || !STATUS[kind]) return { error: "إجراء غير صحيح." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: comp } = await supabase
    .from("task_completions")
    .select("id, child_id, assigned_task_id, assigned_tasks(tasks(base_xp))")
    .eq("id", completionId)
    .maybeSingle();
  if (!comp) return { error: "السجل غير موجود." };

  const at = Array.isArray(comp.assigned_tasks)
    ? comp.assigned_tasks[0]
    : comp.assigned_tasks;
  const taskObj = at ? (Array.isArray(at.tasks) ? at.tasks[0] : at.tasks) : null;
  const baseXp = taskObj?.base_xp ?? 0;

  // سجل المراجعة.
  await supabase.from("guardian_reviews").insert({
    task_completion_id: comp.id,
    reviewer_id: user.id,
    action: ACTION[kind],
    bonus_xp: kind === "approve" ? bonusXp : 0,
    comment_ar: comment || null,
  });

  // حدّث حالة المهمة المسندة.
  await supabase
    .from("assigned_tasks")
    .update({ status: STATUS[kind], updated_at: new Date().toISOString() })
    .eq("id", comp.assigned_task_id);

  // عند الاعتماد: امنح XP (الأساسي + الإضافي) كأحداث منفصلة بأسباب واضحة.
  if (kind === "approve") {
    const events: {
      child_id: string;
      amount: number;
      reason_key: string;
      source_table: string;
      source_id: string;
    }[] = [];
    if (baseXp > 0)
      events.push({
        child_id: comp.child_id,
        amount: baseXp,
        reason_key: "task_completed",
        source_table: "assigned_tasks",
        source_id: comp.assigned_task_id,
      });
    if (bonusXp > 0)
      events.push({
        child_id: comp.child_id,
        amount: bonusXp,
        reason_key: "guardian_bonus",
        source_table: "guardian_reviews",
        source_id: comp.id,
      });
    if (events.length > 0) await supabase.from("xp_events").insert(events);
    // تقييم الشارات/الإنجازات/الصناديق بعد الاعتماد ومنح XP.
    await evaluateChild(comp.child_id);
  }

  revalidatePath("/review");
  revalidatePath(`/children/${comp.child_id}`);
  return { error: null };
}

// اعتماد كل المهام المنتظرة دفعة واحدة (تقليل الخطوات) — بالنقاط الأساسية فقط.
export async function approveAllPending(_prev: unknown, _formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS يقصر النتائج على أبناء أسرة المستخدم.
  const { data: comps } = await supabase
    .from("task_completions")
    .select("id, child_id, assigned_task_id, assigned_tasks!inner(status, tasks(base_xp))")
    .eq("assigned_tasks.status", "submitted");

  const rows = (comps ?? []) as unknown as {
    id: string;
    child_id: string;
    assigned_task_id: string;
    assigned_tasks: { tasks: { base_xp: number } | { base_xp: number }[] } | { tasks: { base_xp: number } | { base_xp: number }[] }[];
  }[];
  if (rows.length === 0) return { error: null, info: "لا توجد مهام بانتظار الاعتماد." };

  const children = new Set<string>();
  for (const r of rows) {
    const at = Array.isArray(r.assigned_tasks) ? r.assigned_tasks[0] : r.assigned_tasks;
    const taskObj = at ? (Array.isArray(at.tasks) ? at.tasks[0] : at.tasks) : null;
    const baseXp = taskObj?.base_xp ?? 0;

    await supabase.from("guardian_reviews").insert({
      task_completion_id: r.id,
      reviewer_id: user.id,
      action: "approved",
      bonus_xp: 0,
      comment_ar: null,
    });
    await supabase
      .from("assigned_tasks")
      .update({ status: "approved", updated_at: new Date().toISOString() })
      .eq("id", r.assigned_task_id);
    if (baseXp > 0) {
      await supabase.from("xp_events").insert({
        child_id: r.child_id,
        amount: baseXp,
        reason_key: "task_completed",
        source_table: "assigned_tasks",
        source_id: r.assigned_task_id,
      });
    }
    children.add(r.child_id);
  }

  // تقييم الشارات/الإنجازات لكل ابن مرة واحدة بعد الاعتماد الجماعي.
  for (const childId of children) {
    await evaluateChild(childId);
    revalidatePath(`/children/${childId}`);
  }

  revalidatePath("/review");
  return { error: null, info: `تم اعتماد ${rows.length} مهمة.` };
}

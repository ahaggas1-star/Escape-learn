"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// الابن يُكمل مهمة. RLS يضمن أن المهمة تخص أسرة المستخدم الحالي.
export async function completeTask(_prev: unknown, formData: FormData) {
  const assignedTaskId = String(formData.get("assigned_task_id") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!assignedTaskId) return { error: "بيانات ناقصة." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: at } = await supabase
    .from("assigned_tasks")
    .select("id, child_id, status, tasks(base_xp, needs_guardian_approval, proof)")
    .eq("id", assignedTaskId)
    .maybeSingle();
  if (!at) return { error: "المهمة غير موجودة." };

  const task = Array.isArray(at.tasks) ? at.tasks[0] : at.tasks;
  const needsApproval = task?.needs_guardian_approval ?? true;
  const baseXp = task?.base_xp ?? 0;
  const proofKind = task?.proof ?? "self_confirm";

  // سجل الإكمال مع الإثبات.
  const { error: compErr } = await supabase.from("task_completions").insert({
    assigned_task_id: at.id,
    child_id: at.child_id,
    proof_kind: proofKind,
    note_ar: note || null,
  });
  if (compErr) return { error: "تعذّر تسجيل الإكمال." };

  if (needsApproval) {
    // بانتظار اعتماد ولي الأمر — لا XP بعد.
    await supabase
      .from("assigned_tasks")
      .update({ status: "submitted", updated_at: new Date().toISOString() })
      .eq("id", at.id);
  } else {
    // لا يحتاج اعتماد — يُمنح XP مباشرة.
    await supabase
      .from("assigned_tasks")
      .update({ status: "approved", updated_at: new Date().toISOString() })
      .eq("id", at.id);
    if (baseXp > 0) {
      await supabase.from("xp_events").insert({
        child_id: at.child_id,
        amount: baseXp,
        reason_key: "task_completed",
        source_table: "assigned_tasks",
        source_id: at.id,
      });
    }
  }

  revalidatePath(`/children/${at.child_id}`);
  return { error: null };
}

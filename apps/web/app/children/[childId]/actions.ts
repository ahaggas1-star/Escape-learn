"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { evaluateChild } from "@/lib/gamification-engine";

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

  // رفع صورة الإثبات (إذا كان نوع الإثبات صورة وتم اختيار ملف).
  let photoPath: string | null = null;
  if (proofKind === "photo") {
    const file = formData.get("photo");
    if (file && file instanceof File && file.size > 0) {
      if (file.size > 5 * 1024 * 1024) return { error: "حجم الصورة كبير (الحد 5MB)." };
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${at.child_id}/${at.id}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("qiyam-proofs")
        .upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });
      if (upErr) return { error: "تعذّر رفع الصورة." };
      photoPath = path;
      // تسجيل موافقة رفع الصور (الخصوصية).
      await supabase
        .from("consent_logs")
        .insert({ user_id: user.id, kind: "photo_upload", granted: true });
    }
  }

  // سجل الإكمال مع الإثبات.
  const { error: compErr } = await supabase.from("task_completions").insert({
    assigned_task_id: at.id,
    child_id: at.child_id,
    proof_kind: proofKind,
    note_ar: note || null,
    photo_path: photoPath,
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
    // تقييم الشارات/الإنجازات/الصناديق بعد منح XP.
    await evaluateChild(at.child_id);
  }

  revalidatePath(`/children/${at.child_id}`);
  return { error: null };
}

// فتح صندوق مكافأة متاح. الاختيار تدويري (لا عشوائية/مقامرة)، ويُمنح XP إن كان عنصر XP.
export async function openReward(_prev: unknown, formData: FormData) {
  const openingId = String(formData.get("opening_id") ?? "");
  if (!openingId) return { error: "بيانات ناقصة." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: opening } = await supabase
    .from("reward_box_openings")
    .select("id, reward_box_id, child_id, status")
    .eq("id", openingId)
    .maybeSingle();
  if (!opening || opening.status !== "available")
    return { error: "الصندوق غير متاح للفتح." };

  const { data: items } = await supabase
    .from("reward_box_items")
    .select("id, kind, label_ar, payload")
    .eq("reward_box_id", opening.reward_box_id)
    .order("sort_order", { ascending: true });
  const list = items ?? [];
  if (list.length === 0) return { error: "لا يوجد محتوى في الصندوق." };

  // اختيار تدويري شفّاف حسب عدد الصناديق المفتوحة سابقًا.
  const { count } = await supabase
    .from("reward_box_openings")
    .select("id", { count: "exact", head: true })
    .eq("child_id", opening.child_id)
    .eq("status", "opened");
  const idx = (count ?? 0) % list.length;
  const item = list[idx] as { id: string; kind: string; payload: { xp?: number } | null };

  await supabase
    .from("reward_box_openings")
    .update({ item_id: item.id, status: "opened", opened_at: new Date().toISOString() })
    .eq("id", opening.id);

  if (item.kind === "xp" && item.payload?.xp) {
    await supabase.from("xp_events").insert({
      child_id: opening.child_id,
      amount: item.payload.xp,
      reason_key: "reward_box",
      source_table: "reward_box_openings",
      source_id: opening.id,
    });
  }

  revalidatePath(`/children/${opening.child_id}`);
  return { error: null };
}

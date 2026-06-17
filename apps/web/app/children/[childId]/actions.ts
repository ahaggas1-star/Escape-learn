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

// فتح صندوق مكافأة عبر الدالة المحمية (اختيار تدويري، يمنح XP إن لزم).
export async function openReward(_prev: unknown, formData: FormData) {
  const openingId = String(formData.get("opening_id") ?? "");
  const childId = String(formData.get("child_id") ?? "");
  if (!openingId) return { error: "بيانات ناقصة." };

  const supabase = createClient();
  const { error } = await supabase.rpc("open_reward_box", { p_opening_id: openingId });
  if (error) return { error: "تعذّر فتح الصندوق." };

  if (childId) revalidatePath(`/children/${childId}`);
  return { error: null };
}

// إنشاء/تعديل بيانات دخول الطفل (اسم مستخدم + كلمة مرور).
export async function setChildLogin(_prev: unknown, formData: FormData) {
  const childId = String(formData.get("child_id") ?? "");
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!childId) return { error: "بيانات ناقصة." };
  if (!/^[a-z0-9_]{3,30}$/.test(username))
    return { error: "اسم المستخدم: أحرف إنجليزية صغيرة وأرقام و_ (3–30)." };
  if (password.length < 4) return { error: "كلمة المرور 4 أحرف على الأقل." };

  const supabase = createClient();
  const { error } = await supabase.rpc("set_child_login", {
    p_child_id: childId,
    p_username: username,
    p_password: password,
  });
  if (error) {
    const msg = error.message?.includes("username_taken")
      ? "اسم المستخدم مستخدم مسبقًا."
      : "تعذّر حفظ بيانات الدخول.";
    return { error: msg };
  }
  revalidatePath(`/children/${childId}`);
  return { error: null, info: "تم حفظ بيانات الدخول." };
}

// تحديث هوية الطفل العامة (اللقب وما يظهر للعامة).
export async function updateChildPublic(_prev: unknown, formData: FormData) {
  const childId = String(formData.get("child_id") ?? "");
  const nickname = String(formData.get("nickname") ?? "").trim();
  const mode = String(formData.get("public_name_mode") ?? "nickname");
  if (!childId) return { error: "بيانات ناقصة." };
  if (!["nickname", "first_name", "full_name"].includes(mode))
    return { error: "خيار غير صحيح." };

  const supabase = createClient();
  const { error } = await supabase
    .from("children")
    .update({ nickname: nickname || null, public_name_mode: mode })
    .eq("id", childId);
  if (error) return { error: "تعذّر الحفظ." };
  revalidatePath(`/children/${childId}`);
  return { error: null, info: "تم الحفظ." };
}

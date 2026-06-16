"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// يتأكد أن المستخدم من الطاقم ويعيد العميل + معرّفه (RLS يفرض الأمان أيضًا).
async function getStaff() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: row } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  const role = row?.role ?? "guardian";
  if (role !== "content_manager" && role !== "system_admin") redirect("/dashboard");
  return { supabase, userId: user.id };
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const opt = (fd: FormData, k: string) => {
  const v = str(fd, k);
  return v ? v : null;
};

export async function createGoalTemplate(_prev: unknown, fd: FormData) {
  const core_value_id = str(fd, "core_value_id");
  const title_ar = str(fd, "title_ar");
  if (!core_value_id) return { error: "اختر القيمة." };
  if (title_ar.length < 4) return { error: "اكتب عنوانًا واضحًا." };

  const { supabase, userId } = await getStaff();
  const { error } = await supabase.from("goal_templates").insert({
    core_value_id,
    sub_value_id: opt(fd, "sub_value_id"),
    age_stage_id: opt(fd, "age_stage_id"),
    title_ar,
    description_ar: opt(fd, "description_ar"),
    difficulty: str(fd, "difficulty") || "easy",
    suggested_duration_days: opt(fd, "suggested_duration_days") ? Number(str(fd, "suggested_duration_days")) : null,
    success_criteria_ar: opt(fd, "success_criteria_ar"),
    is_published: fd.get("is_published") === "on",
    created_by: userId,
  });
  if (error) return { error: "تعذّر إنشاء الهدف الجاهز." };
  revalidatePath("/admin/goals");
  return { error: null };
}

export async function createTaskTemplate(_prev: unknown, fd: FormData) {
  const core_value_id = str(fd, "core_value_id");
  const title_ar = str(fd, "title_ar");
  if (!core_value_id) return { error: "اختر القيمة." };
  if (title_ar.length < 4) return { error: "اكتب عنوانًا واضحًا." };

  const { supabase, userId } = await getStaff();
  const { error } = await supabase.from("task_templates").insert({
    core_value_id,
    sub_value_id: opt(fd, "sub_value_id"),
    age_stage_id: opt(fd, "age_stage_id"),
    title_ar,
    description_ar: opt(fd, "description_ar"),
    difficulty: str(fd, "difficulty") || "easy",
    repeat_type: str(fd, "repeat_type") || "daily",
    proof: str(fd, "proof") || "self_confirm",
    needs_guardian_approval: fd.get("needs_guardian_approval") === "on",
    base_xp: Number(str(fd, "base_xp")) || 10,
    child_instructions_ar: opt(fd, "child_instructions_ar"),
    guardian_guidelines_ar: opt(fd, "guardian_guidelines_ar"),
    success_criteria_ar: opt(fd, "success_criteria_ar"),
    is_published: fd.get("is_published") === "on",
    created_by: userId,
  });
  if (error) return { error: "تعذّر إنشاء المهمة الجاهزة." };
  revalidatePath("/admin/tasks");
  return { error: null };
}

export async function updateGoalTemplate(_prev: unknown, fd: FormData) {
  const id = str(fd, "id");
  const core_value_id = str(fd, "core_value_id");
  const title_ar = str(fd, "title_ar");
  if (!id) return { error: "بيانات ناقصة." };
  if (!core_value_id) return { error: "اختر القيمة." };
  if (title_ar.length < 4) return { error: "اكتب عنوانًا واضحًا." };

  const { supabase } = await getStaff();
  const { error } = await supabase
    .from("goal_templates")
    .update({
      core_value_id,
      sub_value_id: opt(fd, "sub_value_id"),
      age_stage_id: opt(fd, "age_stage_id"),
      title_ar,
      description_ar: opt(fd, "description_ar"),
      difficulty: str(fd, "difficulty") || "easy",
      suggested_duration_days: opt(fd, "suggested_duration_days") ? Number(str(fd, "suggested_duration_days")) : null,
      success_criteria_ar: opt(fd, "success_criteria_ar"),
      is_published: fd.get("is_published") === "on",
    })
    .eq("id", id);
  if (error) return { error: "تعذّر تحديث الهدف." };
  redirect("/admin/goals");
}

export async function updateTaskTemplate(_prev: unknown, fd: FormData) {
  const id = str(fd, "id");
  const core_value_id = str(fd, "core_value_id");
  const title_ar = str(fd, "title_ar");
  if (!id) return { error: "بيانات ناقصة." };
  if (!core_value_id) return { error: "اختر القيمة." };
  if (title_ar.length < 4) return { error: "اكتب عنوانًا واضحًا." };

  const { supabase } = await getStaff();
  const { error } = await supabase
    .from("task_templates")
    .update({
      core_value_id,
      sub_value_id: opt(fd, "sub_value_id"),
      age_stage_id: opt(fd, "age_stage_id"),
      title_ar,
      description_ar: opt(fd, "description_ar"),
      difficulty: str(fd, "difficulty") || "easy",
      repeat_type: str(fd, "repeat_type") || "daily",
      proof: str(fd, "proof") || "self_confirm",
      needs_guardian_approval: fd.get("needs_guardian_approval") === "on",
      base_xp: Number(str(fd, "base_xp")) || 10,
      child_instructions_ar: opt(fd, "child_instructions_ar"),
      guardian_guidelines_ar: opt(fd, "guardian_guidelines_ar"),
      success_criteria_ar: opt(fd, "success_criteria_ar"),
      is_published: fd.get("is_published") === "on",
    })
    .eq("id", id);
  if (error) return { error: "تعذّر تحديث المهمة." };
  redirect("/admin/tasks");
}

// نشر/إلغاء نشر قالب (هدف أو مهمة).
export async function setPublish(_prev: unknown, fd: FormData) {
  const table = str(fd, "table");
  const id = str(fd, "id");
  const publish = fd.get("publish") === "true";
  if (table !== "goal_templates" && table !== "task_templates") return { error: "غير صحيح." };

  const { supabase } = await getStaff();
  await supabase.from(table).update({ is_published: publish }).eq("id", id);
  revalidatePath(table === "goal_templates" ? "/admin/goals" : "/admin/tasks");
  return { error: null };
}

// إضافة قيمة رئيسية جديدة (قرار #2) مع ربط فئة عمرية اختياري.
export async function createCoreValue(_prev: unknown, fd: FormData) {
  const key = str(fd, "key");
  const label_ar = str(fd, "label_ar");
  if (!/^[a-z_]{2,40}$/.test(key)) return { error: "المفتاح: أحرف إنجليزية صغيرة و_ فقط." };
  if (label_ar.length < 2) return { error: "اكتب اسم القيمة بالعربية." };

  const { supabase } = await getStaff();
  const { data: maxRow } = await supabase
    .from("core_values")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = (maxRow?.sort_order ?? 0) + 1;

  const { error } = await supabase.from("core_values").insert({
    key,
    label_ar,
    description_ar: opt(fd, "description_ar"),
    age_stage_id: opt(fd, "age_stage_id"),
    sort_order,
  });
  if (error) return { error: "تعذّر إضافة القيمة (قد يكون المفتاح مكررًا)." };
  revalidatePath("/admin/values");
  return { error: null };
}

// حذف قالب (هدف أو مهمة).
export async function deleteTemplate(_prev: unknown, fd: FormData) {
  const table = str(fd, "table");
  const id = str(fd, "id");
  if (table !== "goal_templates" && table !== "task_templates") return { error: "غير صحيح." };
  const { supabase } = await getStaff();
  await supabase.from(table).delete().eq("id", id);
  revalidatePath(table === "goal_templates" ? "/admin/goals" : "/admin/tasks");
  return { error: null };
}

// تعيين دور مستخدم (مدير النظام فقط — RLS يفرض ذلك أيضًا).
export async function setUserRole(_prev: unknown, fd: FormData) {
  const userId = str(fd, "user_id");
  const role = str(fd, "role");
  if (!["guardian", "content_manager", "system_admin"].includes(role))
    return { error: "دور غير صحيح." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (me?.role !== "system_admin") redirect("/dashboard");
  // لا تُسقط آخر مدير نظام لنفسه عرضًا — منع تخفيض الذات.
  if (userId === user.id && role !== "system_admin")
    return { error: "لا يمكنك تخفيض دورك بنفسك." };

  const { error } = await supabase.from("users").update({ role }).eq("id", userId);
  if (error) return { error: "تعذّر تحديث الدور." };
  revalidatePath("/admin/users");
  return { error: null };
}

// ---- إدارة عناصر التلعيب (شارات/مستويات/إنجازات) ----

export async function createBadge(_prev: unknown, fd: FormData) {
  const key = str(fd, "key");
  const label_ar = str(fd, "label_ar");
  const condition_ar = str(fd, "condition_ar");
  if (!/^[a-z_]{2,40}$/.test(key)) return { error: "المفتاح: أحرف إنجليزية صغيرة و_ فقط." };
  if (label_ar.length < 2) return { error: "اكتب اسم الشارة." };
  if (condition_ar.length < 4) return { error: "اكتب شرط منح الشارة (واضح)." };

  const { supabase } = await getStaff();
  const { error } = await supabase.from("badges").insert({
    key,
    label_ar,
    condition_ar,
    core_value_id: opt(fd, "core_value_id"),
  });
  if (error) return { error: "تعذّر إضافة الشارة (قد يكون المفتاح مكررًا)." };
  revalidatePath("/admin/gamification");
  return { error: null };
}

export async function createLevel(_prev: unknown, fd: FormData) {
  const key = str(fd, "key");
  const label_ar = str(fd, "label_ar");
  const min_xp = Number(str(fd, "min_xp"));
  if (!/^[a-z_]{2,40}$/.test(key)) return { error: "المفتاح: أحرف إنجليزية صغيرة و_ فقط." };
  if (label_ar.length < 2) return { error: "اكتب اسم المستوى." };
  if (Number.isNaN(min_xp) || min_xp < 0) return { error: "أدخل حد XP صحيحًا." };

  const { supabase } = await getStaff();
  const { error } = await supabase.from("levels").insert({ key, label_ar, min_xp, sort_order: min_xp });
  if (error) return { error: "تعذّر إضافة المستوى (قد يكون المفتاح مكررًا)." };
  revalidatePath("/admin/gamification");
  return { error: null };
}

export async function createAchievement(_prev: unknown, fd: FormData) {
  const key = str(fd, "key");
  const label_ar = str(fd, "label_ar");
  if (!/^[a-z_]{2,40}$/.test(key)) return { error: "المفتاح: أحرف إنجليزية صغيرة و_ فقط." };
  if (label_ar.length < 2) return { error: "اكتب اسم الإنجاز." };

  const { supabase } = await getStaff();
  const { error } = await supabase.from("achievements").insert({
    key,
    label_ar,
    description_ar: opt(fd, "description_ar"),
  });
  if (error) return { error: "تعذّر إضافة الإنجاز (قد يكون المفتاح مكررًا)." };
  revalidatePath("/admin/gamification");
  return { error: null };
}

export async function deleteGamItem(_prev: unknown, fd: FormData) {
  const table = str(fd, "table");
  const id = str(fd, "id");
  if (!["badges", "levels", "achievements"].includes(table)) return { error: "غير صحيح." };
  const { supabase } = await getStaff();
  await supabase.from(table).delete().eq("id", id);
  revalidatePath("/admin/gamification");
  return { error: null };
}

export async function createSubValue(_prev: unknown, fd: FormData) {
  const core_value_id = str(fd, "core_value_id");
  const key = str(fd, "key");
  const label_ar = str(fd, "label_ar");
  if (!core_value_id) return { error: "اختر القيمة الرئيسية." };
  if (!/^[a-z_]{2,40}$/.test(key)) return { error: "المفتاح: أحرف إنجليزية صغيرة و_ فقط." };
  if (label_ar.length < 2) return { error: "اكتب اسم القيمة الفرعية." };

  const { supabase } = await getStaff();
  const { error } = await supabase.from("sub_values").insert({ core_value_id, key, label_ar });
  if (error) return { error: "تعذّر إضافة القيمة الفرعية (قد يكون المفتاح مكررًا)." };
  revalidatePath("/admin/values");
  return { error: null };
}

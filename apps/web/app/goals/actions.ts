"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// يتحقق أن الأسرة تخصّ المستخدم الحالي ويعيد معرّفها.
async function getOwnedFamilyId() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: family } = await supabase
    .from("families")
    .select("id")
    .eq("owner_id", user.id)
    .limit(1)
    .maybeSingle();
  if (!family) redirect("/onboarding");
  return { supabase, userId: user.id, familyId: family.id as string };
}

// إنشاء هدف من قالب جاهز لابن محدد.
export async function createGoalFromTemplate(_prev: unknown, formData: FormData) {
  const templateId = String(formData.get("template_id") ?? "");
  const childId = String(formData.get("child_id") ?? "");
  if (!templateId || !childId) return { error: "اختر الابن أولًا." };

  const { supabase, userId, familyId } = await getOwnedFamilyId();

  const { data: tpl } = await supabase
    .from("goal_templates")
    .select("*")
    .eq("id", templateId)
    .maybeSingle();
  if (!tpl) return { error: "القالب غير موجود." };

  const { data: goal, error } = await supabase
    .from("goals")
    .insert({
      family_id: familyId,
      child_id: childId,
      core_value_id: tpl.core_value_id,
      sub_value_id: tpl.sub_value_id,
      source: "template",
      template_id: tpl.id,
      title_ar: tpl.title_ar,
      description_ar: tpl.description_ar,
      measure_ar: tpl.success_criteria_ar,
      status: "active",
      created_by: userId,
    })
    .select("id")
    .single();
  if (error || !goal) return { error: "تعذّر إنشاء الهدف." };

  redirect(`/goals/${goal.id}`);
}

// إنشاء هدف خاص.
export async function createCustomGoal(_prev: unknown, formData: FormData) {
  const coreValueId = String(formData.get("core_value_id") ?? "");
  const childId = String(formData.get("child_id") ?? "");
  const title = String(formData.get("title_ar") ?? "").trim();
  const measure = String(formData.get("measure_ar") ?? "").trim();
  const description = String(formData.get("description_ar") ?? "").trim();

  if (!coreValueId || !childId) return { error: "اختر الابن أولًا." };
  if (title.length < 4) return { error: "اكتب عنوانًا واضحًا للهدف." };
  // شرط جودة: هدف قابل للقياس (طريقة قياس مطلوبة).
  if (measure.length < 4)
    return { error: "أضف طريقة قياس بسيطة — لا يُسمح بهدف عام غير قابل للمتابعة." };

  const { supabase, userId, familyId } = await getOwnedFamilyId();

  const { data: goal, error } = await supabase
    .from("goals")
    .insert({
      family_id: familyId,
      child_id: childId,
      core_value_id: coreValueId,
      source: "custom",
      title_ar: title,
      description_ar: description || null,
      measure_ar: measure,
      status: "active",
      created_by: userId,
    })
    .select("id")
    .single();
  if (error || !goal) return { error: "تعذّر إنشاء الهدف." };

  redirect(`/goals/${goal.id}`);
}

// إضافة مهمة من قالب إلى هدف، وإسنادها لابن الهدف.
export async function addTaskFromTemplate(_prev: unknown, formData: FormData) {
  const templateId = String(formData.get("template_id") ?? "");
  const goalId = String(formData.get("goal_id") ?? "");
  if (!templateId || !goalId) return { error: "بيانات ناقصة." };

  const { supabase, userId } = await getOwnedFamilyId();

  const { data: goal } = await supabase
    .from("goals")
    .select("id, child_id, core_value_id, sub_value_id")
    .eq("id", goalId)
    .maybeSingle();
  if (!goal) return { error: "الهدف غير موجود." };

  const { data: tpl } = await supabase
    .from("task_templates")
    .select("*")
    .eq("id", templateId)
    .maybeSingle();
  if (!tpl) return { error: "القالب غير موجود." };

  const { data: task, error: taskErr } = await supabase
    .from("tasks")
    .insert({
      goal_id: goal.id,
      template_id: tpl.id,
      core_value_id: tpl.core_value_id,
      sub_value_id: tpl.sub_value_id,
      title_ar: tpl.title_ar,
      description_ar: tpl.description_ar,
      difficulty: tpl.difficulty,
      repeat_type: tpl.repeat_type,
      proof: tpl.proof,
      needs_guardian_approval: tpl.needs_guardian_approval,
      base_xp: tpl.base_xp,
      child_instructions_ar: tpl.child_instructions_ar,
      guardian_guidelines_ar: tpl.guardian_guidelines_ar,
      success_criteria_ar: tpl.success_criteria_ar,
      created_by: userId,
    })
    .select("id")
    .single();
  if (taskErr || !task) return { error: "تعذّرت إضافة المهمة." };

  if (goal.child_id) {
    await supabase.from("assigned_tasks").insert({
      task_id: task.id,
      child_id: goal.child_id,
      assigned_by: userId,
      status: "assigned",
    });
  }

  revalidatePath(`/goals/${goalId}`);
  return { error: null };
}

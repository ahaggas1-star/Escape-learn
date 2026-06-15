"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// يضمن وجود سطر للمستخدم في جدول users (دور ولي الأمر).
async function ensureUserRow(userId: string, email: string | null) {
  const supabase = createClient();
  await supabase
    .from("users")
    .upsert({ id: userId, role: "guardian", email }, { onConflict: "id" });
}

// إنشاء الأسرة + ولي الأمر كعضو مالك، ثم إضافة أول ابن.
export async function createFamilyWithChild(_prev: unknown, formData: FormData) {
  const familyName = String(formData.get("family_name") ?? "").trim();
  const childName = String(formData.get("child_name") ?? "").trim();
  const ageRaw = String(formData.get("child_age") ?? "").trim();
  const age = ageRaw ? Number(ageRaw) : null;

  if (!childName) return { error: "أدخل اسم الابن على الأقل." };
  if (age != null && (Number.isNaN(age) || age < 1 || age > 25))
    return { error: "أدخل عمرًا صحيحًا." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await ensureUserRow(user.id, user.email ?? null);

  const { data: family, error: famErr } = await supabase
    .from("families")
    .insert({ owner_id: user.id, name: familyName || null })
    .select("id")
    .single();
  if (famErr || !family) return { error: "تعذّر إنشاء الأسرة." };

  await supabase
    .from("family_members")
    .insert({ family_id: family.id, user_id: user.id, role: "owner" });

  // ربط المرحلة العمرية المناسبة إن وُجدت.
  let ageStageId: string | null = null;
  if (age != null) {
    const { data: stage } = await supabase
      .from("age_stages")
      .select("id")
      .lte("min_age", age)
      .gte("max_age", age)
      .limit(1)
      .maybeSingle();
    ageStageId = stage?.id ?? null;
  }

  const { error: childErr } = await supabase.from("children").insert({
    family_id: family.id,
    display_name: childName,
    age,
    age_stage_id: ageStageId,
  });
  if (childErr) return { error: "أُنشئت الأسرة لكن تعذّرت إضافة الابن." };

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

// إضافة ابن إلى أسرة موجودة.
export async function addChild(_prev: unknown, formData: FormData) {
  const childName = String(formData.get("child_name") ?? "").trim();
  const ageRaw = String(formData.get("child_age") ?? "").trim();
  const age = ageRaw ? Number(ageRaw) : null;

  if (!childName) return { error: "أدخل اسم الابن." };
  if (age != null && (Number.isNaN(age) || age < 1 || age > 25))
    return { error: "أدخل عمرًا صحيحًا." };

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

  let ageStageId: string | null = null;
  if (age != null) {
    const { data: stage } = await supabase
      .from("age_stages")
      .select("id")
      .lte("min_age", age)
      .gte("max_age", age)
      .limit(1)
      .maybeSingle();
    ageStageId = stage?.id ?? null;
  }

  const { error } = await supabase.from("children").insert({
    family_id: family.id,
    display_name: childName,
    age,
    age_stage_id: ageStageId,
  });
  if (error) return { error: "تعذّرت إضافة الابن." };

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

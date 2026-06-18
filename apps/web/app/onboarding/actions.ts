"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// يضمن وجود سطر للمستخدم في جدول users (دور ولي الأمر) — دون المساس بدور موجود
// (حتى لا يُخفَّض مدير النظام/المحتوى إلى ولي أمر عند إنشاء أسرة).
async function ensureUserRow(userId: string, email: string | null) {
  const supabase = createClient();
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .maybeSingle();
  if (existing) return;
  await supabase.from("users").insert({ id: userId, role: "guardian", email });
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

// إضافة ابن إلى أسرة موجودة — مع تجهيز دخوله اختياريًا في نفس الخطوة.
export async function addChild(_prev: unknown, formData: FormData) {
  const childName = String(formData.get("child_name") ?? "").trim();
  const ageRaw = String(formData.get("child_age") ?? "").trim();
  const age = ageRaw ? Number(ageRaw) : null;
  // بيانات دخول اختيارية (إن رغب ولي الأمر بتجهيزها فورًا).
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const wantsLogin = username.length > 0 || password.length > 0;

  if (!childName) return { error: "أدخل اسم الابن." };
  if (age != null && (Number.isNaN(age) || age < 1 || age > 25))
    return { error: "أدخل عمرًا صحيحًا." };
  if (wantsLogin) {
    if (!/^[a-z0-9_]{3,30}$/.test(username))
      return { error: "اسم المستخدم: أحرف إنجليزية صغيرة وأرقام و_ (3–30)." };
    if (password.length < 4) return { error: "كلمة المرور 4 أحرف على الأقل." };
  }

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

  const { data: child, error } = await supabase
    .from("children")
    .insert({
      family_id: family.id,
      display_name: childName,
      age,
      age_stage_id: ageStageId,
    })
    .select("id")
    .single();
  if (error || !child) return { error: "تعذّرت إضافة الابن." };

  // تجهيز الدخول في نفس الخطوة إن طُلب.
  if (wantsLogin) {
    const { error: loginErr } = await supabase.rpc("set_child_login", {
      p_child_id: child.id,
      p_username: username,
      p_password: password,
    });
    if (loginErr) {
      const msg = loginErr.message?.includes("username_taken")
        ? "أُضيف الابن، لكن اسم المستخدم مستخدم مسبقًا — جهّز الدخول من صفحته."
        : "أُضيف الابن، لكن تعذّر حفظ الدخول — جهّزه من صفحته.";
      revalidatePath("/dashboard");
      redirect(`/children/${child.id}?notice=${encodeURIComponent(msg)}`);
    }
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

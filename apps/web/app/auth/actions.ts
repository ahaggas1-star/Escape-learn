"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// تسجيل دخول ولي الأمر بالبريد وكلمة المرور.
export async function signIn(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "أدخل البريد وكلمة المرور." };

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "تعذّر تسجيل الدخول. تحقّق من البيانات." };
  redirect("/dashboard");
}

// إنشاء حساب ولي أمر جديد (عبر دالة آمنة تُنشئ حسابًا مؤكَّدًا فورًا).
export async function signUp(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email) return { error: "أدخل البريد الإلكتروني." };
  if (password.length < 6) return { error: "كلمة المرور 6 أحرف على الأقل." };

  const supabase = createClient();
  const { error } = await supabase.rpc("signup_guardian", {
    p_email: email,
    p_password: password,
  });
  if (error) {
    const m = error.message ?? "";
    if (m.includes("email_taken"))
      return { error: "هذا البريد مسجّل مسبقًا — سجّل الدخول بدلًا من ذلك." };
    if (m.includes("invalid_email")) return { error: "صيغة البريد غير صحيحة." };
    if (m.includes("weak_password")) return { error: "كلمة المرور 6 أحرف على الأقل." };
    return { error: "تعذّر إنشاء الحساب. حاول مرة أخرى." };
  }

  // الحساب مؤكَّد — سجّل الدخول مباشرة.
  const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
  if (signInErr)
    return { error: null, info: "تم إنشاء الحساب بنجاح. يمكنك تسجيل الدخول الآن." };
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

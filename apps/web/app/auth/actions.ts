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

// إنشاء حساب ولي أمر جديد.
export async function signUp(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || password.length < 6)
    return { error: "أدخل بريدًا صحيحًا وكلمة مرور لا تقل عن 6 أحرف." };

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: "تعذّر إنشاء الحساب. حاول ببريد آخر." };

  // الحسابات مؤكَّدة تلقائيًا — سجّل الدخول مباشرة إن لم توجد جلسة.
  if (!data.session) {
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signInErr) {
      return { error: null, info: "تم إنشاء الحساب. يمكنك تسجيل الدخول الآن." };
    }
  }
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

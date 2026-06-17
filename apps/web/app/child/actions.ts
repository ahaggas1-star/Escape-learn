"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getChildSelf } from "@/lib/auth";

const KIDS_DOMAIN = "@kids.qiyam.local";

// دخول الطفل باسم المستخدم وكلمة المرور (يُحوّل لبريد محجوز داخليًا).
export async function childSignIn(_prev: unknown, formData: FormData) {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!username || !password) return { error: "أدخل اسم المستخدم وكلمة المرور." };

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: username + KIDS_DOMAIN,
    password,
  });
  if (error) return { error: "اسم المستخدم أو كلمة المرور غير صحيحة." };
  redirect("/child");
}

export async function childSignOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/child/login");
}

// الطفل يُكمل مهمة (عبر دالة محمية تمنع التلاعب بالـXP).
export async function childCompleteTask(_prev: unknown, formData: FormData) {
  const assignedTaskId = String(formData.get("assigned_task_id") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!assignedTaskId) return { error: "بيانات ناقصة." };

  const child = await getChildSelf();
  if (!child) redirect("/child/login");
  const supabase = createClient();

  // رفع صورة الإثبات إن وُجدت.
  let photoPath: string | null = null;
  const file = formData.get("photo");
  if (file && file instanceof File && file.size > 0) {
    if (file.size > 5 * 1024 * 1024) return { error: "حجم الصورة كبير (الحد 5MB)." };
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${child.id}/${assignedTaskId}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("qiyam-proofs")
      .upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });
    if (upErr) return { error: "تعذّر رفع الصورة." };
    photoPath = path;
  }

  const { error } = await supabase.rpc("child_complete_task", {
    p_assigned_task_id: assignedTaskId,
    p_note: note || null,
    p_photo_path: photoPath,
  });
  if (error) return { error: "تعذّر إكمال المهمة." };

  revalidatePath("/child");
  return { error: null };
}

// الطفل يفتح صندوقًا من المتجر بصرف العملات.
export async function openBox(_prev: unknown, formData: FormData) {
  const boxId = String(formData.get("box_id") ?? "");
  if (!boxId) return { error: "بيانات ناقصة." };
  const supabase = createClient();
  const { data, error } = await supabase.rpc("open_box", { p_box_id: boxId });
  if (error) {
    const m = error.message?.includes("insufficient")
      ? "لا تملك عملات كافية."
      : "تعذّر فتح الصندوق.";
    return { error: m };
  }
  const item = data as { kind: string; label: string } | null;
  revalidatePath("/child");
  return { error: null, reward: item?.label ?? "مكافأة" };
}

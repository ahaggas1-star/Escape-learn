import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Child, Family } from "@/lib/types";

// المستخدم الحالي (ولي الأمر). يعيد التوجيه لتسجيل الدخول إن لم يوجد.
export async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user;
}

// يتطلّب أن يكون المستخدم من طاقم المحتوى/النظام، وإلا يعيد التوجيه.
export async function requireStaff(): Promise<{
  userId: string;
  email: string | null;
  role: string;
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: row } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const role = row?.role ?? "guardian";
  if (role !== "content_manager" && role !== "system_admin") redirect("/dashboard");

  return { userId: user.id, email: user.email ?? null, role };
}

// يتطلّب مدير نظام، وإلا يعيد التوجيه.
export async function requireAdmin(): Promise<{ userId: string; email: string | null }> {
  const { userId, email, role } = await requireStaff();
  if (role !== "system_admin") redirect("/admin");
  return { userId, email };
}

export interface ChildSelf {
  id: string;
  family_id: string;
  display_name: string;
  nickname: string | null;
  public_name_mode: string;
  age: number | null;
}

// الطفل الحالي (إن كان المستخدم طفلًا)، وإلا null.
export async function getChildSelf(): Promise<ChildSelf | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("children")
    .select("id, family_id, display_name, nickname, public_name_mode, age")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  return (data as ChildSelf) ?? null;
}

// يتطلّب طفلًا مسجّلًا، وإلا يعيد التوجيه لدخول الطفل.
export async function requireChild(): Promise<ChildSelf> {
  const child = await getChildSelf();
  if (!child) redirect("/child/login");
  return child;
}

// سياق ولي الأمر: المستخدم + أسرته (أول أسرة يملكها) + أبناؤه.
export async function getGuardianContext(): Promise<{
  userId: string;
  email: string | null;
  family: Family | null;
  children: Child[];
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // الأطفال يُوجَّهون للوحتهم بدل صفحات ولي الأمر.
  const { data: asChild } = await supabase
    .from("children")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (asChild) redirect("/child");

  const { data: family } = await supabase
    .from("families")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  let children: Child[] = [];
  if (family) {
    const { data } = await supabase
      .from("children")
      .select("*")
      .eq("family_id", family.id)
      .order("created_at", { ascending: true });
    children = data ?? [];
  }

  return {
    userId: user.id,
    email: user.email ?? null,
    family: (family as Family) ?? null,
    children,
  };
}

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

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function getOwner() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, userId: user.id };
}

// حذف ابن (حق الحذف) — RLS يقيّد بانتماء الأسرة. يُسجَّل في audit_logs.
export async function deleteChild(_prev: unknown, fd: FormData) {
  const childId = String(fd.get("child_id") ?? "");
  if (!childId) return { error: "بيانات ناقصة." };

  const { supabase } = await getOwner();
  await supabase.rpc("log_audit", {
    p_action: "delete_child",
    p_entity: "children",
    p_entity_id: childId,
    p_metadata: null,
  });
  const { error } = await supabase.from("children").delete().eq("id", childId);
  if (error) return { error: "تعذّر حذف الابن." };

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { error: null };
}

// حذف بيانات الأسرة بالكامل (Cascade). يُسجَّل ثم يُعاد التوجيه لتسجيل الدخول.
export async function deleteFamilyData(_prev: unknown, fd: FormData) {
  const confirm = String(fd.get("confirm") ?? "");
  if (confirm !== "حذف") return { error: "اكتب كلمة «حذف» للتأكيد." };

  const { supabase, userId } = await getOwner();
  const { data: family } = await supabase
    .from("families")
    .select("id")
    .eq("owner_id", userId)
    .limit(1)
    .maybeSingle();
  if (!family) redirect("/onboarding");

  await supabase.rpc("log_audit", {
    p_action: "delete_family",
    p_entity: "families",
    p_entity_id: family.id,
    p_metadata: null,
  });
  const { error } = await supabase.from("families").delete().eq("id", family.id);
  if (error) return { error: "تعذّر حذف بيانات الأسرة." };

  redirect("/onboarding");
}

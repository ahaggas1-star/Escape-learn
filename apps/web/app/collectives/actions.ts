"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

// ولي الأمر ينشئ إنجازًا جماعيًا عائليًا («محيط العائلة»).
export async function createFamilyCollective(_prev: unknown, fd: FormData) {
  const title = str(fd, "title_ar");
  if (title.length < 3) return { error: "اكتب عنوانًا واضحًا." };
  const target = Math.max(1, Number(str(fd, "target")) || 5);
  const perCap = Math.max(1, Number(str(fd, "per_child_cap")) || 5);
  const reward = Math.max(0, Number(str(fd, "reward_xp")) || 30);

  const { supabase, userId, familyId } = await getOwnedFamilyId();
  const { error } = await supabase.from("collective_achievements").insert({
    scope: "family",
    family_id: familyId,
    title_ar: title,
    description_ar: str(fd, "description_ar") || null,
    icon: str(fd, "icon") || "🤝",
    core_value_id: str(fd, "core_value_id") || null,
    target,
    per_child_cap: perCap,
    reward_xp: reward,
    created_by: userId,
  });
  if (error) return { error: "تعذّر إنشاء الإنجاز الجماعي." };
  revalidatePath("/collectives");
  return { error: null };
}

// المطالبة بمكافأة إنجاز جماعي مكتمل.
export async function claimCollective(_prev: unknown, fd: FormData) {
  const id = str(fd, "collective_id");
  if (!id) return { error: "بيانات ناقصة." };
  const supabase = createClient();
  const { error } = await supabase.rpc("claim_collective", { p_collective_id: id });
  if (error) {
    const m = error.message?.includes("not complete")
      ? "لم يكتمل بعد."
      : error.message?.includes("already")
      ? "تمت المطالبة مسبقًا."
      : "تعذّرت المطالبة.";
    return { error: m };
  }
  revalidatePath("/collectives");
  return { error: null, info: "تم منح المكافأة لجميع الأبناء! 🎉" };
}

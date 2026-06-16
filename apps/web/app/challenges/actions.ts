"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { evaluateChild } from "@/lib/gamification-engine";

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
const opt = (fd: FormData, k: string) => str(fd, k) || null;

// إنشاء تحدٍّ عائلي.
export async function createChallenge(_prev: unknown, fd: FormData) {
  const title = str(fd, "title_ar");
  if (title.length < 4) return { error: "اكتب عنوانًا واضحًا للتحدي." };
  const rewardXp = Math.max(0, Number(str(fd, "reward_xp")) || 50);

  const { supabase, familyId } = await getOwnedFamilyId();
  const { error } = await supabase.from("family_challenges").insert({
    family_id: familyId,
    title_ar: title,
    description_ar: opt(fd, "description_ar"),
    core_value_id: opt(fd, "core_value_id"),
    start_date: opt(fd, "start_date"),
    end_date: opt(fd, "end_date"),
    reward_xp: rewardXp,
  });
  if (error) return { error: "تعذّر إنشاء التحدي." };
  revalidatePath("/challenges");
  return { error: null };
}

// منح إنجاز تحدٍّ لابن (يمنح reward_xp ويُحدّث التلعيب).
export async function awardChallenge(_prev: unknown, fd: FormData) {
  const challengeId = str(fd, "challenge_id");
  const childId = str(fd, "child_id");
  if (!challengeId || !childId) return { error: "اختر الابن." };

  const { supabase } = await getOwnedFamilyId();
  const { data: ch } = await supabase
    .from("family_challenges")
    .select("id, reward_xp")
    .eq("id", challengeId)
    .maybeSingle();
  if (!ch) return { error: "التحدي غير موجود." };

  // منع التكرار لنفس الابن/التحدي.
  const { count } = await supabase
    .from("xp_events")
    .select("id", { count: "exact", head: true })
    .eq("child_id", childId)
    .eq("reason_key", "family_challenge")
    .eq("source_id", challengeId);
  if ((count ?? 0) > 0) return { error: "مُنح هذا التحدي لهذا الابن مسبقًا." };

  await supabase.from("xp_events").insert({
    child_id: childId,
    amount: ch.reward_xp ?? 50,
    reason_key: "family_challenge",
    source_table: "family_challenges",
    source_id: challengeId,
  });
  await evaluateChild(childId);

  revalidatePath("/challenges");
  return { error: null };
}

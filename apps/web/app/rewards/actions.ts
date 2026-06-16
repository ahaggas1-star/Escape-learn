"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

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

// يضمن وجود صندوق مكافآت للأسرة ويعيد معرّفه (دون عناصر افتراضية هنا).
async function ensureBox(supabase: SupabaseClient, familyId: string, userId: string) {
  const { data: existing } = await supabase
    .from("reward_boxes")
    .select("id")
    .eq("family_id", familyId)
    .limit(1)
    .maybeSingle();
  if (existing) return existing.id as string;
  const { data: box } = await supabase
    .from("reward_boxes")
    .insert({
      family_id: familyId,
      title_ar: "صندوق الإنجاز",
      unlock_condition_ar: "يُفتح بعد تحقيق إنجاز حقيقي.",
      created_by: userId,
    })
    .select("id")
    .single();
  return box?.id as string;
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

// إضافة عنصر مكافأة (مادي/معنوي) يحدّده ولي الأمر (قرار #6).
export async function addRewardItem(_prev: unknown, fd: FormData) {
  const label = str(fd, "label_ar");
  const kind = str(fd, "kind") || "material";
  if (label.length < 2) return { error: "اكتب وصف المكافأة." };

  const { supabase, userId, familyId } = await getOwnedFamilyId();
  const boxId = await ensureBox(supabase, familyId, userId);
  if (!boxId) return { error: "تعذّر تهيئة الصندوق." };

  const { data: maxRow } = await supabase
    .from("reward_box_items")
    .select("sort_order")
    .eq("reward_box_id", boxId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = (maxRow?.sort_order ?? 0) + 1;

  const { error } = await supabase.from("reward_box_items").insert({
    reward_box_id: boxId,
    kind,
    label_ar: label,
    sort_order,
  });
  if (error) return { error: "تعذّر إضافة المكافأة." };
  revalidatePath("/rewards");
  return { error: null };
}

export async function deleteRewardItem(_prev: unknown, fd: FormData) {
  const id = str(fd, "id");
  const { supabase } = await getOwnedFamilyId();
  await supabase.from("reward_box_items").delete().eq("id", id);
  revalidatePath("/rewards");
  return { error: null };
}

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

const TYPES = ["normal", "special", "awesome"];

// إنشاء صندوق جديد (نوع + تكلفة بالعملات).
export async function createBox(_prev: unknown, fd: FormData) {
  const title = str(fd, "title_ar");
  const type = str(fd, "box_type");
  if (title.length < 2) return { error: "اكتب اسم الصندوق." };
  if (!TYPES.includes(type)) return { error: "نوع غير صحيح." };
  const cost = Math.max(0, Number(str(fd, "cost_coins")) || 0);

  const { supabase, userId, familyId } = await getOwnedFamilyId();
  const { error } = await supabase.from("reward_boxes").insert({
    family_id: familyId,
    box_type: type,
    cost_coins: cost,
    title_ar: title,
    unlock_condition_ar: cost > 0 ? `يُفتح بـ ${cost} عملة` : "مجاني",
    created_by: userId,
  });
  if (error) return { error: "تعذّر إنشاء الصندوق." };
  revalidatePath("/rewards");
  return { error: null };
}

export async function updateBox(_prev: unknown, fd: FormData) {
  const id = str(fd, "box_id");
  const title = str(fd, "title_ar");
  const type = str(fd, "box_type");
  const cost = Math.max(0, Number(str(fd, "cost_coins")) || 0);
  if (!id || title.length < 2 || !TYPES.includes(type)) return { error: "بيانات غير صحيحة." };

  const { supabase } = await getOwnedFamilyId();
  const { error } = await supabase
    .from("reward_boxes")
    .update({ title_ar: title, box_type: type, cost_coins: cost, is_active: fd.get("is_active") === "on" })
    .eq("id", id);
  if (error) return { error: "تعذّر الحفظ." };
  revalidatePath(`/rewards/${id}`);
  revalidatePath("/rewards");
  return { error: null, info: "تم الحفظ." };
}

export async function deleteBox(fd: FormData) {
  const id = str(fd, "box_id");
  const { supabase } = await getOwnedFamilyId();
  await supabase.from("reward_boxes").delete().eq("id", id);
  revalidatePath("/rewards");
  redirect("/rewards");
}

// إضافة عنصر/رسالة داخل صندوق محدّد.
export async function addRewardItem(_prev: unknown, fd: FormData) {
  const boxId = str(fd, "box_id");
  const label = str(fd, "label_ar");
  const kind = str(fd, "kind") || "message";
  if (!boxId || label.length < 2) return { error: "اكتب نص العنصر." };

  const { supabase } = await getOwnedFamilyId();
  const { data: maxRow } = await supabase
    .from("reward_box_items")
    .select("sort_order")
    .eq("reward_box_id", boxId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = (maxRow?.sort_order ?? 0) + 1;
  const payload = kind === "xp" ? { xp: Math.max(1, Number(str(fd, "xp")) || 10) } : null;

  const { error } = await supabase.from("reward_box_items").insert({
    reward_box_id: boxId,
    kind,
    label_ar: label,
    payload,
    sort_order,
  });
  if (error) return { error: "تعذّر إضافة العنصر." };
  revalidatePath(`/rewards/${boxId}`);
  return { error: null };
}

export async function deleteRewardItem(_prev: unknown, fd: FormData) {
  const id = str(fd, "id");
  const boxId = str(fd, "box_id");
  const { supabase } = await getOwnedFamilyId();
  await supabase.from("reward_box_items").delete().eq("id", id);
  revalidatePath(`/rewards/${boxId}`);
  return { error: null };
}

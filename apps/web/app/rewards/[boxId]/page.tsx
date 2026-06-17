import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { getGuardianContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { Chip } from "@/components/ui/Chip";
import { BoxSettingsForm, DeleteBoxForm, AddItemForm, DeleteItemButton } from "../RewardForms";

export const dynamic = "force-dynamic";

const KIND_LABEL: Record<string, string> = {
  message: "رسالة", appreciation: "تقدير", privilege: "امتياز",
  material: "مادية", activity_choice: "نشاط", xp: "نقاط خبرة",
};

type Item = { id: string; kind: string; label_ar: string };
type Box = {
  id: string; title_ar: string; box_type: string; cost_coins: number; is_active: boolean; family_id: string;
};

export default async function BoxManagePage({ params }: { params: { boxId: string } }) {
  const { email, family } = await getGuardianContext();
  const supabase = createClient();

  const { data: boxData } = await supabase
    .from("reward_boxes")
    .select("id, title_ar, box_type, cost_coins, is_active, family_id")
    .eq("id", params.boxId)
    .maybeSingle();
  const box = boxData as Box | null;
  if (!box || !family || box.family_id !== family.id) notFound();

  const { data: itemsData } = await supabase
    .from("reward_box_items")
    .select("id, kind, label_ar")
    .eq("reward_box_id", box.id)
    .order("sort_order", { ascending: true });
  const items = (itemsData ?? []) as Item[];

  return (
    <>
      <Header email={email} />
      <main className="container-app space-y-5">
        <PageHeader icon="🎁" title={box.title_ar} subtitle="إدارة الصندوق وعناصره." backHref="/rewards" />

        <BoxSettingsForm
          boxId={box.id}
          title={box.title_ar}
          boxType={box.box_type}
          cost={box.cost_coins}
          isActive={box.is_active}
        />

        <section className="card">
          <h2 className="mb-3 font-display font-bold text-ghars-700">العناصر داخل الصندوق ({items.length})</h2>
          {items.length === 0 ? (
            <p className="text-sm text-ghars-500">لا توجد عناصر. أضف رسائلك ومكافآتك أدناه.</p>
          ) : (
            <ul className="space-y-2">
              {items.map((it) => (
                <li key={it.id} className="flex items-center justify-between rounded-xl border border-ghars-100 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Chip tone={it.kind === "xp" ? "joy" : it.kind === "material" ? "bloom" : "sky"}>
                      {KIND_LABEL[it.kind] ?? it.kind}
                    </Chip>
                    <span className="text-sm text-ghars-700">{it.label_ar}</span>
                  </div>
                  <DeleteItemButton id={it.id} boxId={box.id} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <AddItemForm boxId={box.id} />

        <div className="flex justify-end">
          <DeleteBoxForm boxId={box.id} />
        </div>
      </main>
    </>
  );
}

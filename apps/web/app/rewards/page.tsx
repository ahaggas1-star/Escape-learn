import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { getGuardianContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { Chip } from "@/components/ui/Chip";
import { AddRewardForm, DeleteRewardButton } from "./RewardForms";

export const dynamic = "force-dynamic";

const KIND_LABEL: Record<string, string> = {
  material: "مادية",
  privilege: "امتياز",
  activity_choice: "نشاط",
  appreciation: "تقدير",
  message: "رسالة",
  xp: "XP",
};

type Item = { id: string; kind: string; label_ar: string };

export default async function RewardsPage() {
  const { email, family } = await getGuardianContext();
  if (!family) redirect("/onboarding");
  const supabase = createClient();

  const { data: box } = await supabase
    .from("reward_boxes")
    .select("id")
    .eq("family_id", family.id)
    .limit(1)
    .maybeSingle();

  let items: Item[] = [];
  if (box) {
    const { data } = await supabase
      .from("reward_box_items")
      .select("id, kind, label_ar")
      .eq("reward_box_id", box.id)
      .order("sort_order", { ascending: true });
    items = (data ?? []) as Item[];
  }

  return (
    <>
      <Header email={email} />
      <main className="container-app space-y-5">
        <PageHeader
          icon="🎁"
          title="مكافآت الأسرة"
          subtitle="حدّد مكافآت صندوق الإنجاز — معنوية أو مادية. يحصل عليها الابن بعد إنجاز حقيقي."
          backHref="/dashboard"
        />

        <section className="card">
          <h2 className="mb-3 font-display font-bold text-ghars-700">المكافآت الحالية ({items.length})</h2>
          {items.length === 0 ? (
            <p className="text-sm text-ghars-500">لا توجد مكافآت بعد. أضف أول مكافأة.</p>
          ) : (
            <ul className="space-y-2">
              {items.map((it) => (
                <li key={it.id} className="flex items-center justify-between rounded-xl border border-ghars-100 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Chip tone={it.kind === "material" ? "bloom" : it.kind === "xp" ? "joy" : "sky"}>
                      {KIND_LABEL[it.kind] ?? it.kind}
                    </Chip>
                    <span className="text-sm font-semibold text-ghars-700">{it.label_ar}</span>
                  </div>
                  <DeleteRewardButton id={it.id} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <AddRewardForm />

        <p className="text-center text-xs text-ghars-500">
          تُمنح المكافآت بأسلوب تدويري شفّاف عند فتح الصندوق — بلا عشوائية أو دفع.
        </p>
      </main>
    </>
  );
}

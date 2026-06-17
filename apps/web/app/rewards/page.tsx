import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { getGuardianContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { Chip } from "@/components/ui/Chip";
import { CreateBoxForm } from "./RewardForms";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, { l: string; e: string; tone: "ghars" | "sky" | "bloom" }> = {
  normal: { l: "عادية", e: "🎁", tone: "ghars" },
  special: { l: "مميزة", e: "🎀", tone: "sky" },
  awesome: { l: "رهيبة", e: "💎", tone: "bloom" },
};

type Box = {
  id: string;
  title_ar: string;
  box_type: string;
  cost_coins: number;
  is_active: boolean;
  reward_box_items: { count: number }[];
};

export default async function RewardsPage() {
  const { email, family } = await getGuardianContext();
  if (!family) redirect("/onboarding");
  const supabase = createClient();

  const { data } = await supabase
    .from("reward_boxes")
    .select("id, title_ar, box_type, cost_coins, is_active, reward_box_items(count)")
    .eq("family_id", family.id)
    .order("cost_coins", { ascending: true });
  const boxes = (data ?? []) as Box[];

  return (
    <>
      <Header email={email} />
      <main className="container-app space-y-5">
        <PageHeader
          icon="🎁"
          title="صناديق المكافآت"
          subtitle="أنشئ صناديقك وضع فيها رسائلك ومكافآتك — يفتحها الطفل بعملاته."
          backHref="/dashboard"
        />

        <section className="space-y-2">
          <h2 className="font-display font-bold text-ghars-700">صناديق أسرتي ({boxes.length})</h2>
          {boxes.length === 0 ? (
            <p className="text-sm text-ghars-500">لا توجد صناديق بعد. أنشئ أول صندوق.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {boxes.map((b) => {
                const t = TYPE_LABEL[b.box_type] ?? TYPE_LABEL.normal;
                const items = b.reward_box_items?.[0]?.count ?? 0;
                return (
                  <Link key={b.id} href={`/rewards/${b.id}`} className="card flex items-center justify-between transition hover:border-ghars-500">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{t.e}</span>
                      <div>
                        <p className="font-display font-bold text-ghars-700">{b.title_ar}</p>
                        <p className="text-xs text-ghars-500">{items} عنصر · {b.cost_coins === 0 ? "مجاني" : `${b.cost_coins} 🪙`}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Chip tone={t.tone}>{t.l}</Chip>
                      {!b.is_active ? <span className="text-[10px] text-ghars-400">معطّل</span> : null}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <CreateBoxForm />

        <p className="text-center text-xs text-ghars-500">
          العملات يكسبها الطفل من إنجاز المهام والأهداف، ويصرفها على فتح الصناديق.
        </p>
      </main>
    </>
  );
}

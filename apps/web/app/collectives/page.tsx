import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { getGuardianContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getFamilyCollectives } from "@/lib/collectives";
import { PageHeader } from "@/components/ui/PageHeader";
import { CollectiveCard } from "./CollectiveCard";
import { CreateCollectiveForm } from "./CreateCollectiveForm";

export const dynamic = "force-dynamic";

export default async function CollectivesPage() {
  const { email, family } = await getGuardianContext();
  if (!family) redirect("/onboarding");

  const supabase = createClient();
  const [collectives, { data: values }] = await Promise.all([
    getFamilyCollectives(),
    supabase.from("core_values").select("id, label_ar").order("sort_order"),
  ]);

  const official = collectives.filter((c) => c.scope === "official");
  const fam = collectives.filter((c) => c.scope === "family");

  return (
    <>
      <Header email={email} />
      <main className="container-app space-y-6">
        <PageHeader
          icon="🎯"
          title="الإنجازات الجماعية"
          subtitle="أهداف تكملها الأسرة معًا — بتقدّم من المهام المعتمدة فقط."
          backHref="/dashboard"
        />

        {official.length > 0 ? (
          <section className="space-y-3">
            <h2 className="font-display font-bold text-ghars-700">تحديات رسمية 🏛️</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {official.map((c) => <CollectiveCard key={c.id} c={c} canClaim />)}
            </div>
          </section>
        ) : null}

        <section className="space-y-3">
          <h2 className="font-display font-bold text-ghars-700">إنجازات عائلتنا 🤝</h2>
          {fam.length === 0 ? (
            <p className="text-sm text-ghars-500">لا توجد إنجازات عائلية بعد. أنشئ أول إنجاز جماعي.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {fam.map((c) => <CollectiveCard key={c.id} c={c} canClaim />)}
            </div>
          )}
        </section>

        <CreateCollectiveForm values={values ?? []} />
      </main>
    </>
  );
}

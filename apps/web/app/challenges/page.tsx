import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { getGuardianContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { Chip } from "@/components/ui/Chip";
import { CreateChallengeForm, AwardChallengeForm } from "./ChallengeForms";

export const dynamic = "force-dynamic";

type Challenge = {
  id: string;
  title_ar: string;
  description_ar: string | null;
  reward_xp: number;
  start_date: string | null;
  end_date: string | null;
  core_values: { label_ar: string } | { label_ar: string }[] | null;
};

export default async function ChallengesPage() {
  const { email, family, children } = await getGuardianContext();
  if (!family) redirect("/onboarding");
  const supabase = createClient();

  const [{ data: ch }, { data: values }] = await Promise.all([
    supabase
      .from("family_challenges")
      .select("id, title_ar, description_ar, reward_xp, start_date, end_date, core_values(label_ar)")
      .eq("family_id", family.id)
      .order("created_at", { ascending: false }),
    supabase.from("core_values").select("id, label_ar").order("sort_order"),
  ]);

  const challenges = (ch ?? []) as Challenge[];
  const childOpts = children.map((c) => ({ id: c.id, display_name: c.display_name }));

  return (
    <>
      <Header email={email} />
      <main className="container-app space-y-5">
        <PageHeader
          icon="🚩"
          title="التحديات العائلية"
          subtitle="تحديات تجمع الأسرة حول قيمة، مع مكافأة جماعية."
          backHref="/dashboard"
        />

        <CreateChallengeForm values={values ?? []} />

        <section className="space-y-3">
          <h2 className="font-display font-bold text-ghars-700">التحديات ({challenges.length})</h2>
          {challenges.length === 0 ? (
            <p className="text-sm text-ghars-500">لا توجد تحديات بعد.</p>
          ) : (
            challenges.map((c) => {
              const cv = Array.isArray(c.core_values) ? c.core_values[0] : c.core_values;
              return (
                <div key={c.id} className="card">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display font-bold text-ghars-700">{c.title_ar}</h3>
                      {c.description_ar ? <p className="text-sm text-ghars-500">{c.description_ar}</p> : null}
                    </div>
                    <Chip tone="joy">+{c.reward_xp} نقطة خبرة</Chip>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {cv ? <Chip tone="ghars">{cv.label_ar}</Chip> : null}
                    {c.start_date || c.end_date ? (
                      <Chip tone="sky">{c.start_date ?? "?"} → {c.end_date ?? "?"}</Chip>
                    ) : null}
                  </div>
                  {childOpts.length > 0 ? (
                    <AwardChallengeForm challengeId={c.id} children={childOpts} />
                  ) : (
                    <p className="mt-2 text-xs text-ghars-500">أضف ابنًا لمنح إنجاز التحدي.</p>
                  )}
                </div>
              );
            })
          )}
        </section>
      </main>
    </>
  );
}

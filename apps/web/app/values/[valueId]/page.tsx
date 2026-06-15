import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { getGuardianContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { CoreValue, GoalTemplate, SubValue } from "@/lib/types";
import { TemplateGoalCard } from "./TemplateGoalCard";
import { CustomGoalForm } from "./CustomGoalForm";

export const dynamic = "force-dynamic";

export default async function ValueDetailPage({
  params,
}: {
  params: { valueId: string };
}) {
  const { email, children } = await getGuardianContext();
  const supabase = createClient();

  const { data: value } = await supabase
    .from("core_values")
    .select("*")
    .eq("id", params.valueId)
    .maybeSingle();
  if (!value) notFound();
  const coreValue = value as CoreValue;

  const [{ data: subs }, { data: templates }] = await Promise.all([
    supabase
      .from("sub_values")
      .select("*")
      .eq("core_value_id", coreValue.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("goal_templates")
      .select("*")
      .eq("core_value_id", coreValue.id)
      .eq("is_published", true)
      .order("created_at", { ascending: true }),
  ]);

  const subValues = (subs ?? []) as SubValue[];
  const goalTemplates = (templates ?? []) as GoalTemplate[];
  const noChildren = children.length === 0;

  return (
    <>
      <Header email={email} />
      <main className="container-app space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-ghars-700">{coreValue.label_ar}</h1>
            {coreValue.description_ar ? (
              <p className="text-sm text-ghars-500">{coreValue.description_ar}</p>
            ) : null}
          </div>
          <Link href="/values" className="btn-ghost text-xs">رجوع</Link>
        </div>

        {subValues.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {subValues.map((s) => (
              <span
                key={s.id}
                className="rounded-full bg-ghars-100 px-3 py-1 text-xs font-medium text-ghars-700"
              >
                {s.label_ar}
              </span>
            ))}
          </div>
        ) : null}

        {noChildren ? (
          <div className="card text-sm text-ghars-600">
            أضف ابنًا أولًا لتتمكن من ربط الأهداف.{" "}
            <Link href="/children/new" className="font-semibold text-ghars-700 underline">
              إضافة ابن
            </Link>
          </div>
        ) : (
          <>
            <section className="space-y-3">
              <h2 className="font-bold text-ghars-700">أهداف جاهزة مقترحة</h2>
              {goalTemplates.length === 0 ? (
                <p className="text-sm text-ghars-500">لا توجد أهداف جاهزة لهذه القيمة بعد.</p>
              ) : (
                <div className="grid gap-3">
                  {goalTemplates.map((t) => (
                    <TemplateGoalCard key={t.id} template={t} children={children} />
                  ))}
                </div>
              )}
            </section>

            <CustomGoalForm coreValueId={coreValue.id} children={children} />
          </>
        )}
      </main>
    </>
  );
}

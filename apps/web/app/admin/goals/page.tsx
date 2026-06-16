import Link from "next/link";
import { Header } from "@/components/Header";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PublishToggle } from "../PublishToggle";
import { DeleteTemplateButton } from "../DeleteTemplateButton";
import { GoalTemplateForm } from "./GoalTemplateForm";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

type GoalTpl = {
  id: string;
  title_ar: string;
  is_published: boolean;
  difficulty: string;
  core_values: { label_ar: string } | { label_ar: string }[] | null;
};

export default async function AdminGoalsPage() {
  const { email } = await requireStaff();
  const supabase = createClient();

  const [{ data: goals }, { data: values }, { data: subs }, { data: stages }] = await Promise.all([
    supabase
      .from("goal_templates")
      .select("id, title_ar, is_published, difficulty, core_values(label_ar)")
      .order("created_at", { ascending: false }),
    supabase.from("core_values").select("id, label_ar").order("sort_order"),
    supabase.from("sub_values").select("id, label_ar, core_value_id").order("sort_order"),
    supabase.from("age_stages").select("id, label_ar").order("sort_order"),
  ]);

  const list = (goals ?? []) as GoalTpl[];

  return (
    <>
      <Header email={email} />
      <main className="container-app space-y-5">
        <PageHeader icon="🎯" title="الأهداف الجاهزة" backHref="/admin" />

        <GoalTemplateForm values={values ?? []} subValues={subs ?? []} ageStages={stages ?? []} />

        <section className="card">
          <h2 className="mb-3 font-bold text-ghars-700">القائمة ({list.length})</h2>
          {list.length === 0 ? (
            <p className="text-sm text-ghars-500">لا توجد أهداف بعد.</p>
          ) : (
            <ul className="space-y-2">
              {list.map((g) => {
                const cv = Array.isArray(g.core_values) ? g.core_values[0] : g.core_values;
                return (
                  <li key={g.id} className="flex items-center justify-between rounded-xl border border-ghars-100 px-3 py-2.5">
                    <div>
                      <p className="font-semibold text-ghars-700">{g.title_ar}</p>
                      <p className="text-xs text-ghars-500">{cv?.label_ar} · {g.difficulty}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/goals/${g.id}/edit`} className="rounded-full px-2.5 py-1 text-xs text-ghars-600 hover:bg-ghars-50">تعديل</Link>
                      <PublishToggle table="goal_templates" id={g.id} published={g.is_published} />
                      <DeleteTemplateButton table="goal_templates" id={g.id} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}

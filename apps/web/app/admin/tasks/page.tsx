import Link from "next/link";
import { Header } from "@/components/Header";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PublishToggle } from "../PublishToggle";
import { DeleteTemplateButton } from "../DeleteTemplateButton";
import { TaskTemplateForm } from "./TaskTemplateForm";

export const dynamic = "force-dynamic";

type TaskTpl = {
  id: string;
  title_ar: string;
  is_published: boolean;
  base_xp: number;
  repeat_type: string;
  core_values: { label_ar: string } | { label_ar: string }[] | null;
};

export default async function AdminTasksPage() {
  const { email } = await requireStaff();
  const supabase = createClient();

  const [{ data: tasks }, { data: values }, { data: subs }, { data: stages }] = await Promise.all([
    supabase
      .from("task_templates")
      .select("id, title_ar, is_published, base_xp, repeat_type, core_values(label_ar)")
      .order("created_at", { ascending: false }),
    supabase.from("core_values").select("id, label_ar").order("sort_order"),
    supabase.from("sub_values").select("id, label_ar").order("sort_order"),
    supabase.from("age_stages").select("id, label_ar").order("sort_order"),
  ]);

  const list = (tasks ?? []) as TaskTpl[];

  return (
    <>
      <Header email={email} />
      <main className="container-app space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-ghars-700">المهام الجاهزة</h1>
          <Link href="/admin" className="btn-ghost text-xs">رجوع</Link>
        </div>

        <TaskTemplateForm values={values ?? []} subValues={subs ?? []} ageStages={stages ?? []} />

        <section className="card">
          <h2 className="mb-3 font-bold text-ghars-700">القائمة ({list.length})</h2>
          {list.length === 0 ? (
            <p className="text-sm text-ghars-500">لا توجد مهام بعد.</p>
          ) : (
            <ul className="space-y-2">
              {list.map((t) => {
                const cv = Array.isArray(t.core_values) ? t.core_values[0] : t.core_values;
                return (
                  <li key={t.id} className="flex items-center justify-between rounded-xl border border-ghars-100 px-3 py-2.5">
                    <div>
                      <p className="font-semibold text-ghars-700">{t.title_ar}</p>
                      <p className="text-xs text-ghars-500">{cv?.label_ar} · {t.base_xp} XP · {t.repeat_type}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <PublishToggle table="task_templates" id={t.id} published={t.is_published} />
                      <DeleteTemplateButton table="task_templates" id={t.id} />
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

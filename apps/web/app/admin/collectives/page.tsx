import { Header } from "@/components/Header";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { Chip } from "@/components/ui/Chip";
import { OfficialCollectiveForm, DeleteCollectiveButton } from "./OfficialForm";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  title_ar: string;
  icon: string;
  target: number;
  reward_xp: number;
  is_published: boolean;
};

export default async function AdminCollectivesPage() {
  const { email } = await requireStaff();
  const supabase = createClient();
  const [{ data: list }, { data: values }] = await Promise.all([
    supabase
      .from("collective_achievements")
      .select("id, title_ar, icon, target, reward_xp, is_published")
      .eq("scope", "official")
      .order("created_at", { ascending: false }),
    supabase.from("core_values").select("id, label_ar").order("sort_order"),
  ]);
  const rows = (list ?? []) as Row[];

  return (
    <>
      <Header email={email} />
      <main className="container-app space-y-5">
        <PageHeader icon="🏛️" title="التحديات الجماعية الرسمية" backHref="/admin" />

        <OfficialCollectiveForm values={values ?? []} />

        <section className="card">
          <h2 className="mb-3 font-display font-bold text-ghars-700">القائمة ({rows.length})</h2>
          {rows.length === 0 ? (
            <p className="text-sm text-ghars-500">لا توجد تحديات رسمية بعد.</p>
          ) : (
            <ul className="space-y-2">
              {rows.map((r) => (
                <li key={r.id} className="flex items-center justify-between rounded-xl border border-ghars-100 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{r.icon}</span>
                    <div>
                      <p className="font-semibold text-ghars-700">{r.title_ar}</p>
                      <p className="text-xs text-ghars-500">الهدف {r.target} · مكافأة {r.reward_xp}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Chip tone={r.is_published ? "ghars" : "joy"}>{r.is_published ? "منشور" : "مسودة"}</Chip>
                    <DeleteCollectiveButton id={r.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}

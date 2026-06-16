import { Header } from "@/components/Header";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AddValueForm, AddSubValueForm } from "./ValueForms";
import { PageHeader } from "@/components/ui/PageHeader";
import { Chip } from "@/components/ui/Chip";

export const dynamic = "force-dynamic";

type ValueRow = {
  id: string;
  label_ar: string;
  key: string;
  sub_values: { id: string; label_ar: string }[] | null;
};

export default async function AdminValuesPage() {
  const { email } = await requireStaff();
  const supabase = createClient();

  const [{ data: values }, { data: stages }] = await Promise.all([
    supabase
      .from("core_values")
      .select("id, label_ar, key, sub_values(id, label_ar)")
      .order("sort_order"),
    supabase.from("age_stages").select("id, label_ar").order("sort_order"),
  ]);

  const list = (values ?? []) as ValueRow[];

  return (
    <>
      <Header email={email} />
      <main className="container-app space-y-5">
        <PageHeader icon="💚" title="القيم" backHref="/admin" />

        <section className="card">
          <h2 className="mb-3 font-bold text-ghars-700">القيم الحالية</h2>
          <div className="space-y-3">
            {list.map((v) => (
              <div key={v.id} className="rounded-xl border border-ghars-100 p-3">
                <p className="font-bold text-ghars-700">{v.label_ar}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {(v.sub_values ?? []).map((s) => (
                    <Chip key={s.id} tone="sky">{s.label_ar}</Chip>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <AddValueForm ageStages={stages ?? []} />
        <AddSubValueForm values={list.map((v) => ({ id: v.id, label_ar: v.label_ar }))} />
      </main>
    </>
  );
}

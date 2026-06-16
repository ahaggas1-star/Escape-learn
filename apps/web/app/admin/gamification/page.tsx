import { Header } from "@/components/Header";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { Chip } from "@/components/ui/Chip";
import { BadgeForm, LevelForm, AchievementForm, DeleteGamButton } from "./GamificationForms";

export const dynamic = "force-dynamic";

type Row = { id: string; label_ar: string };
type LevelRow = Row & { min_xp: number };
type BadgeRow = Row & { condition_ar: string };

export default async function AdminGamificationPage() {
  const { email } = await requireStaff();
  const supabase = createClient();

  const [{ data: badges }, { data: levels }, { data: achs }, { data: values }] = await Promise.all([
    supabase.from("badges").select("id, label_ar, condition_ar").order("label_ar"),
    supabase.from("levels").select("id, label_ar, min_xp").order("min_xp"),
    supabase.from("achievements").select("id, label_ar").order("label_ar"),
    supabase.from("core_values").select("id, label_ar").order("sort_order"),
  ]);

  return (
    <>
      <Header email={email} />
      <main className="container-app space-y-5">
        <PageHeader icon="🏅" title="إدارة التلعيب" subtitle="الشارات والمستويات والإنجازات." backHref="/admin" />

        {/* الشارات */}
        <section className="card space-y-3">
          <h2 className="font-display font-bold text-ghars-700">الشارات</h2>
          <div className="flex flex-wrap gap-2">
            {((badges ?? []) as BadgeRow[]).map((b) => (
              <span key={b.id} className="inline-flex items-center gap-1 rounded-full bg-ghars-100 px-3 py-1 text-xs text-ghars-700">
                🏅 {b.label_ar}
                <DeleteGamButton table="badges" id={b.id} />
              </span>
            ))}
          </div>
          <BadgeForm values={values ?? []} />
        </section>

        {/* المستويات */}
        <section className="card space-y-3">
          <h2 className="font-display font-bold text-ghars-700">المستويات</h2>
          <div className="flex flex-wrap gap-2">
            {((levels ?? []) as LevelRow[]).map((l) => (
              <span key={l.id} className="inline-flex items-center gap-1 rounded-full bg-grape-100 px-3 py-1 text-xs text-grape-600">
                {l.label_ar} · {l.min_xp}+
                <DeleteGamButton table="levels" id={l.id} />
              </span>
            ))}
          </div>
          <LevelForm />
        </section>

        {/* الإنجازات */}
        <section className="card space-y-3">
          <h2 className="font-display font-bold text-ghars-700">الإنجازات</h2>
          <div className="flex flex-wrap gap-2">
            {((achs ?? []) as Row[]).map((a) => (
              <span key={a.id} className="inline-flex items-center gap-1 rounded-full bg-joy-100 px-3 py-1 text-xs text-joy-600">
                ⭐ {a.label_ar}
                <DeleteGamButton table="achievements" id={a.id} />
              </span>
            ))}
          </div>
          <AchievementForm />
        </section>

        <p className="text-center text-xs text-ghars-500">
          <Chip tone="ghars">ملاحظة</Chip> شروط منح الشارات/الإنجازات مُبرمجة في محرّك التلعيب؛ الإضافة هنا تعرّف العناصر.
        </p>
      </main>
    </>
  );
}

import { Header } from "@/components/Header";
import { getGuardianContext } from "@/lib/auth";
import { getChildrenLeaderboard } from "@/lib/collectives";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

const medal = (r: number) => (r === 1 ? "🥇" : r === 2 ? "🥈" : r === 3 ? "🥉" : `#${r}`);

export default async function ChildrenLeaderboardPage() {
  const { email } = await getGuardianContext();
  const rows = await getChildrenLeaderboard();

  return (
    <>
      <Header email={email} />
      <main className="container-app space-y-5">
        <PageHeader
          icon="🏆"
          title="أبطال قِيَم"
          subtitle="ترتيب الأبطال عبر العوائل — بالاسم الذي يختاره وليّ كل طفل."
          backHref="/leaderboard"
        />
        <section className="card">
          {rows.length === 0 ? (
            <p className="text-sm text-ghars-500">لا يوجد أبطال بعد.</p>
          ) : (
            <ul className="space-y-1.5">
              {rows.map((r) => (
                <li key={r.child_id} className="flex items-center justify-between rounded-xl border border-ghars-100 px-3 py-2.5">
                  <span className="flex items-center gap-3">
                    <span className="w-8 text-center text-lg">{medal(r.rank)}</span>
                    <span className="text-sm font-semibold text-ghars-700">{r.name}</span>
                  </span>
                  <span className="text-xs text-ghars-500">{r.total_xp} نقطة خبرة</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <p className="text-center text-xs text-ghars-500">
          الخصوصية: لا يظهر اسم الطفل إلا بالصيغة التي اختارها وليّه (لقب / اسم أول / كامل).
        </p>
      </main>
    </>
  );
}

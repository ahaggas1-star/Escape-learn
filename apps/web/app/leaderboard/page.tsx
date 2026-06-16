import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { getGuardianContext } from "@/lib/auth";
import { getLeaderboard } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

const medal = (rank: number) =>
  rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;

export default async function LeaderboardPage() {
  const { email, family } = await getGuardianContext();
  if (!family) redirect("/onboarding");

  const board = await getLeaderboard(family.id);
  const top = board.rows.slice(0, 10);
  const selfInTop = board.self ? top.some((r) => r.family_id === family.id) : false;

  return (
    <>
      <Header email={email} />
      <main className="container-app space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-ghars-700">ترتيب الأسر</h1>
            <p className="text-sm text-ghars-500">تنافس أسري محفّز — مجهول الهوية.</p>
          </div>
          <Link href="/dashboard" className="btn-ghost text-xs">رجوع</Link>
        </div>

        {/* شريط موضع أسرتكم */}
        {board.self ? (
          <section className="card bg-ghars-600 text-white">
            <p className="text-sm opacity-90">موضع أسرتكم</p>
            <div className="mt-1 flex items-end justify-between">
              <p className="text-2xl font-extrabold">المركز {board.self.rank} من {board.total}</p>
              {board.selfTopPercent != null ? (
                <p className="text-sm opacity-90">ضمن أعلى {board.selfTopPercent}%</p>
              ) : null}
            </div>
            <p className="mt-1 text-xs opacity-80">
              {board.self.total_xp} XP · {board.self.approved_tasks} مهمة معتمدة
            </p>
          </section>
        ) : (
          <section className="card text-sm text-ghars-600">
            ابدأ بإنجاز المهام لتظهر أسرتكم في الترتيب.
          </section>
        )}

        {/* أعلى الأسر (مجهولة الهوية) */}
        <section className="card">
          <h2 className="mb-3 font-bold text-ghars-700">أعلى الأسر</h2>
          <ul className="space-y-1.5">
            {top.map((r) => {
              const isSelf = r.family_id === family.id;
              return (
                <li
                  key={r.family_id}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${
                    isSelf ? "border-ghars-500 bg-ghars-50" : "border-ghars-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 text-center text-lg">{medal(r.rank)}</span>
                    <span className={`text-sm font-semibold ${isSelf ? "text-ghars-700" : "text-ghars-600"}`}>
                      {isSelf ? "أسرتكم" : "أسرة مشاركة"}
                    </span>
                  </div>
                  <span className="text-xs text-ghars-500">
                    {r.total_xp} XP · {r.approved_tasks} مهمة
                  </span>
                </li>
              );
            })}
          </ul>
          {board.self && !selfInTop ? (
            <div className="mt-2 flex items-center justify-between rounded-xl border border-ghars-500 bg-ghars-50 px-3 py-2.5">
              <div className="flex items-center gap-3">
                <span className="w-8 text-center text-sm">#{board.self.rank}</span>
                <span className="text-sm font-semibold text-ghars-700">أسرتكم</span>
              </div>
              <span className="text-xs text-ghars-500">
                {board.self.total_xp} XP · {board.self.approved_tasks} مهمة
              </span>
            </div>
          ) : null}
        </section>

        <p className="text-center text-xs text-ghars-500">
          خصوصية: الترتيب لا يعرض أسماء الأسر أو الأطفال — أرقام مجمّعة فقط.
        </p>
      </main>
    </>
  );
}

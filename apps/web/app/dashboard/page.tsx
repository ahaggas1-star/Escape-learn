import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { getGuardianContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { email, family, children } = await getGuardianContext();

  // لا توجد أسرة بعد → ابدأ الإعداد.
  if (!family) redirect("/onboarding");

  return (
    <>
      <Header email={email} />
      <main className="container-app space-y-5">
        <div>
          <h1 className="text-xl font-extrabold text-ghars-700">
            {family.name ? `أسرة ${family.name}` : "أسرتي"}
          </h1>
          <p className="text-sm text-ghars-500">
            اختر قيمة، حوّلها إلى أهداف ومهام، وتابِع تقدّم أبنائك.
          </p>
        </div>

        <section className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-ghars-700">الأبناء</h2>
            <Link href="/children/new" className="btn-ghost text-xs">
              + إضافة ابن
            </Link>
          </div>
          {children.length === 0 ? (
            <p className="text-sm text-ghars-500">لا يوجد أبناء بعد. أضف أول ابن للبدء.</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {children.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/children/${c.id}`}
                    className="flex items-center justify-between rounded-xl border border-ghars-100 px-3 py-2.5 transition hover:border-ghars-500"
                  >
                    <div>
                      <p className="font-semibold text-ghars-700">{c.display_name}</p>
                      {c.age != null ? (
                        <p className="text-xs text-ghars-500">{c.age} سنة</p>
                      ) : null}
                    </div>
                    <span className="text-xs text-ghars-500">لوحة الابن ←</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <Link href="/values" className="card transition hover:border-ghars-500">
            <h3 className="font-bold text-ghars-700">اختيار قيمة</h3>
            <p className="mt-1 text-sm text-ghars-500">
              ابدأ من إحدى القيم الأربع وحوّلها إلى أهداف ومهام.
            </p>
          </Link>
          <Link href="/review" className="card transition hover:border-ghars-500">
            <h3 className="font-bold text-ghars-700">المراجعة والاعتماد</h3>
            <p className="mt-1 text-sm text-ghars-500">
              اعتمد إنجازات الأبناء وامنح XP.
            </p>
          </Link>
          <Link href="/reports" className="card transition hover:border-ghars-500">
            <h3 className="font-bold text-ghars-700">التقارير</h3>
            <p className="mt-1 text-sm text-ghars-500">تقارير الابن والأسرة ومؤشرات عامة.</p>
          </Link>
          <Link href="/leaderboard" className="card transition hover:border-ghars-500">
            <h3 className="font-bold text-ghars-700">ترتيب الأسر</h3>
            <p className="mt-1 text-sm text-ghars-500">تنافس أسري محفّز ومجهول الهوية.</p>
          </Link>
        </section>
      </main>
    </>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { getGuardianContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId, email, family, children } = await getGuardianContext();

  // لا توجد أسرة بعد → ابدأ الإعداد.
  if (!family) redirect("/onboarding");

  // هل المستخدم من طاقم المحتوى (لإظهار رابط لوحة الإدارة)؟
  const supabase = createClient();
  const { data: roleRow } = await supabase.from("users").select("role").eq("id", userId).maybeSingle();
  const isStaff = roleRow?.role === "content_manager" || roleRow?.role === "system_admin";

  return (
    <>
      <Header email={email} />
      <main className="container-app space-y-5">
        <div className="rounded-3xl bg-gradient-to-l from-ghars-500 to-ghars-600 p-5 text-white shadow-soft">
          <p className="text-sm opacity-90">أهلًا بك 👋</p>
          <h1 className="font-display text-2xl font-extrabold">
            {family.name ? `أسرة ${family.name}` : "أسرتي"}
          </h1>
          <p className="mt-1 text-sm opacity-90">
            اختر قيمة، حوّلها إلى أهداف ومهام، وتابِع تقدّم أبنائك 🌱
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
          {[
            { href: "/values", icon: "🌱", bg: "from-ghars-50 to-ghars-100", title: "اختيار قيمة", desc: "ابدأ من إحدى القيم الأربع وحوّلها إلى أهداف ومهام." },
            { href: "/review", icon: "✅", bg: "from-sky-50 to-sky-100", title: "المراجعة والاعتماد", desc: "اعتمد إنجازات الأبناء وامنح نقاط الخبرة." },
            { href: "/reports", icon: "📊", bg: "from-grape-50 to-grape-100", title: "التقارير", desc: "تقارير الابن والأسرة ومؤشرات عامة." },
            { href: "/leaderboard", icon: "🏆", bg: "from-joy-50 to-joy-100", title: "ترتيب الأسر", desc: "تنافس أسري محفّز ومجهول الهوية." },
            { href: "/challenges", icon: "🚩", bg: "from-bloom-50 to-bloom-100", title: "التحديات العائلية", desc: "تحديات تجمع الأسرة حول قيمة." },
            { href: "/rewards", icon: "🎁", bg: "from-joy-50 to-bloom-100", title: "مكافآت الأسرة", desc: "حدّد مكافآت الصندوق المعنوية والمادية." },
          ].map((a) => (
            <Link key={a.href} href={a.href} className={`card bg-gradient-to-br ${a.bg} transition hover:-translate-y-0.5 hover:shadow-soft`}>
              <div className="mb-1 text-2xl">{a.icon}</div>
              <h3 className="font-display font-bold text-ghars-800">{a.title}</h3>
              <p className="mt-0.5 text-sm text-ghars-600">{a.desc}</p>
            </Link>
          ))}
          {isStaff ? (
            <Link href="/admin" className="card bg-gradient-to-br from-bloom-50 to-bloom-100 transition hover:-translate-y-0.5 hover:shadow-soft">
              <div className="mb-1 text-2xl">🛠️</div>
              <h3 className="font-display font-bold text-ghars-800">لوحة إدارة المحتوى</h3>
              <p className="mt-0.5 text-sm text-ghars-600">إدارة القيم والأهداف والمهام الجاهزة.</p>
            </Link>
          ) : null}
        </section>

        <div className="flex items-center justify-center gap-4">
          <Link href="/guide" className="text-xs font-semibold text-ghars-500 hover:text-ghars-700">
            📖 دليل ولي الأمر
          </Link>
          <Link href="/settings" className="text-xs font-semibold text-ghars-500 hover:text-ghars-700">
            ⚙️ الإعدادات والخصوصية
          </Link>
        </div>
      </main>
    </>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { getGuardianContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { QuickStart, type Step } from "./QuickStart";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId, email, family, children } = await getGuardianContext();

  // لا توجد أسرة بعد → ابدأ الإعداد.
  if (!family) redirect("/onboarding");

  // هل المستخدم من طاقم المحتوى (لإظهار رابط لوحة الإدارة)؟
  const supabase = createClient();
  const { data: roleRow } = await supabase.from("users").select("role").eq("id", userId).maybeSingle();
  const isStaff = roleRow?.role === "content_manager" || roleRow?.role === "system_admin";

  // تقدّم رحلة البداية الموجّهة.
  const childIds = children.map((c) => c.id);
  const [loginRes, goalsRes, tasksRes, boxesRes] = await Promise.all([
    supabase.from("children").select("id", { count: "exact", head: true }).eq("family_id", family.id).not("username", "is", null),
    supabase.from("goals").select("id", { count: "exact", head: true }).eq("family_id", family.id),
    childIds.length
      ? supabase.from("assigned_tasks").select("id", { count: "exact", head: true }).in("child_id", childIds)
      : Promise.resolve({ count: 0 } as { count: number | null }),
    supabase.from("reward_boxes").select("id", { count: "exact", head: true }).eq("family_id", family.id),
  ]);
  const steps: Step[] = [
    { key: "child", icon: "👦", title: "أضف أول ابن", desc: "ابدأ بإضافة طفل لربط أهدافه ومهامه به.", href: "/children/new", cta: "أضف ابن", done: children.length > 0 },
    { key: "login", icon: "🔑", title: "جهّز دخول الطفل", desc: "أنشئ له اسم مستخدم وكلمة مرور ليدخل بنفسه ويرى مهامه.", href: childIds[0] ? `/children/${childIds[0]}` : "/dashboard", cta: "جهّز الدخول", done: (loginRes.count ?? 0) > 0 },
    { key: "goal", icon: "🌱", title: "اختر قيمة وحوّلها هدفًا", desc: "من القيم الأربع، اختر هدفًا قابلًا للقياس.", href: "/values", cta: "اختر قيمة", done: (goalsRes.count ?? 0) > 0 },
    { key: "task", icon: "📋", title: "أسند أول مهمة", desc: "مهمة يومية بسيطة مع طريقة إثبات.", href: "/values", cta: "أسند مهمة", done: (tasksRes.count ?? 0) > 0 },
    { key: "reward", icon: "🎁", title: "أنشئ صندوق مكافآت", desc: "ضع رسائلك ومكافآتك يفتحها الطفل بعملاته.", href: "/rewards", cta: "أنشئ صندوقًا", done: (boxesRes.count ?? 0) > 0 },
  ];

  return (
    <>
      <Header email={email} />
      <main className="container-app space-y-5">
        <div className="rounded-2xl bg-ghars-700 p-5 text-white shadow-soft">
          <p className="text-sm text-white/70">أهلًا بك</p>
          <h1 className="font-display text-2xl font-bold">
            {family.name ? `أسرة ${family.name}` : "أسرتي"}
          </h1>
          <p className="mt-1 text-sm text-white/80">
            اختر قيمة، حوّلها إلى أهداف ومهام، وتابِع تقدّم أبنائك.
          </p>
        </div>

        <QuickStart steps={steps} familyName={family.name ? `أسرة ${family.name}` : "أسرتك"} />

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
            { href: "/values", icon: "🌱", tint: "bg-ghars-50 text-ghars-700", title: "اختيار قيمة", desc: "ابدأ من إحدى القيم الأربع وحوّلها إلى أهداف ومهام." },
            { href: "/review", icon: "✅", tint: "bg-sky-50 text-sky-600", title: "المراجعة والاعتماد", desc: "اعتمد إنجازات الأبناء وامنح نقاط الخبرة." },
            { href: "/reports", icon: "📊", tint: "bg-grape-50 text-grape-600", title: "التقارير", desc: "تقارير الابن والأسرة ومؤشرات عامة." },
            { href: "/leaderboard", icon: "🏆", tint: "bg-joy-50 text-joy-600", title: "ترتيب الأسر", desc: "تنافس أسري محفّز ومجهول الهوية." },
            { href: "/challenges", icon: "🚩", tint: "bg-bloom-50 text-bloom-600", title: "التحديات العائلية", desc: "تحديات تجمع الأسرة حول قيمة." },
            { href: "/collectives", icon: "🎯", tint: "bg-sky-50 text-sky-600", title: "الإنجازات الجماعية", desc: "أهداف تكملها الأسرة معًا بشريط تقدّم." },
            { href: "/rewards", icon: "🎁", tint: "bg-joy-50 text-joy-600", title: "مكافآت الأسرة", desc: "حدّد مكافآت الصناديق وتكلفتها بالعملات." },
          ].map((a) => (
            <Link key={a.href} href={a.href} className="card flex items-start gap-3 transition hover:border-ghars-300 hover:shadow-soft">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl ${a.tint}`}>{a.icon}</span>
              <div>
                <h3 className="font-display font-semibold text-ghars-900">{a.title}</h3>
                <p className="mt-0.5 text-sm text-slate-500">{a.desc}</p>
              </div>
            </Link>
          ))}
          {isStaff ? (
            <Link href="/admin" className="card flex items-start gap-3 transition hover:border-ghars-300 hover:shadow-soft">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ghars-50 text-xl text-ghars-700">🛠️</span>
              <div>
                <h3 className="font-display font-semibold text-ghars-900">لوحة إدارة المحتوى</h3>
                <p className="mt-0.5 text-sm text-slate-500">إدارة القيم والأهداف والمهام الجاهزة.</p>
              </div>
            </Link>
          ) : null}
        </section>

        <div className="flex items-center justify-center gap-4">
          <Link href="/guide" className="text-xs font-semibold text-slate-500 hover:text-ghars-700">
            دليل ولي الأمر
          </Link>
          <Link href="/settings" className="text-xs font-semibold text-slate-500 hover:text-ghars-700">
            الإعدادات والخصوصية
          </Link>
        </div>
      </main>
    </>
  );
}

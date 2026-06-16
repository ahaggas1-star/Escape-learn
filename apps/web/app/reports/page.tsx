import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { getGuardianContext } from "@/lib/auth";
import { getFamilyReport, getPlatformMetrics } from "@/lib/reports";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="stat">
      <p className="stat-value">{value}</p>
      <p className="stat-label">{label}</p>
      {hint ? <p className="mt-0.5 text-[10px] text-ghars-400">{hint}</p> : null}
    </div>
  );
}

export default async function ReportsPage() {
  const { email, family, children } = await getGuardianContext();
  if (!family) redirect("/onboarding");

  const [fam, platform] = await Promise.all([
    getFamilyReport(family.id),
    getPlatformMetrics(),
  ]);

  return (
    <>
      <Header email={email} />
      <main className="container-app space-y-6">
        <PageHeader
          icon="📊"
          title="التقارير"
          subtitle="قياس التقدم والأثر داخل الأسرة."
          backHref="/dashboard"
        />

        {/* تقرير الأسرة */}
        <section className="card space-y-3">
          <h2 className="font-bold text-ghars-700">تقرير الأسرة</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="الأبناء" value={fam.childrenCount} />
            <Stat label="أهداف نشطة" value={fam.goalsActive} />
            <Stat label="نسبة الإكمال" value={`${fam.completionRate}%`} />
            <Stat label="إنجاز هذا الأسبوع" value={fam.approvedLast7} hint="مهام معتمدة" />
          </div>
          {fam.topValues.length > 0 ? (
            <div>
              <p className="mb-1.5 text-sm font-medium text-ghars-700">أكثر القيم استخدامًا</p>
              <div className="flex flex-wrap gap-2">
                {fam.topValues.map((v) => (
                  <span key={v.value} className="rounded-full bg-ghars-100 px-3 py-1 text-xs text-ghars-700">
                    {v.value} · {v.count}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        {/* تقارير الأبناء */}
        <section className="space-y-3">
          <h2 className="font-bold text-ghars-700">تقارير الأبناء</h2>
          {children.length === 0 ? (
            <p className="text-sm text-ghars-500">لا يوجد أبناء بعد.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {children.map((c) => (
                <Link
                  key={c.id}
                  href={`/reports/child/${c.id}`}
                  className="flex items-center justify-between rounded-xl border border-ghars-100 px-3 py-2.5 transition hover:border-ghars-500"
                >
                  <span className="font-semibold text-ghars-700">{c.display_name}</span>
                  <span className="text-xs text-ghars-500">عرض التقرير ←</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* مؤشرات عامة مجهولة الهوية */}
        {platform ? (
          <section className="card space-y-3">
            <div>
              <h2 className="font-bold text-ghars-700">مؤشرات عامة للمنصة</h2>
              <p className="text-xs text-ghars-500">
                أرقام مجمّعة مجهولة الهوية — لا تعرض بيانات أطفال فردية (للعرض الإداري/الاستثماري).
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="الأسر" value={platform.families} />
              <Stat label="الأبناء" value={platform.children} />
              <Stat label="أهداف" value={platform.goals} />
              <Stat label="مهام معتمدة" value={platform.tasks_completed} />
              <Stat label="نسبة الإكمال" value={`${platform.completion_rate}%`} />
              <Stat label="شارات مُنحت" value={platform.badges_awarded} />
              <Stat label="صناديق فُتحت" value={platform.reward_opens} />
              <Stat label="أهداف خاصة" value={platform.goals_custom} />
            </div>
          </section>
        ) : null}
      </main>
    </>
  );
}

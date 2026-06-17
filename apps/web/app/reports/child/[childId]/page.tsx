import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { getGuardianContext } from "@/lib/auth";
import { getChildReport } from "@/lib/reports";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="stat">
      <p className="stat-value">{value}</p>
      <p className="stat-label">{label}</p>
    </div>
  );
}

export default async function ChildReportPage({
  params,
}: {
  params: { childId: string };
}) {
  const { email, family, children } = await getGuardianContext();
  const child = children.find((c) => c.id === params.childId);
  if (!family || !child) notFound();

  const r = await getChildReport(child.id);

  return (
    <>
      <Header email={email} />
      <main className="container-app space-y-5">
        <PageHeader
          icon="📄"
          title={`تقرير: ${child.display_name}`}
          subtitle={`المستوى: ${r.progress.level?.label_ar ?? "—"} · ${r.progress.totalXp} نقطة خبرة`}
          backHref="/reports"
        />

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="أهداف نشطة" value={r.goalsActive} />
          <Stat label="مهام معتمدة" value={r.tasksApproved} />
          <Stat label="نسبة الالتزام" value={`${r.completionRate}%`} />
          <Stat label="مهام متأخرة" value={r.tasksLate} />
          <Stat label="الشارات" value={r.badges} />
          <Stat label="الإنجازات" value={r.achievements} />
          <Stat label="إجمالي المهام" value={r.tasksTotal} />
          <Stat label="نقاط الخبرة" value={r.progress.totalXp} />
        </div>

        {r.topValue ? (
          <div className="card text-sm">
            <span className="font-semibold text-ghars-700">أكثر قيمة تفاعلت: </span>
            <span className="text-ghars-600">{r.topValue}</span>
          </div>
        ) : null}

        <div className="flex gap-2">
          <Link href={`/children/${child.id}`} className="btn-ghost text-xs">لوحة الابن</Link>
        </div>
      </main>
    </>
  );
}

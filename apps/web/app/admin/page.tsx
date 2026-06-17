import Link from "next/link";
import { Header } from "@/components/Header";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const { email, role } = await requireStaff();
  const supabase = createClient();

  const [{ count: goals }, { count: tasks }, { count: values }] = await Promise.all([
    supabase.from("goal_templates").select("id", { count: "exact", head: true }),
    supabase.from("task_templates").select("id", { count: "exact", head: true }),
    supabase.from("core_values").select("id", { count: "exact", head: true }),
  ]);

  return (
    <>
      <Header email={email} />
      <main className="container-app space-y-5">
        <PageHeader
          icon="🛠️"
          title="لوحة إدارة المحتوى"
          subtitle={`دورك: ${role === "system_admin" ? "مدير النظام" : "مدير المحتوى"}`}
          backHref="/dashboard"
          backLabel="لوحة ولي الأمر"
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/admin/goals" className="card bg-gradient-to-br from-ghars-50 to-ghars-100 transition hover:-translate-y-0.5 hover:shadow-soft">
            <div className="mb-1 text-2xl">🎯</div>
            <h2 className="font-display font-bold text-ghars-800">الأهداف الجاهزة</h2>
            <p className="stat-value">{goals ?? 0}</p>
            <p className="text-xs text-ghars-500">إنشاء/نشر أهداف جاهزة</p>
          </Link>
          <Link href="/admin/tasks" className="card bg-gradient-to-br from-sky-50 to-sky-100 transition hover:-translate-y-0.5 hover:shadow-soft">
            <div className="mb-1 text-2xl">📝</div>
            <h2 className="font-display font-bold text-ghars-800">المهام الجاهزة</h2>
            <p className="stat-value">{tasks ?? 0}</p>
            <p className="text-xs text-ghars-500">إنشاء/نشر مهام جاهزة</p>
          </Link>
          <Link href="/admin/values" className="card bg-gradient-to-br from-bloom-50 to-bloom-100 transition hover:-translate-y-0.5 hover:shadow-soft">
            <div className="mb-1 text-2xl">💚</div>
            <h2 className="font-display font-bold text-ghars-800">القيم</h2>
            <p className="stat-value">{values ?? 0}</p>
            <p className="text-xs text-ghars-500">إدارة القيم والقيم الفرعية</p>
          </Link>
          <Link href="/admin/gamification" className="card bg-gradient-to-br from-joy-50 to-joy-100 transition hover:-translate-y-0.5 hover:shadow-soft">
            <div className="mb-1 text-2xl">🏅</div>
            <h2 className="font-display font-bold text-ghars-800">التلعيب</h2>
            <p className="mt-1 text-sm text-ghars-500">الشارات والمستويات والإنجازات</p>
          </Link>
          {role === "system_admin" ? (
            <>
              <Link href="/admin/users" className="card bg-gradient-to-br from-grape-50 to-grape-100 transition hover:-translate-y-0.5 hover:shadow-soft">
                <div className="mb-1 text-2xl">👥</div>
                <h2 className="font-display font-bold text-ghars-800">إدارة الأدوار</h2>
                <p className="mt-1 text-sm text-ghars-500">تعيين أدوار المستخدمين</p>
              </Link>
              <Link href="/admin/system" className="card bg-gradient-to-br from-sky-50 to-grape-100 transition hover:-translate-y-0.5 hover:shadow-soft">
                <div className="mb-1 text-2xl">🛡️</div>
                <h2 className="font-display font-bold text-ghars-800">لوحة النظام</h2>
                <p className="mt-1 text-sm text-ghars-500">سجلات الموافقات والعمليات</p>
              </Link>
            </>
          ) : null}
          <Link href="/admin/guide" className="card bg-gradient-to-br from-joy-50 to-sky-100 transition hover:-translate-y-0.5 hover:shadow-soft">
            <div className="mb-1 text-2xl">📚</div>
            <h2 className="font-display font-bold text-ghars-800">دليل الإدارة</h2>
            <p className="mt-1 text-sm text-ghars-500">شرح تفصيلي لكيفية عمل المنصة</p>
          </Link>
        </div>
      </main>
    </>
  );
}

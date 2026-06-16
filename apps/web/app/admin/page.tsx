import Link from "next/link";
import { Header } from "@/components/Header";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

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
        <div>
          <h1 className="text-xl font-extrabold text-ghars-700">لوحة إدارة المحتوى</h1>
          <p className="text-sm text-ghars-500">دورك: {role === "system_admin" ? "مدير النظام" : "مدير المحتوى"}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/admin/goals" className="card transition hover:border-ghars-500">
            <h2 className="font-bold text-ghars-700">الأهداف الجاهزة</h2>
            <p className="mt-1 text-3xl font-extrabold text-ghars-700">{goals ?? 0}</p>
            <p className="text-xs text-ghars-500">إنشاء/نشر أهداف جاهزة</p>
          </Link>
          <Link href="/admin/tasks" className="card transition hover:border-ghars-500">
            <h2 className="font-bold text-ghars-700">المهام الجاهزة</h2>
            <p className="mt-1 text-3xl font-extrabold text-ghars-700">{tasks ?? 0}</p>
            <p className="text-xs text-ghars-500">إنشاء/نشر مهام جاهزة</p>
          </Link>
          <Link href="/admin/values" className="card transition hover:border-ghars-500">
            <h2 className="font-bold text-ghars-700">القيم</h2>
            <p className="mt-1 text-3xl font-extrabold text-ghars-700">{values ?? 0}</p>
            <p className="text-xs text-ghars-500">إدارة القيم والقيم الفرعية</p>
          </Link>
        </div>

        <Link href="/dashboard" className="btn-ghost text-xs">العودة للوحة ولي الأمر</Link>
      </main>
    </>
  );
}

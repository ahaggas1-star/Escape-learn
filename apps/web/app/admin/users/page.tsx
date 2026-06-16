import Link from "next/link";
import { Header } from "@/components/Header";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { RoleForm } from "./RoleForm";

export const dynamic = "force-dynamic";

type UserRow = { id: string; email: string | null; role: string };

export default async function AdminUsersPage() {
  const { email } = await requireAdmin();
  const supabase = createClient();
  const { data } = await supabase
    .from("users")
    .select("id, email, role")
    .order("role", { ascending: true });
  const users = (data ?? []) as UserRow[];

  return (
    <>
      <Header email={email} />
      <main className="container-app space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-ghars-700">إدارة الأدوار</h1>
            <p className="text-sm text-ghars-500">تعيين أدوار المستخدمين (مدير النظام فقط).</p>
          </div>
          <Link href="/admin" className="btn-ghost text-xs">رجوع</Link>
        </div>

        <section className="card space-y-2">
          {users.length === 0 ? (
            <p className="text-sm text-ghars-500">لا يوجد مستخدمون.</p>
          ) : (
            users.map((u) => <RoleForm key={u.id} userId={u.id} email={u.email} role={u.role} />)
          )}
        </section>
      </main>
    </>
  );
}

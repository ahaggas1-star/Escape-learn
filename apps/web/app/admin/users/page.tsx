import { Header } from "@/components/Header";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { RoleForm } from "./RoleForm";
import { PageHeader } from "@/components/ui/PageHeader";

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
        <PageHeader
          icon="👥"
          title="إدارة الأدوار"
          subtitle="تعيين أدوار المستخدمين (مدير النظام فقط)."
          backHref="/admin"
        />

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

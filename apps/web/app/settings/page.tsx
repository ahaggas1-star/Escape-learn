import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { getGuardianContext } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { DeleteChildButton, DeleteFamilyForm } from "./SettingsForms";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { email, family, children } = await getGuardianContext();
  if (!family) redirect("/onboarding");

  return (
    <>
      <Header email={email} />
      <main className="container-app space-y-5">
        <PageHeader
          icon="⚙️"
          title="الإعدادات والخصوصية"
          subtitle="إدارة بياناتك وحق الحذف."
          backHref="/dashboard"
        />

        <section className="card">
          <h2 className="mb-1 font-display font-bold text-ghars-700">الأسرة</h2>
          <p className="text-sm text-ghars-500">
            {family.name ? `أسرة ${family.name}` : "أسرتي"} · {children.length} ابن/ابنة
          </p>
        </section>

        {children.length > 0 ? (
          <section className="card space-y-2">
            <h2 className="font-display font-bold text-ghars-700">حذف ابن</h2>
            <p className="text-sm text-ghars-500">يحذف الابن وكل بياناته (مهام، تقدّم، شارات).</p>
            {children.map((c) => (
              <DeleteChildButton key={c.id} childId={c.id} name={c.display_name} />
            ))}
          </section>
        ) : null}

        <DeleteFamilyForm />

        <p className="text-center text-xs text-ghars-400">
          تُسجَّل عمليات الحذف في سجل العمليات (audit) حفاظًا على الشفافية.
        </p>
      </main>
    </>
  );
}

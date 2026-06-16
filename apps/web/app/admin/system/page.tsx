import { Header } from "@/components/Header";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { Chip } from "@/components/ui/Chip";

export const dynamic = "force-dynamic";

const CONSENT_LABEL: Record<string, string> = {
  privacy_policy: "سياسة الخصوصية",
  photo_upload: "رفع الصور",
  gamification: "التلعيب",
  data_processing: "معالجة البيانات",
};

type Consent = { id: string; user_id: string; kind: string; granted: boolean; created_at: string };
type Audit = { id: string; actor_id: string | null; action: string; entity: string | null; created_at: string };

const fmt = (s: string) => new Date(s).toLocaleString("ar", { dateStyle: "short", timeStyle: "short" });
const mask = (id: string | null) => (id ? id.slice(0, 8) : "—");

export default async function AdminSystemPage() {
  const { email } = await requireAdmin();
  const supabase = createClient();

  const [{ data: consent }, { data: audit }] = await Promise.all([
    supabase.from("consent_logs").select("id, user_id, kind, granted, created_at").order("created_at", { ascending: false }).limit(20),
    supabase.from("audit_logs").select("id, actor_id, action, entity, created_at").order("created_at", { ascending: false }).limit(20),
  ]);

  const consents = (consent ?? []) as Consent[];
  const audits = (audit ?? []) as Audit[];

  return (
    <>
      <Header email={email} />
      <main className="container-app space-y-5">
        <PageHeader icon="🛡️" title="لوحة مدير النظام" subtitle="سجلات الموافقات والعمليات." backHref="/admin" />

        <section className="card">
          <h2 className="mb-3 font-display font-bold text-ghars-700">سجل الموافقات ({consents.length})</h2>
          {consents.length === 0 ? (
            <p className="text-sm text-ghars-500">لا توجد موافقات مسجّلة.</p>
          ) : (
            <ul className="space-y-1.5">
              {consents.map((c) => (
                <li key={c.id} className="flex items-center justify-between rounded-xl border border-ghars-100 px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Chip tone={c.granted ? "ghars" : "bloom"}>{c.granted ? "موافقة" : "رفض"}</Chip>
                    <span className="text-ghars-700">{CONSENT_LABEL[c.kind] ?? c.kind}</span>
                    <span className="text-xs text-ghars-400" dir="ltr">{mask(c.user_id)}</span>
                  </div>
                  <span className="text-xs text-ghars-400">{fmt(c.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h2 className="mb-3 font-display font-bold text-ghars-700">سجل العمليات ({audits.length})</h2>
          {audits.length === 0 ? (
            <p className="text-sm text-ghars-500">لا توجد عمليات مسجّلة.</p>
          ) : (
            <ul className="space-y-1.5">
              {audits.map((a) => (
                <li key={a.id} className="flex items-center justify-between rounded-xl border border-ghars-100 px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Chip tone="grape">{a.action}</Chip>
                    {a.entity ? <span className="text-xs text-ghars-500">{a.entity}</span> : null}
                    <span className="text-xs text-ghars-400" dir="ltr">{mask(a.actor_id)}</span>
                  </div>
                  <span className="text-xs text-ghars-400">{fmt(a.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}

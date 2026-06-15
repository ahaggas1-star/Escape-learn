import Link from "next/link";
import { Header } from "@/components/Header";
import { getGuardianContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { CoreValue } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ValuesPage() {
  const { email } = await getGuardianContext();
  const supabase = createClient();
  const { data } = await supabase
    .from("core_values")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  const values = (data ?? []) as CoreValue[];

  return (
    <>
      <Header email={email} />
      <main className="container-app space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-ghars-700">اختيار قيمة</h1>
            <p className="text-sm text-ghars-500">ابدأ من قيمة، ثم حوّلها إلى أهداف ومهام.</p>
          </div>
          <Link href="/dashboard" className="btn-ghost text-xs">رجوع</Link>
        </div>

        {values.length === 0 ? (
          <div className="card text-sm text-ghars-500">
            لم تُحمَّل القيم. تأكد من تطبيق بيانات <code>supabase/seed</code>.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {values.map((v) => (
              <Link
                key={v.id}
                href={`/values/${v.id}`}
                className="card transition hover:border-ghars-500"
              >
                <h2 className="text-lg font-bold text-ghars-700">{v.label_ar}</h2>
                {v.description_ar ? (
                  <p className="mt-1 text-sm text-ghars-500">{v.description_ar}</p>
                ) : null}
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

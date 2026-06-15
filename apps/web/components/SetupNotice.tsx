// تظهر عندما لا تكون متغيرات Supabase مهيأة — بدل انهيار التطبيق.
export function SetupNotice() {
  return (
    <div className="card space-y-3 text-sm">
      <h2 className="text-base font-bold text-ghars-700">إعداد مطلوب: Supabase</h2>
      <p className="text-ghars-600">
        لتشغيل المنصة، أنشئ ملف <code className="rounded bg-ghars-50 px-1">.env.local</code> داخل
        <code className="rounded bg-ghars-50 px-1"> apps/web</code> بالقيم:
      </p>
      <pre dir="ltr" className="overflow-x-auto rounded-lg bg-ghars-900 p-3 text-xs text-ghars-50">
{`NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...`}
      </pre>
      <p className="text-ghars-600">
        ثم طبّق المخطط من <code className="rounded bg-ghars-50 px-1">supabase/migrations</code> وبيانات
        <code className="rounded bg-ghars-50 px-1"> supabase/seed</code>.
      </p>
    </div>
  );
}

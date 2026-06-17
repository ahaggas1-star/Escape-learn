import { Header } from "@/components/Header";
import { requireStaff } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { Chip } from "@/components/ui/Chip";

export const dynamic = "force-dynamic";

const ROLES = [
  { icon: "🧑‍🍼", t: "ولي الأمر", d: "ينشئ الأسرة والأبناء، يختار القيم والأهداف، يسند المهام، يعتمد الإنجاز، يتابع التقارير." },
  { icon: "👦", t: "الابن / الابنة", d: "يدخل بحسابه (اسم مستخدم + كلمة مرور)، ينفّذ المهام، يرى تقدّمه وصناديق مكافآته." },
  { icon: "🛠️", t: "مدير المحتوى", d: "يدير القيم والأهداف والمهام الجاهزة والتلعيب — ولا يصل لبيانات الأطفال الفردية." },
  { icon: "🛡️", t: "مدير النظام", d: "كل ما سبق + إدارة الأدوار وسجلات الموافقات والعمليات." },
];

const FLOW = [
  { n: "1", t: "النموذج الجوهري", d: "القيمة → الهدف → المهمة → التنفيذ → الاعتماد → القياس → التلعيب → التقارير. التلعيب طبقة تحفيزية فوق جوهر تربوي." },
  { n: "2", t: "إدارة القيم", d: "/admin/values — القيم الأربع وفروعها، مع إمكانية إضافة قيم جديدة وربطها بفئة عمرية." },
  { n: "3", t: "مكتبة الأهداف", d: "/admin/goals — إنشاء/تعديل/حذف أهداف جاهزة (قيمة، فرعية، فئة عمرية، صعوبة، معيار نجاح) ونشرها." },
  { n: "4", t: "مكتبة المهام", d: "/admin/tasks — مهام جاهزة بكل الحقول (التكرار، الإثبات، نقاط الخبرة، الاعتماد) ونشرها." },
  { n: "5", t: "اعتماد المحتوى", d: "القوالب غير المنشورة لا تظهر لأولياء الأمور. زر «نشر» هو بوابة الاعتماد." },
  { n: "6", t: "إدارة التلعيب", d: "/admin/gamification — الشارات (بشرط واضح)، المستويات (بحد نقاط)، الإنجازات." },
  { n: "7", t: "التحديات الجماعية الرسمية", d: "/admin/collectives — تحديات لكل الأسر، بسقف لكل طفل (مكافحة التلاعب) وتدخل الترتيب." },
  { n: "8", t: "إدارة الأدوار", d: "/admin/users — مدير النظام يعيّن: ولي أمر / مدير محتوى / مدير نظام." },
  { n: "9", t: "لوحة النظام", d: "/admin/system — سجل الموافقات (consent) وسجل العمليات الحساسة (audit)." },
];

const GAMIFICATION = [
  "نقاط الخبرة تُخزَّن كسجل أحداث (لكل نقطة سبب واضح) — لا رقم مجمّع فقط.",
  "الشارات تُمنح بشرط محدد (عدد مهام معتمدة لقيمة/فرعية)، لا بمجرد جمع نقاط.",
  "المستويات رمزية: بذرة → غرسة → نبتة → شجرة → مثمر → قدوة.",
  "العملات يكسبها الطفل من الإنجاز الحقيقي (لا من فتح الصناديق)، ويصرفها على فتح صناديق ينشئها ولي الأمر (3 أنواع بتكلفة محدّدة).",
  "الإنجازات الجماعية بطبقتين: رسمية (إدارة) تدخل الترتيب + عائلية (ولي أمر) محلية، والتقدّم من مهام معتمدة فقط مع سقف لكل طفل.",
  "ترتيب الأبطال عبر العوائل يظهر بالهوية التي يختارها ولي كل طفل؛ وبطاقة إنجاز عامة للمشاركة برابط.",
];

const SECURITY = [
  "كل بيانات الأسرة محميّة بـ Row Level Security: ولي الأمر يصل لأسرته فقط.",
  "الطفل يقرأ بياناته فقط؛ كل منح نقاط/فتح صندوق يتم عبر دوال محمية تمنع التلاعب.",
  "التقارير العامة تُبنى من تجميعات مجهولة الهوية (دالة platform_metrics).",
  "حق الحذف لولي الأمر مع تسجيل العملية في سجل audit.",
];

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg font-bold text-ghars-700">{title}</h2>
      {children}
    </section>
  );
}

export default async function AdminGuide() {
  const { email, role } = await requireStaff();

  return (
    <>
      <Header email={email} />
      <main className="container-app space-y-7">
        <PageHeader icon="📚" title="دليل الإدارة" subtitle="شرح تفصيلي لكيفية عمل المنصة من الدخول إلى آخر خطوة." backHref="/admin" />

        <div className="card text-sm text-ghars-600">
          دورك الحالي: <Chip tone="grape">{role === "system_admin" ? "مدير النظام" : "مدير المحتوى"}</Chip>
        </div>

        <Block title="الأدوار الأربعة">
          <div className="grid gap-3 sm:grid-cols-2">
            {ROLES.map((r) => (
              <div key={r.t} className="card">
                <div className="text-2xl">{r.icon}</div>
                <h3 className="mt-1 font-display font-bold text-ghars-800">{r.t}</h3>
                <p className="mt-0.5 text-sm text-ghars-600">{r.d}</p>
              </div>
            ))}
          </div>
        </Block>

        <Block title="سير العمل الإداري">
          <div className="space-y-2">
            {FLOW.map((f) => (
              <div key={f.n} className="card flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-ghars-100 font-display font-extrabold text-ghars-700">{f.n}</span>
                <div>
                  <h3 className="font-display font-bold text-ghars-800">{f.t}</h3>
                  <p className="mt-0.5 text-sm text-ghars-600">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </Block>

        <Block title="قواعد التلعيب الآمن">
          <div className="card">
            <ul className="space-y-2 text-sm text-ghars-700">
              {GAMIFICATION.map((g) => (
                <li key={g} className="flex items-start gap-2"><span className="text-joy-500">●</span> {g}</li>
              ))}
            </ul>
          </div>
        </Block>

        <Block title="الأمان والخصوصية">
          <div className="card">
            <ul className="space-y-2 text-sm text-ghars-700">
              {SECURITY.map((s) => (
                <li key={s} className="flex items-start gap-2"><span className="text-ghars-500">🔒</span> {s}</li>
              ))}
            </ul>
          </div>
        </Block>

        <Block title="تجربة سريعة">
          <div className="card text-sm text-ghars-600 space-y-1">
            <p>• حساب ولي أمر: <span className="font-bold" dir="ltr">demo@qiyam.app / Qiyam@1234</span> (مدير نظام).</p>
            <p>• حساب طفل: <span className="font-bold" dir="ltr">abdullah / Child@123</span> عبر <span dir="ltr">/child/login</span>.</p>
          </div>
        </Block>
      </main>
    </>
  );
}

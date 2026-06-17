import { Header } from "@/components/Header";
import { getGuardianContext } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

const JOURNEY = [
  { n: "1", icon: "📝", t: "أنشئ حسابك", d: "سجّل بالبريد وكلمة المرور — بلا تأكيد بريد، تدخل مباشرة." },
  { n: "2", icon: "🏡", t: "أنشئ أسرتك", d: "أضف اسم الأسرة (اختياري) وأول ابن باسم مختصر وعمر." },
  { n: "3", icon: "🔑", t: "جهّز دخول الطفل", d: "من صفحة الابن، أنشئ له اسم مستخدم وكلمة مرور (تعدّلهما متى شئت) ليدخل بنفسه." },
  { n: "4", icon: "🌱", t: "اختر قيمة", d: "من القيم الأربع: الاحترام، التعاون، الاهتمام، الالتزام." },
  { n: "5", icon: "🎯", t: "حوّلها لهدف", d: "اختر هدفًا جاهزًا، أو أنشئ هدفًا خاصًا قابلًا للقياس." },
  { n: "6", icon: "📋", t: "أسند مهامًا", d: "مهام يومية بسيطة مع طريقة إثبات (تأكيد/ملاحظة/صورة)." },
  { n: "7", icon: "👦", t: "الطفل ينفّذ", d: "يدخل بحسابه، يرى مهامه، ينجزها ويضيف الإثبات." },
  { n: "8", icon: "✅", t: "اعتمد الإنجاز", d: "تراجع وتعتمد أو تطلب الإعادة، وتمنح نقاط خبرة إضافية وتشجيعًا." },
  { n: "9", icon: "📊", t: "تابِع التقدّم", d: "تقارير الابن والأسرة + ترتيب الأسر + التحديات العائلية." },
];

const CHILD_FEATURES = [
  { icon: "⭐", t: "نقاط الخبرة", d: "يكسبها الطفل عند إنجاز المهام واعتمادها — وتظهر له مباشرة." },
  { icon: "🌳", t: "المستويات", d: "رحلة نمو رمزية: بذرة → غرسة → نبتة → شجرة → مثمر → قدوة." },
  { icon: "🏅", t: "الشارات", d: "تُمنح بشرط واضح (مثل إكمال عدد من مهام قيمة معيّنة)." },
  { icon: "🎉", t: "الإنجازات", d: "أول مهمة، 5 أيام متتالية، أول هدف مكتمل، أول تحدٍّ عائلي…" },
  { icon: "🎁", t: "صناديق المكافآت", d: "تُفتح بعد إنجاز حقيقي — آمنة بلا عشوائية أو دفع." },
  { icon: "🏆", t: "ترتيب العائلة", d: "تنافس محفّز بين الإخوة داخل الأسرة." },
];

const POWERS = [
  "إنشاء الأسرة وإضافة الأبناء",
  "إنشاء/تعديل دخول الطفل وهويته العامة",
  "اختيار القيم والأهداف الجاهزة أو الخاصة",
  "إسناد المهام وتحديد نوع الإثبات",
  "اعتماد الإنجاز ومنح نقاط خبرة إضافية",
  "إنشاء تحديات عائلية ومنح إنجازها",
  "تحديد مكافآت صندوق الأسرة (معنوية/مادية)",
  "متابعة تقارير الابن والأسرة",
  "إدارة الخصوصية وحق حذف البيانات",
];

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-display text-lg font-bold text-ghars-700">{title}</h2>
        {sub ? <p className="text-sm text-ghars-500">{sub}</p> : null}
      </div>
      {children}
    </section>
  );
}

export default async function GuardianGuide() {
  const { email } = await getGuardianContext();

  return (
    <>
      <Header email={email} />
      <main className="container-app space-y-7">
        <PageHeader icon="📖" title="دليل ولي الأمر" subtitle="كل ما تحصل عليه أنت وابنك من مميزات وتفاعل." backHref="/dashboard" />

        <div className="rounded-3xl bg-gradient-to-l from-ghars-500 to-ghars-600 p-5 text-white shadow-soft">
          <p className="text-sm opacity-90">فكرة المنصة باختصار</p>
          <p className="mt-1 font-display text-lg font-bold">
            تحوّل القيم التربوية إلى أهداف ومهام يومية قابلة للمتابعة، وتحفّز ابنك عبر تلعيب آمن — القيمة قبل النقاط.
          </p>
        </div>

        <Section title="رحلتك خطوة بخطوة" sub="من التسجيل حتى متابعة الأثر.">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {JOURNEY.map((s) => (
              <div key={s.n} className="card">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-ghars-100 font-display font-extrabold text-ghars-700">{s.n}</span>
                  <span className="text-xl">{s.icon}</span>
                  <h3 className="font-display font-bold text-ghars-800">{s.t}</h3>
                </div>
                <p className="mt-1 text-sm text-ghars-600">{s.d}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="ما الذي يحصل عليه ابنك؟" sub="عناصر تفاعلية تحفّزه دون ضغط.">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CHILD_FEATURES.map((f) => (
              <div key={f.t} className="card bg-gradient-to-br from-white to-joy-50">
                <div className="text-2xl">{f.icon}</div>
                <h3 className="mt-1 font-display font-bold text-ghars-800">{f.t}</h3>
                <p className="mt-0.5 text-sm text-ghars-600">{f.d}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="صلاحياتك كولي أمر">
          <div className="card">
            <ul className="grid gap-2 sm:grid-cols-2">
              {POWERS.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-ghars-700">
                  <span className="text-ghars-500">✅</span> {p}
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section title="كيف يدخل ابنك؟">
          <div className="card space-y-2 text-sm text-ghars-600">
            <p>١. من <span className="font-bold text-ghars-700">لوحة التحكم</span> افتح صفحة ابنك → قسم «🔑 دخول الطفل».</p>
            <p>٢. أنشئ له <span className="font-bold text-ghars-700">اسم مستخدم وكلمة مرور</span> (يمكنك تغييرهما لاحقًا).</p>
            <p>٣. يفتح ابنك صفحة <span className="font-bold text-ghars-700" dir="ltr">/child/login</span> ويسجّل دخوله ليرى مهامه وإنجازاته.</p>
          </div>
        </Section>

        <Section title="الأمان والخصوصية">
          <div className="card text-sm text-ghars-600">
            أنت صاحب الحساب. بيانات الطفل مُقللة، ولا تظهر أسماء الأطفال في أي ترتيب عام إلا بالهوية التي تختارها،
            والصور لا تُستخدم إلا بموافقتك. التلعيب مرتبط بإنجاز حقيقي فقط — بلا عشوائية أو دفع أو مقارنة جارحة.
          </div>
        </Section>
      </main>
    </>
  );
}

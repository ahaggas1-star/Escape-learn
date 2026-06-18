import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { PageHeader } from "@/components/ui/PageHeader";
import { SomouAttribution } from "@/components/ui/SomouAttribution";

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
  { icon: "🪙", t: "العملات", d: "يكسبها من إنجاز المهام والأهداف، ويصرفها على فتح صناديق المكافآت." },
  { icon: "🌳", t: "المستويات", d: "رحلة نمو رمزية: بذرة → غرسة → نبتة → شجرة → مثمر → قدوة." },
  { icon: "🏅", t: "الشارات والإنجازات", d: "تُمنح بشرط واضح (أول مهمة، 5 أيام متتالية، إكمال قيمة…)." },
  { icon: "🛍️", t: "متجر الصناديق", d: "صناديق بأنواع (عادية/مميزة/رهيبة) يفتحها بعملاته فتظهر مكافأته." },
  { icon: "🎯", t: "إنجازات جماعية", d: "أهداف تكملونها معًا بشريط تقدّم وعبارات تشجيع." },
  { icon: "🏆", t: "ترتيب العائلة وأبطال قِيَم", d: "تنافس بين الإخوة + ترتيب الأبطال عبر العوائل." },
  { icon: "🔗", t: "مشاركة الإنجاز", d: "بطاقة إنجاز عامة يشاركها مع أصدقائه بالاسم الذي تختاره." },
];

const POWERS = [
  "إنشاء الأسرة وإضافة الأبناء",
  "إنشاء/تعديل دخول الطفل (اسم مستخدم وكلمة مرور)",
  "تحديد هوية الطفل العامة (لقب/اسم أول/كامل)",
  "اختيار القيم والأهداف الجاهزة أو الخاصة",
  "إسناد المهام وتحديد نوع الإثبات (تأكيد/ملاحظة/صورة)",
  "اعتماد الإنجاز ومنح نقاط خبرة إضافية",
  "إنشاء تحديات عائلية وإنجازات جماعية والمطالبة بمكافأتها",
  "إنشاء صناديق مكافآت (عادية/مميزة/رهيبة) وتحديد تكلفتها بالعملات ووضع رسائلك",
  "متابعة تقارير الابن والأسرة وترتيب الأسر والأبطال",
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

export default function GuardianGuide() {
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/"><Logo /></Link>
          <div className="flex items-center gap-3">
            <SomouAttribution variant="inline" className="hidden sm:inline-flex" />
            <Link href="/login" className="btn-primary text-sm">تسجيل الدخول</Link>
          </div>
        </div>
      </header>
      <main className="container-app space-y-7">
        <PageHeader icon="📖" title="دليل ولي الأمر" subtitle="كل ما تحصل عليه أنت وابنك من مميزات وتفاعل." backHref="/" backLabel="الرئيسية" />

        <div className="rounded-3xl bg-ghars-700 p-5 text-white shadow-soft">
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

        <Section title="العملات وصناديق المكافآت 🪙" sub="حافز ملموس يتحكّم به ولي الأمر بالكامل.">
          <div className="card space-y-2 text-sm text-ghars-600">
            <p>• يكسب ابنك <span className="font-bold text-ghars-700">عملات</span> تلقائيًا عند إنجاز المهام والأهداف (مرتبطة بإنجاز حقيقي).</p>
            <p>• من <span className="font-bold text-ghars-700">«صناديق المكافآت»</span> تنشئ صناديق بثلاثة أنواع (عادية/مميزة/رهيبة)، تحدّد <span className="font-bold text-ghars-700">تكلفتها بالعملات</span> أو تجعلها مجانية، وتضع فيها <span className="font-bold text-ghars-700">رسائلك</span> ومكافآتك.</p>
            <p>• يفتح ابنك الصناديق من <span className="font-bold text-ghars-700">متجره</span> بصرف عملاته، فيرى مكافأتك فورًا.</p>
          </div>
        </Section>

        <Section title="الإنجازات الجماعية والمشاركة 🎯" sub="تعاون أسري + تحفيز اجتماعي آمن.">
          <div className="card space-y-2 text-sm text-ghars-600">
            <p>• <span className="font-bold text-ghars-700">إنجازات جماعية</span>: أهداف تكملها الأسرة معًا بشريط تقدّم وعبارات تشجيع (رسمية من الإدارة أو تنشئها أنت). التقدّم من المهام المعتمدة فقط مع سقف لكل طفل — منعًا للتلاعب.</p>
            <p>• <span className="font-bold text-ghars-700">أبطال قِيَم</span>: ترتيب الأبطال عبر العوائل، يظهر اسم ابنك بالصيغة التي تختارها فقط.</p>
            <p>• <span className="font-bold text-ghars-700">مشاركة الإنجاز</span>: بطاقة عامة لإنجازات ابنك يمكن مشاركتها برابط.</p>
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

        <div className="flex justify-center border-t border-line pt-6">
          <SomouAttribution variant="stacked" />
        </div>
      </main>
    </>
  );
}

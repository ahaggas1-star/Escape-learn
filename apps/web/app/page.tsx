import Link from "next/link";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { getPlatformMetrics } from "@/lib/reports";
import { Logo } from "@/components/ui/Logo";
import { SomouAttribution } from "@/components/ui/SomouAttribution";

export const dynamic = "force-dynamic";

const VALUES = [
  { icon: "🤝", name: "الاحترام", sub: "الأدب · التقدير · التواضع", tone: "from-ghars-50 to-ghars-100" },
  { icon: "💚", name: "التعاون", sub: "البذل · الإيثار · الكرم", tone: "from-sky-50 to-sky-100" },
  { icon: "👀", name: "الاهتمام", sub: "الحرص · تنفيذ المهام", tone: "from-bloom-50 to-bloom-100" },
  { icon: "⏰", name: "الالتزام", sub: "التنظيم · الوفاء · الصدق", tone: "from-joy-50 to-joy-100" },
];

const STEPS = [
  { n: "1", icon: "🌱", t: "اختر قيمة", d: "ابدأ من إحدى القيم الأربع المناسبة لعمر ابنك." },
  { n: "2", icon: "🎯", t: "حوّلها لهدف", d: "اختر هدفًا جاهزًا أو أنشئ هدفًا خاصًا قابلًا للقياس." },
  { n: "3", icon: "📝", t: "أسند مهامًا", d: "مهام يومية بسيطة، مع طريقة إثبات واضحة." },
  { n: "4", icon: "✅", t: "اعتمد الإنجاز", d: "راجع، اعتمد، وامنح تحفيزًا — أو اطلب الإعادة." },
  { n: "5", icon: "📊", t: "تابِع الأثر", d: "تقارير تقيس التقدّم والسلوك داخل الأسرة." },
];

const LEVELS = [
  { e: "🌰", n: "بذرة" }, { e: "🌱", n: "غرسة" }, { e: "🪴", n: "نبتة" },
  { e: "🌳", n: "شجرة" }, { e: "🍎", n: "مثمر" }, { e: "🌟", n: "قدوة" },
];

const FAQ = [
  { q: "هل المنصة مجانية؟", a: "نعم، بلا اشتراكات في النسخة الحالية." },
  { q: "هل أطفالي يحتاجون حسابات منفصلة؟", a: "لا، يدخل الأبناء ضمن حساب ولي الأمر — أبسط وأكثر أمانًا." },
  { q: "ماذا عن خصوصية الأطفال؟", a: "بيانات مُقللة، لا أسماء في الترتيب، والصور لا تُستخدم إلا بموافقتك." },
  { q: "هل التلعيب آمن؟", a: "مرتبط بإنجاز حقيقي فقط، بلا عشوائية أو دفع أو مقارنة جارحة." },
];

function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-6 text-center">
      <h2 className="font-display text-2xl font-bold text-ghars-800 sm:text-3xl">{children}</h2>
      {sub ? <p className="mx-auto mt-2 max-w-xl text-sm text-ghars-500">{sub}</p> : null}
    </div>
  );
}

export default async function Home() {
  if (isSupabaseConfigured) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: child } = await supabase
        .from("children")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();
      redirect(child ? "/child" : "/dashboard");
    }
  }

  const metrics = isSupabaseConfigured ? await getPlatformMetrics() : null;

  return (
    <main className="min-h-screen overflow-x-hidden">
      {/* الشريط العلوي */}
      <header className="sticky top-0 z-10 border-b border-white/60 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <Logo />
          <nav className="hidden items-center gap-5 text-sm font-semibold text-ghars-600 md:flex">
            <a href="#how" className="hover:text-ghars-800">كيف تعمل</a>
            <a href="#values" className="hover:text-ghars-800">القيم</a>
            <a href="#safe" className="hover:text-ghars-800">التلعيب الآمن</a>
            <a href="#faq" className="hover:text-ghars-800">أسئلة</a>
            <a href="/guide" className="hover:text-ghars-800">الدليل</a>
          </nav>
          <Link href="/login" className="btn-primary text-sm">تسجيل الدخول</Link>
        </div>
      </header>

      {/* البطل */}
      <section className="relative mx-auto max-w-3xl px-4 pb-12 pt-12 text-center">
        <span className="chip mb-4 bg-ghars-100 text-ghars-700">منصة القيم الأسرية</span>
        <div className="mb-4 flex justify-center"><Logo size={56} showText={false} /></div>
        <h1 className="font-display text-4xl font-bold leading-tight text-ghars-800 sm:text-5xl">
          نغرس القيم في أبنائنا…<br />بخطوات عملية يومية
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-ghars-600">
          الأسر تؤمن بالقيم، لكنها تحتاج أداة تحوّلها إلى سلوك. <span className="font-bold text-ghars-700">قِيَم</span> تحوّل
          القيمة إلى أهداف ومهام قابلة للمتابعة، وتحفّز الأبناء عبر تلعيب آمن — القيمة قبل النقاط.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link href="/login" className="btn-primary px-7 py-3 text-base">ابدأ الآن مجانًا 🌱</Link>
          <Link href="/guide" className="btn-ghost px-7 py-3 text-base">📖 دليل ولي الأمر</Link>
          <a href="#how" className="btn-ghost px-7 py-3 text-base">شاهد كيف تعمل</a>
        </div>
        <p className="mt-3 text-xs text-ghars-400">بلا اشتراكات · عربي أولًا · آمن للأطفال</p>
        <div className="mt-5 flex justify-center">
          <SomouAttribution variant="inline" />
        </div>
      </section>

      {/* مؤشرات حيّة */}
      {metrics && metrics.families > 0 ? (
        <section className="mx-auto max-w-4xl px-4 pb-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { v: metrics.families, l: "أسرة" },
              { v: metrics.children, l: "ابن/ابنة" },
              { v: metrics.tasks_completed, l: "مهمة معتمدة" },
              { v: metrics.badges_awarded, l: "شارة مُنحت" },
            ].map((s) => (
              <div key={s.l} className="stat">
                <p className="stat-value">{s.v}</p>
                <p className="stat-label">{s.l}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* لماذا قِيَم */}
      <section className="mx-auto max-w-4xl px-4 py-12">
        <SectionTitle sub="من القيمة النظرية إلى سلوك يومي قابل للمتابعة.">لماذا قِيَم؟</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: "🧭", t: "نموذج واضح", d: "القيمة → الهدف → المهمة → التنفيذ → الاعتماد → القياس." },
            { icon: "🎮", t: "تلعيب آمن", d: "نقاط الخبرة، المستويات، الشارات، صناديق المكافآت — بلا إدمان أو ضغط." },
            { icon: "👨‍👩‍👧", t: "تجربة أسرية", d: "ولي الأمر يقود، والأبناء ينفّذون ويتحفّزون معًا." },
          ].map((c) => (
            <div key={c.t} className="card">
              <div className="text-3xl">{c.icon}</div>
              <h3 className="mt-1 font-display font-bold text-ghars-800">{c.t}</h3>
              <p className="mt-0.5 text-sm text-ghars-600">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* القيم الأربع */}
      <section id="values" className="mx-auto max-w-4xl px-4 py-12">
        <SectionTitle sub="تبدأ المنصة بأربع قيم أساسية، لكل منها قيمها الفرعية.">القيم الأربع</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <div key={v.name} className={`card bg-gradient-to-br ${v.tone} text-center`}>
              <div className="text-3xl">{v.icon}</div>
              <h3 className="mt-1 font-display font-bold text-ghars-800">{v.name}</h3>
              <p className="mt-0.5 text-xs text-ghars-600">{v.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* كيف تعمل */}
      <section id="how" className="mx-auto max-w-4xl px-4 py-12">
        <SectionTitle sub="خمس خطوات بسيطة من القيمة إلى الأثر.">كيف تعمل؟</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((s) => (
            <div key={s.n} className="card text-center">
              <div className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-ghars-100 font-display font-bold text-ghars-700">{s.n}</div>
              <div className="text-2xl">{s.icon}</div>
              <h3 className="mt-1 font-display font-bold text-ghars-800">{s.t}</h3>
              <p className="mt-0.5 text-xs text-ghars-600">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* لمن */}
      <section className="mx-auto max-w-4xl px-4 py-12">
        <SectionTitle>لمن هذه المنصة؟</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="card">
            <div className="text-3xl">🧑‍🍼</div>
            <h3 className="mt-1 font-display font-bold text-ghars-800">ولي الأمر</h3>
            <p className="mt-0.5 text-sm text-ghars-600">ينشئ الأسرة، يختار القيم والأهداف، يسند المهام، يعتمد الإنجاز، ويتابع التقارير.</p>
          </div>
          <div className="card">
            <div className="text-3xl">🧒</div>
            <h3 className="mt-1 font-display font-bold text-ghars-800">الابن / الابنة</h3>
            <p className="mt-0.5 text-sm text-ghars-600">ينفّذ المهام، يضيف الإثبات، ويرى تقدّمه: نقاط الخبرة والمستويات والشارات وصناديق المكافآت.</p>
          </div>
        </div>
      </section>

      {/* التلعيب الآمن + المستويات */}
      <section id="safe" className="mx-auto max-w-4xl px-4 py-12">
        <SectionTitle sub="التلعيب طبقة تحفيزية فوق جوهر تربوي — وليس هو الجوهر.">تلعيب آمن يخدم السلوك</SectionTitle>
        <div className="card">
          <p className="mb-3 text-center text-sm font-semibold text-ghars-700">رحلة النمو عبر المستويات</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {LEVELS.map((l, i) => (
              <span key={l.n} className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-ghars-50 px-3 py-1 text-sm font-semibold text-ghars-700">
                  <span>{l.e}</span> {l.n}
                </span>
                {i < LEVELS.length - 1 ? <span className="text-ghars-300">←</span> : null}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {[
            { icon: "🏅", t: "إنجاز حقيقي", d: "الشارات تُمنح بشرط واضح، لا بمجرد نقاط." },
            { icon: "🎁", t: "صناديق مكافآت", d: "بلا عشوائية أو دفع — يحدّد ولي الأمر محتواها." },
            { icon: "🏆", t: "ترتيب آمن", d: "تنافس بين الأسر مجهول الهوية، بلا أسماء أطفال." },
          ].map((c) => (
            <div key={c.t} className="card">
              <div className="text-2xl">{c.icon}</div>
              <h3 className="mt-1 font-display font-bold text-ghars-800">{c.t}</h3>
              <p className="mt-0.5 text-sm text-ghars-600">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* الخصوصية */}
      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-3xl bg-gradient-to-br from-sky-50 to-ghars-50 p-6 text-center sm:p-8">
          <div className="text-4xl">🔒</div>
          <h2 className="mt-2 font-display text-2xl font-bold text-ghars-800">الخصوصية والسلامة أولًا</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-ghars-600">
            ولي الأمر هو صاحب الحساب. بيانات الأطفال مُقللة، لا تظهر أسماؤهم في أي ترتيب،
            والصور لا تُستخدم إلا بموافقة صريحة. التقارير العامة مجهولة الهوية تمامًا.
          </p>
        </div>
      </section>

      {/* التسعير */}
      <section className="mx-auto max-w-md px-4 py-12">
        <SectionTitle>التسعير</SectionTitle>
        <div className="card text-center">
          <p className="font-display text-4xl font-bold text-ghars-700">مجانًا</p>
          <p className="mt-1 text-sm text-ghars-500">بلا اشتراكات في النسخة الحالية</p>
          <ul className="mx-auto mt-4 max-w-xs space-y-1.5 text-right text-sm text-ghars-600">
            <li>✅ القيم والأهداف والمهام الجاهزة</li>
            <li>✅ التلعيب الآمن والتقارير</li>
            <li>✅ ترتيب الأسر والتحديات</li>
          </ul>
          <Link href="/login" className="btn-primary mt-5 w-full">ابدأ مجانًا</Link>
        </div>
      </section>

      {/* أسئلة شائعة */}
      <section id="faq" className="mx-auto max-w-2xl px-4 py-12">
        <SectionTitle>أسئلة شائعة</SectionTitle>
        <div className="space-y-3">
          {FAQ.map((f) => (
            <div key={f.q} className="card">
              <h3 className="font-display font-bold text-ghars-800">{f.q}</h3>
              <p className="mt-1 text-sm text-ghars-600">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* دعوة ختامية */}
      <section className="mx-auto max-w-3xl px-4 pb-10 pt-4 text-center">
        <div className="rounded-3xl bg-ghars-700 p-8 text-white shadow-soft">
          <h2 className="font-display text-2xl font-bold">ابدأ رحلة الغرس مع أسرتك اليوم</h2>
          <p className="mt-2 text-sm opacity-90">أنشئ حسابك، أضف أبناءك، واختر أول قيمة.</p>
          <Link href="/login" className="btn-joy mt-5 inline-flex px-7 py-3 text-base">إنشاء حساب 🌟</Link>
        </div>
      </section>

      {/* التذييل */}
      <footer className="border-t border-line bg-white/70">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-5 px-4 py-8 text-sm text-ghars-500">
          <SomouAttribution variant="stacked" />
          <div className="flex w-full flex-col items-center justify-between gap-3 border-t border-line pt-5 sm:flex-row">
            <Logo size={28} />
            <p>قِيَم — منصة القيم الأسرية</p>
            <div className="flex items-center gap-4">
              <Link href="/guide" className="hover:text-ghars-800">دليل ولي الأمر</Link>
              <Link href="/login" className="hover:text-ghars-800">تسجيل الدخول</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

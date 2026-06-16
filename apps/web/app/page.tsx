import Link from "next/link";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/ui/Logo";
import { Mascot } from "@/components/ui/Mascot";

export const dynamic = "force-dynamic";

const VALUES = [
  { icon: "🤝", name: "الاحترام", sub: "الأدب · التقدير · التواضع", tone: "from-ghars-50 to-ghars-100" },
  { icon: "💚", name: "التعاون", sub: "البذل · الإيثار · الكرم", tone: "from-sky-50 to-sky-100" },
  { icon: "👀", name: "الاهتمام", sub: "الحرص · تنفيذ المهام", tone: "from-bloom-50 to-bloom-100" },
  { icon: "⏰", name: "الالتزام", sub: "التنظيم · الوفاء · الصدق", tone: "from-joy-50 to-joy-100" },
];

const STEPS = ["القيمة", "الهدف", "المهمة", "التنفيذ", "الاعتماد", "القياس", "التلعيب", "التقارير"];

export default async function Home() {
  if (isSupabaseConfigured) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/dashboard");
  }

  return (
    <main className="min-h-screen">
      {/* الشريط العلوي */}
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
        <Logo />
        <Link href="/login" className="btn-primary text-sm">تسجيل الدخول</Link>
      </header>

      {/* البطل */}
      <section className="mx-auto max-w-3xl px-4 pb-10 pt-8 text-center">
        <div className="mb-3 flex justify-center"><Mascot size={88} /></div>
        <h1 className="font-display text-4xl font-extrabold text-ghars-800 sm:text-5xl">
          نغرس القيم… بخطوات عملية
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-ghars-600">
          منصة أسرية تحوّل القيم التربوية إلى أهداف ومهام يومية قابلة للمتابعة،
          وتحفّز الأبناء عبر تلعيب آمن — القيمة قبل النقاط.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/login" className="btn-primary px-6 py-3 text-base">ابدأ الآن مجانًا 🌱</Link>
          <a href="#how" className="btn-ghost px-6 py-3 text-base">كيف تعمل؟</a>
        </div>
        <p className="mt-3 text-xs text-ghars-400">بلا اشتراكات · عربي أولًا · آمن للأطفال</p>
      </section>

      {/* القيم الأربع */}
      <section className="mx-auto max-w-4xl px-4 py-8">
        <h2 className="mb-4 text-center font-display text-2xl font-bold text-ghars-700">القيم الأربع</h2>
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
      <section id="how" className="mx-auto max-w-3xl px-4 py-8">
        <h2 className="mb-4 text-center font-display text-2xl font-bold text-ghars-700">النموذج الجوهري</h2>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <span key={s} className="flex items-center gap-2">
              <span className="chip bg-ghars-100 text-ghars-700">{s}</span>
              {i < STEPS.length - 1 ? <span className="text-ghars-300">←</span> : null}
            </span>
          ))}
        </div>
        <p className="mt-3 text-center text-sm text-ghars-500">
          التلعيب طبقة تحفيزية فوق جوهر تربوي وسلوكي — وليس هو الجوهر.
        </p>
      </section>

      {/* تلعيب آمن */}
      <section className="mx-auto max-w-4xl px-4 py-8">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: "🏅", t: "إنجاز حقيقي", d: "الشارات والمكافآت تُمنح بشرط واضح، لا بمجرد نقاط." },
            { icon: "🔒", t: "خصوصية الطفل", d: "بيانات مُقللة، لا أسماء في الترتيب، صور بموافقة ولي الأمر." },
            { icon: "📊", t: "تقارير الأثر", d: "قياس التقدم داخل الأسرة ومؤشرات عامة مجهولة الهوية." },
          ].map((c) => (
            <div key={c.t} className="card">
              <div className="text-2xl">{c.icon}</div>
              <h3 className="mt-1 font-display font-bold text-ghars-800">{c.t}</h3>
              <p className="mt-0.5 text-sm text-ghars-600">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* دعوة ختامية */}
      <section className="mx-auto max-w-3xl px-4 pb-14 pt-4 text-center">
        <div className="rounded-3xl bg-gradient-to-l from-ghars-500 to-ghars-600 p-8 text-white shadow-soft">
          <h2 className="font-display text-2xl font-extrabold">ابدأ رحلة الغرس مع أسرتك اليوم</h2>
          <p className="mt-2 text-sm opacity-90">أنشئ حسابك، أضف أبناءك، واختر أول قيمة.</p>
          <Link href="/login" className="btn-joy mt-5 inline-flex px-6 py-3 text-base">إنشاء حساب 🌟</Link>
        </div>
        <p className="mt-6 text-xs text-ghars-400">قِيَم — منصة القيم الأسرية</p>
      </section>
    </main>
  );
}

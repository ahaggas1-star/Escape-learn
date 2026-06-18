import Link from "next/link";
import { getShowcaseData } from "@/lib/showcase-data";
import { CountUp } from "./CountUp";
import { Leaderboard } from "./Leaderboard";
import { ShareAchievement } from "./ShareAchievement";
import { OnLoadCelebration } from "./OnLoadCelebration";
import { SoundToggle } from "./SoundToggle";
import { LuckBoxes } from "./LuckBoxes";
import { CollectivesShowcase } from "./CollectivesShowcase";
import { GrowthChart } from "./GrowthChart";
import { AchievementsMarquee } from "./AchievementsMarquee";

export const dynamic = "force-static";

export const metadata = {
  title: "قِيَم — العرض التفاعلي",
  description: "لمحة حيّة عن منصة قِيَم: أسر، أبطال، تحدّيات وإنجازات جماعية.",
};

const TONE: Record<string, string> = {
  ghars: "bg-ghars-400/20 text-ghars-100 ring-ghars-300/30",
  joy: "bg-joy-400/20 text-joy-100 ring-joy-300/30",
  sky: "bg-sky-400/20 text-sky-100 ring-sky-300/30",
  bloom: "bg-bloom-400/20 text-bloom-100 ring-bloom-300/30",
  grape: "bg-grape-400/20 text-grape-100 ring-grape-300/30",
  leaf: "bg-leaf-400/20 text-leaf-100 ring-leaf-300/30",
};

function Glass({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-white/10 bg-white/5 backdrop-blur ${className}`}>{children}</div>;
}

function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-6 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">{kicker}</p>
      <h2 className="mt-1 font-display text-2xl font-extrabold text-white sm:text-3xl">{title}</h2>
    </div>
  );
}

export default function ShowcasePage() {
  const d = getShowcaseData();
  const sp = d.spotlight;
  const dailyTop = d.champions.daily[0];

  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-b from-[#2a2036] via-[#3f3350] to-[#241b30] text-white">
      <OnLoadCelebration name={dailyTop.name} family={dailyTop.family} avatar={dailyTop.avatar} />
      {/* وهج علوي */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-80 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(139,92,246,0.35),transparent)]" />

      {/* شريط علوي */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <span className="inline-flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/somou-mark.svg" alt="" width={34} height={34} />
          <span className="font-display text-lg font-bold">قِيَم</span>
        </span>
        <div className="flex items-center gap-2">
          <SoundToggle />
          <Link href="/dashboard" className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold backdrop-blur transition hover:bg-white/20">
            دخول المنصة ←
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto w-full max-w-6xl space-y-20 px-5 pb-24">
        {/* ===== البطل ===== */}
        <section className="pt-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/80 backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-leaf-400" /> المنصة تنبض بالحياة — عرض حيّ
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight sm:text-6xl">
            حيث تتحوّل القيم<br />إلى <span className="bg-gradient-to-l from-joy-400 via-bloom-400 to-grape-400 bg-clip-text text-transparent">إنجازات تُلهم</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            ٢٠ أسرة، عشرات الأبطال، تحدّيات وإنجازات جماعية — هكذا تبدو «قِيَم» وهي تعمل.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { v: d.stats.families, l: "أسرة مشارِكة", e: "🏡" },
              { v: d.stats.children, l: "بطل وبطلة", e: "🦸" },
              { v: d.stats.tasks, l: "مهمة معتمدة", e: "✅" },
              { v: d.stats.badges, l: "شارة مُنحت", e: "🏅" },
            ].map((s) => (
              <Glass key={s.l} className="p-5">
                <div className="text-2xl">{s.e}</div>
                <div className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">
                  <CountUp end={s.v} />
                </div>
                <div className="text-xs text-white/60">{s.l}</div>
              </Glass>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {[
              { v: d.stats.coins, l: "عملة كُسبت", e: "🪙" },
              { v: d.stats.challenges, l: "تحدٍّ عائلي", e: "🚩" },
              { v: d.stats.collectivesDone, l: "إنجاز جماعي مكتمل", e: "🎯" },
            ].map((s) => (
              <Glass key={s.l} className="p-4">
                <div className="font-display text-2xl font-extrabold">
                  {s.e} <CountUp end={s.v} />
                </div>
                <div className="text-xs text-white/60">{s.l}</div>
              </Glass>
            ))}
          </div>
        </section>

        {/* ===== شريط إنجازات متحرّك ===== */}
        <AchievementsMarquee />

        {/* ===== ترتيب الأبطال ===== */}
        <section>
          <SectionTitle kicker="LEADERBOARD" title="🏆 سلّم أبطال قِيَم" />
          <Leaderboard data={d.champions} />
        </section>

        {/* ===== استعراض بطل الأسبوع ===== */}
        <section>
          <SectionTitle kicker="SPOTLIGHT" title="✨ بطل هذا الأسبوع" />
          <Glass className="overflow-hidden">
            <div className="grid gap-0 sm:grid-cols-[1fr_1.4fr]">
              <div className="flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-grape-500/30 to-bloom-500/20 p-8 text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/15 text-5xl ring-4 ring-white/20">{sp.champion.avatar}</div>
                <h3 className="font-display text-2xl font-extrabold">{sp.champion.name}</h3>
                <p className="text-sm text-white/70">أسرة {sp.champion.family} · {sp.champion.age} سنة</p>
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-sm font-bold">
                  {sp.champion.level.emoji} {sp.champion.level.label}
                </span>
                <div className="mt-3"><ShareAchievement name={sp.champion.name} /></div>
              </div>
              <div className="p-7">
                <p className="mb-4 border-r-2 border-joy-400 pr-3 text-lg font-semibold italic text-white/90">“{sp.quote}”</p>
                <div className="mb-5 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-2xl bg-white/5 p-3"><p className="font-display text-2xl font-extrabold text-joy-300">{sp.champion.total.toLocaleString("en-US")}</p><p className="text-[11px] text-white/60">نقطة خبرة</p></div>
                  <div className="rounded-2xl bg-white/5 p-3"><p className="font-display text-2xl font-extrabold text-bloom-300">{sp.champion.badges}</p><p className="text-[11px] text-white/60">شارة</p></div>
                  <div className="rounded-2xl bg-white/5 p-3"><p className="font-display text-2xl font-extrabold text-leaf-300">{sp.champion.streak}🔥</p><p className="text-[11px] text-white/60">يوم متتالٍ</p></div>
                </div>
                <ul className="space-y-2">
                  {sp.feats.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/80"><span className="text-leaf-400">✓</span> {f}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Glass>
          <p className="mt-3 text-center text-xs text-white/50">يستعرض الأبطال إنجازاتهم بهويّة يختارها وليّ الأمر فقط — تحفيز اجتماعي آمن.</p>
        </section>

        {/* ===== الإنجازات الجماعية (الإدارة) — قابلة لفتح الجائزة ===== */}
        <section>
          <SectionTitle kicker="OFFICIAL" title="🎯 إنجازات جماعية من الإدارة" />
          <p className="mx-auto mb-6 -mt-3 max-w-lg text-center text-sm text-white/55">
            منها ما اكتمل وينتظر فتح جائزته بترقّب، ومنها ما زال جاريًا. افتح جائزة لترى المفاجأة!
          </p>
          <CollectivesShowcase collectives={d.collectives} />
        </section>

        {/* ===== شبكة: نشاط حيّ + تحدّيات + ترتيب الأسر ===== */}
        <section className="grid gap-6 lg:grid-cols-3">
          {/* النشاط الحيّ */}
          <Glass className="p-5 lg:col-span-1">
            <h3 className="mb-4 font-display text-lg font-bold">⚡ نشاط حيّ</h3>
            <ul className="space-y-3">
              {d.activity.map((a, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm ring-1 ${TONE[a.tone] ?? TONE.ghars}`}>{a.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm leading-snug text-white/85">{a.text}</p>
                    <p className="text-[11px] text-white/40">{a.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Glass>

          <div className="space-y-6 lg:col-span-2">
            {/* تحدّيات عائلية */}
            <Glass className="p-5">
              <h3 className="mb-4 font-display text-lg font-bold">🚩 تحدّيات عائلية نشطة</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {d.challenges.map((c) => (
                  <div key={c.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{c.icon}</span>
                      <span className="text-[11px] text-white/50">أسرة {c.family}</span>
                    </div>
                    <p className="mt-1 text-sm font-bold">{c.title}</p>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <div className={`h-full rounded-full ${c.done ? "bg-leaf-400" : "bg-grape-400"}`} style={{ width: `${c.progress}%` }} />
                    </div>
                    <p className="mt-1 text-left text-[11px] text-white/50">{c.done ? "مكتمل ✓" : `${c.progress}%`}</p>
                  </div>
                ))}
              </div>
            </Glass>

            {/* ترتيب الأسر */}
            <Glass className="p-5">
              <h3 className="mb-4 font-display text-lg font-bold">🏡 أكثر الأسر نشاطًا</h3>
              <ul className="space-y-2">
                {d.families.slice(0, 6).map((f, i) => (
                  <li key={f.name} className="flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-2.5">
                    <span className="w-5 text-center text-sm font-bold text-white/50">{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold">أسرة {f.name}</p>
                      <p className="text-[11px] text-white/50">{f.members} أبناء · منذ {f.sinceMonths} شهرًا</p>
                    </div>
                    <span className="font-display text-base font-extrabold text-joy-300">{f.totalXp.toLocaleString("en-US")}</span>
                  </li>
                ))}
              </ul>
            </Glass>
          </div>
        </section>

        {/* ===== صناديق الحظ التفاعلية ===== */}
        <section>
          <SectionTitle kicker="LUCKY BOXES" title="🎁 صناديق الحظ — جرّب بنفسك!" />
          <p className="mx-auto mb-6 -mt-3 max-w-lg text-center text-sm text-white/55">
            اضغط أي صندوق لتفتحه وتشاهد المؤثرات والمكافأة. (شغّل الصوت من الأعلى 🔊)
          </p>
          <LuckBoxes />
        </section>

        {/* ===== رسم النمو ===== */}
        <section>
          <SectionTitle kicker="GROWTH" title="📈 المنصة في نموّ مستمر" />
          <GrowthChart />
        </section>

        {/* ===== دعوة ===== */}
        <section className="text-center">
          <Glass className="bg-gradient-to-br from-grape-500/25 to-bloom-500/15 p-10">
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl">ابدأ رحلة أسرتك مع قِيَم</h2>
            <p className="mx-auto mt-2 max-w-md text-white/70">القيمة قبل النقاط — حوّل القيم إلى سلوك يومي محبّب.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/login" className="rounded-full bg-white px-7 py-3 text-base font-bold text-ghars-800 transition hover:opacity-90">ابدأ الآن مجانًا 🌱</Link>
              <Link href="/guide" className="rounded-full border border-white/25 bg-white/10 px-7 py-3 text-base font-bold backdrop-blur transition hover:bg-white/20">دليل ولي الأمر</Link>
            </div>
            <p className="mt-6 text-xs text-white/40">مبادرة من جمعية سمو لتعزيز القيم · بيانات هذه الصفحة توضيحية للعرض</p>
          </Glass>
        </section>
      </div>
    </main>
  );
}

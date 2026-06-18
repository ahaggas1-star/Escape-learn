"use client";

import Link from "next/link";
import { useState } from "react";
import type { Collective } from "@/lib/showcase-data";
import { fireConfetti, celebrationBurst, playSound } from "./effects";

export function CollectivesShowcase({ collectives }: { collectives: Collective[] }) {
  const [active, setActive] = useState<Collective | null>(null);
  const [phase, setPhase] = useState<"count" | "reveal">("count");
  const [n, setN] = useState(3);

  function openPrize(c: Collective) {
    setActive(c);
    setPhase("count");
    setN(3);
    playSound("whoosh");
    let k = 3;
    const tick = () => {
      k -= 1;
      if (k > 0) { setN(k); playSound("pop"); setTimeout(tick, 750); }
      else {
        setPhase("reveal");
        celebrationBurst();
        playSound("fanfare");
      }
    };
    setTimeout(tick, 750);
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collectives.map((c) => {
          const pct = Math.round((c.current / c.target) * 100);
          const done = c.status === "done";
          return (
            <div key={c.title} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <div className="flex items-start justify-between">
                <span className="text-3xl">{c.icon}</span>
                {done ? (
                  <span className="animate-pulse rounded-full bg-joy-400/25 px-2.5 py-1 text-[11px] font-bold text-joy-100 ring-1 ring-joy-300/40">🎁 بانتظار فتح الجائزة</span>
                ) : (
                  <span className="rounded-full bg-sky-400/20 px-2.5 py-1 text-[11px] font-bold text-sky-100 ring-1 ring-sky-300/30">جارٍ</span>
                )}
              </div>
              <h3 className="mt-2 font-display text-lg font-bold text-white">{c.title}</h3>
              <p className="text-xs text-white/55">{c.desc}</p>
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className={`h-full rounded-full ${done ? "bg-leaf-400" : "bg-gradient-to-l from-joy-400 to-bloom-400"}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-white/60">
                <span>{c.current.toLocaleString("en-US")} / {c.target.toLocaleString("en-US")}</span>
                <span>{pct}% · {c.families} أسرة</span>
              </div>
              {done ? (
                <button
                  onClick={() => openPrize(c)}
                  className="mt-4 w-full rounded-2xl bg-gradient-to-l from-joy-500 to-bloom-500 py-2.5 text-sm font-extrabold text-white transition hover:opacity-90"
                >
                  🎁 افتح الجائزة الجماعية
                </button>
              ) : (
                <p className="mt-4 text-center text-xs text-white/40">يُكمَل قريبًا… الترقّب مستمر</p>
              )}
            </div>
          );
        })}
      </div>

      {/* نافذة الترقّب والكشف */}
      {active ? (
        <div className="fixed inset-0 z-[58] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" onClick={() => setActive(null)}>
          <div
            className="animate-pop w-full max-w-md rounded-3xl border border-white/15 bg-gradient-to-br from-[#3a2d4e] to-[#241b30] p-8 text-center text-white shadow-pop"
            onClick={(e) => e.stopPropagation()}
          >
            {phase === "count" ? (
              <>
                <p className="text-sm font-bold uppercase tracking-widest text-white/60">يُفتح خلال…</p>
                <div className="my-6 text-7xl font-extrabold tabular-nums">{n}</div>
                <div className="text-5xl" style={{ animation: "shake 0.5s ease-in-out infinite" }}>🎁</div>
                <p className="mt-4 text-sm text-white/60">ماذا يحتوي صندوق «{active.title}»؟ 🤔</p>
              </>
            ) : (
              <>
                <div className="text-6xl">🎉</div>
                <h3 className="mt-2 font-display text-2xl font-extrabold">مبروك! اكتمل الإنجاز</h3>
                <p className="text-sm text-white/70">{active.title} — بمشاركة {active.families} أسرة</p>
                <div className="my-5 space-y-2 rounded-2xl bg-white/10 p-4">
                  <p className="font-display text-lg font-extrabold text-joy-300">+{active.reward} نقطة خبرة لكل بطل ⭐</p>
                  <p className="text-sm text-white/80">🏅 شارة الإنجاز الجماعي + 🎁 مفاجأة من الإدارة</p>
                </div>

                {/* خطّاف الزائر */}
                <div className="rounded-2xl border border-joy-300/30 bg-joy-400/10 p-4">
                  <p className="text-sm font-bold text-white">أتريد أن يفتح ابنك جوائز حقيقية كهذه؟</p>
                  <p className="mt-0.5 text-xs text-white/70">سجّل أسرتك مجانًا وكن جزءًا من الإنجاز الجماعي القادم.</p>
                  <Link href="/login" className="mt-3 inline-block rounded-full bg-white px-6 py-2.5 text-sm font-extrabold text-ghars-800 transition hover:opacity-90">
                    سجّل أسرتك الآن 🌱
                  </Link>
                </div>
                <button onClick={() => setActive(null)} className="mt-4 text-xs text-white/50 hover:text-white">إغلاق</button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

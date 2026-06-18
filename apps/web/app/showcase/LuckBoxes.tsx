"use client";

import { useState } from "react";
import { fireConfetti, playSound } from "./effects";

type BoxDef = { type: string; emoji: string; cost: string; ring: string; glow: string; rewards: string[] };

const BOXES: BoxDef[] = [
  {
    type: "عادية", emoji: "🎁", cost: "مجاني", ring: "ring-ghars-300/40", glow: "from-ghars-400/40 to-ghars-600/10",
    rewards: ["رسالة تشجيع: أحسنت! 🌱", "+10 نقطة خبرة ⭐", "بطاقة تقدير 💌", "+5 عملات 🪙"],
  },
  {
    type: "مميزة", emoji: "🎀", cost: "١٥ عملة", ring: "ring-sky-300/50", glow: "from-sky-400/40 to-sky-600/10",
    rewards: ["رسالة من ولي الأمر: فخور بك! 🌟", "+20 نقطة خبرة ⭐", "بطاقة تقدير مميزة 🏅", "نشاط تختاره بنفسك 🎈"],
  },
  {
    type: "رهيبة", emoji: "💎", cost: "٣٠ عملة", ring: "ring-bloom-300/50", glow: "from-bloom-400/40 to-grape-600/10",
    rewards: ["أسطوري! اختر مكافأتك الكبرى 🎉", "+40 نقطة خبرة ⭐", "امتياز عائلي خاص 👑", "مفاجأة كبرى 🎊"],
  },
];

function Box({ def }: { def: BoxDef }) {
  const [state, setState] = useState<"idle" | "opening" | "opened">("idle");
  const [reward, setReward] = useState<string>("");

  function open(e: React.MouseEvent) {
    if (state === "opening") return;
    if (state === "opened") { setState("idle"); return; }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    setState("opening");
    playSound("whoosh");
    setTimeout(() => {
      const r = def.rewards[(Math.random() * def.rewards.length) | 0];
      setReward(r);
      setState("opened");
      fireConfetti({ x, y, count: def.type === "رهيبة" ? 120 : 80, power: def.type === "رهيبة" ? 13 : 10 });
      playSound(def.type === "رهيبة" ? "fanfare" : "win");
    }, 950);
  }

  return (
    <button
      onClick={open}
      className={`group relative flex min-h-[220px] flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${def.glow} p-6 text-center ring-1 ${def.ring} transition hover:-translate-y-1`}
    >
      {state !== "opened" ? (
        <>
          <div
            className={`text-6xl transition ${state === "opening" ? "animate-[shake_0.5s_ease-in-out_infinite]" : "group-hover:scale-110"}`}
            style={state === "opening" ? {} : { animation: "float 3s ease-in-out infinite" }}
          >
            {def.emoji}
          </div>
          <h3 className="mt-3 font-display text-xl font-extrabold text-white">الصندوق {def.type}</h3>
          <span className="mt-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white">{def.cost}</span>
          <span className="mt-3 text-xs text-white/70">
            {state === "opening" ? "يُفتح الآن…" : "اضغط لتفتحه ✨"}
          </span>
        </>
      ) : (
        <div className="animate-pop">
          <div className="text-5xl">🎉</div>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-white/60">حصلت على</p>
          <p className="mt-1 font-display text-lg font-extrabold text-white">{reward}</p>
          <span className="mt-4 inline-block rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold text-white">افتح مرة أخرى ↺</span>
        </div>
      )}
    </button>
  );
}

export function LuckBoxes() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {BOXES.map((b) => <Box key={b.type} def={b} />)}
    </div>
  );
}

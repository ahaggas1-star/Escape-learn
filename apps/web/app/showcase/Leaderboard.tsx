"use client";

import { useState } from "react";
import type { Champion } from "@/lib/showcase-data";

type Period = "daily" | "weekly" | "monthly";
const TABS: { k: Period; label: string }[] = [
  { k: "daily", label: "يومي" },
  { k: "weekly", label: "أسبوعي" },
  { k: "monthly", label: "شهري" },
];
const metric = (c: Champion, p: Period) => (p === "daily" ? c.daily : p === "weekly" ? c.weekly : c.total);
const MEDAL = ["🥇", "🥈", "🥉"];
const PODIUM_H = ["h-28", "h-20", "h-16"];
const PODIUM_ORDER = [1, 0, 2]; // الفضي · الذهبي · البرونزي

export function Leaderboard({ data }: { data: Record<Period, Champion[]> }) {
  const [period, setPeriod] = useState<Period>("weekly");
  const list = data[period];
  const top3 = list.slice(0, 3);
  const rest = list.slice(3, 12);

  return (
    <div>
      {/* مبدّل المدة */}
      <div className="mx-auto mb-7 flex w-fit rounded-full border border-white/15 bg-white/10 p-1 backdrop-blur">
        {TABS.map((t) => (
          <button
            key={t.k}
            onClick={() => setPeriod(t.k)}
            className={`rounded-full px-5 py-2 text-sm font-bold transition ${
              period === t.k ? "bg-white text-ghars-800 shadow" : "text-white/70 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* منصّة التتويج */}
      <div className="mb-6 flex items-end justify-center gap-3 sm:gap-5">
        {PODIUM_ORDER.map((idx) => {
          const c = top3[idx];
          if (!c) return null;
          return (
            <div key={c.id} className="flex w-24 flex-col items-center sm:w-32">
              <div className="mb-1 text-3xl">{MEDAL[idx]}</div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-3xl backdrop-blur ring-2 ring-white/25">
                {c.avatar}
              </div>
              <p className="mt-2 line-clamp-1 text-center text-sm font-bold text-white">{c.name}</p>
              <p className="text-[11px] text-white/60">أسرة {c.family}</p>
              <div className={`mt-2 flex w-full ${PODIUM_H[idx]} flex-col items-center justify-start rounded-t-2xl bg-gradient-to-b from-white/20 to-white/5 pt-2`}>
                <span className="text-lg font-extrabold text-white">{metric(c, period).toLocaleString("en-US")}</span>
                <span className="text-[10px] text-white/60">نقطة خبرة</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* بقية الترتيب */}
      <ul className="mx-auto max-w-xl space-y-2">
        {rest.map((c, i) => (
          <li
            key={c.id}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur transition hover:bg-white/10"
          >
            <span className="w-6 text-center text-sm font-bold text-white/50">{i + 4}</span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl">{c.avatar}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">
                {c.name} <span className="text-xs font-normal text-white/50">· أسرة {c.family}</span>
              </p>
              <p className="text-[11px] text-white/55">
                {c.level.emoji} {c.level.label} · {c.badges} شارة
              </p>
            </div>
            <div className="text-left">
              <p className="text-sm font-extrabold text-white">{metric(c, period).toLocaleString("en-US")}</p>
              <p className="text-[10px] text-white/50">نقطة</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

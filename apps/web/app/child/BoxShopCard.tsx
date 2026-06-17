"use client";

import { useFormState } from "react-dom";
import { openBox } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

type State = { error?: string | null; reward?: string } | undefined;

const STYLE: Record<string, { ring: string; bg: string; emoji: string; label: string }> = {
  normal: { ring: "border-ghars-200", bg: "from-ghars-50 to-white", emoji: "🎁", label: "عادية" },
  special: { ring: "border-sky-300", bg: "from-sky-50 to-white", emoji: "🎀", label: "مميزة" },
  awesome: { ring: "border-bloom-300", bg: "from-bloom-50 to-joy-50", emoji: "💎", label: "رهيبة" },
};

export function BoxShopCard({
  boxId,
  title,
  boxType,
  cost,
  canAfford,
}: {
  boxId: string;
  title: string;
  boxType: string;
  cost: number;
  canAfford: boolean;
}) {
  const [state, formAction] = useFormState<State, FormData>(openBox, undefined);
  const s = STYLE[boxType] ?? STYLE.normal;

  return (
    <form action={formAction} className={`rounded-2xl border-2 ${s.ring} bg-gradient-to-br ${s.bg} p-4 text-center shadow-card`}>
      <input type="hidden" name="box_id" value={boxId} />
      <div className="text-4xl">{s.emoji}</div>
      <p className="mt-1 font-display font-bold text-ghars-800">{title}</p>
      <p className="text-[11px] text-ghars-500">صندوق {s.label}</p>
      <p className="mt-1 text-sm font-bold text-joy-600">{cost === 0 ? "مجاني" : `${cost} 🪙`}</p>
      {state?.reward ? (
        <p className="mt-2 animate-pop rounded-lg bg-white/70 px-2 py-1 text-xs font-bold text-ghars-700">🎉 {state.reward}</p>
      ) : (
        <SubmitButton label={cost === 0 ? "افتح" : "افتح بالعملات"} className="btn-primary mt-2 w-full" pendingLabel="…" />
      )}
      {!canAfford && cost > 0 ? <p className="mt-1 text-[11px] text-ghars-400">تحتاج عملات أكثر</p> : null}
      {state?.error ? <p className="mt-1 text-xs text-red-600">{state.error}</p> : null}
    </form>
  );
}

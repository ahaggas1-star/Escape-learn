"use client";

import { useFormState } from "react-dom";
import { createBadge, createLevel, createAchievement, deleteGamItem } from "../actions";
import { SubmitButton } from "@/components/SubmitButton";

type State = { error?: string | null } | undefined;
type Opt = { id: string; label_ar: string };

function Err({ s }: { s: State }) {
  return s?.error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{s.error}</p> : null;
}

export function BadgeForm({ values }: { values: Opt[] }) {
  const [s, a] = useFormState<State, FormData>(createBadge, undefined);
  return (
    <form action={a} className="space-y-2 rounded-2xl border border-ghars-100 p-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <input name="label_ar" className="input" placeholder="اسم الشارة" required />
        <input name="key" className="input" placeholder="key" dir="ltr" required />
      </div>
      <input name="condition_ar" className="input" placeholder="شرط المنح الواضح" required />
      <select name="core_value_id" className="input" defaultValue="">
        <option value="">قيمة مرتبطة (اختياري)</option>
        {values.map((v) => <option key={v.id} value={v.id}>{v.label_ar}</option>)}
      </select>
      <Err s={s} />
      <SubmitButton label="إضافة شارة" className="btn-ghost text-xs" />
    </form>
  );
}

export function LevelForm() {
  const [s, a] = useFormState<State, FormData>(createLevel, undefined);
  return (
    <form action={a} className="space-y-2 rounded-2xl border border-ghars-100 p-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <input name="label_ar" className="input" placeholder="اسم المستوى" required />
        <input name="key" className="input" placeholder="key" dir="ltr" required />
        <input name="min_xp" type="number" min={0} className="input" placeholder="حد XP" dir="ltr" required />
      </div>
      <Err s={s} />
      <SubmitButton label="إضافة مستوى" className="btn-ghost text-xs" />
    </form>
  );
}

export function AchievementForm() {
  const [s, a] = useFormState<State, FormData>(createAchievement, undefined);
  return (
    <form action={a} className="space-y-2 rounded-2xl border border-ghars-100 p-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <input name="label_ar" className="input" placeholder="اسم الإنجاز" required />
        <input name="key" className="input" placeholder="key" dir="ltr" required />
      </div>
      <input name="description_ar" className="input" placeholder="الوصف (اختياري)" />
      <Err s={s} />
      <SubmitButton label="إضافة إنجاز" className="btn-ghost text-xs" />
    </form>
  );
}

export function DeleteGamButton({ table, id }: { table: string; id: string }) {
  const [, a] = useFormState<State, FormData>(deleteGamItem, undefined);
  return (
    <form action={a}>
      <input type="hidden" name="table" value={table} />
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="rounded-full px-2 py-0.5 text-xs text-red-600 hover:bg-red-50">حذف</button>
    </form>
  );
}

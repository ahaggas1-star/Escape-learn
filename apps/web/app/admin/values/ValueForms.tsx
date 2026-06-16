"use client";

import { useFormState } from "react-dom";
import { createCoreValue, createSubValue } from "../actions";
import { SubmitButton } from "@/components/SubmitButton";

type State = { error?: string | null } | undefined;
type Opt = { id: string; label_ar: string };

export function AddValueForm({ ageStages }: { ageStages: Opt[] }) {
  const [state, formAction] = useFormState<State, FormData>(createCoreValue, undefined);
  return (
    <form action={formAction} className="card space-y-3">
      <h2 className="font-bold text-ghars-700">إضافة قيمة رئيسية</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">الاسم بالعربية</label>
          <input name="label_ar" className="input" required placeholder="مثال: الشجاعة" />
        </div>
        <div>
          <label className="label">المفتاح (إنجليزي)</label>
          <input name="key" className="input" required dir="ltr" placeholder="courage" />
        </div>
      </div>
      <div>
        <label className="label">الوصف (اختياري)</label>
        <textarea name="description_ar" className="input" rows={2} />
      </div>
      <div>
        <label className="label">الفئة العمرية (اختياري)</label>
        <select name="age_stage_id" className="input" defaultValue="">
          <option value="">— كل الفئات</option>
          {ageStages.map((a) => <option key={a.id} value={a.id}>{a.label_ar}</option>)}
        </select>
      </div>
      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      ) : null}
      <SubmitButton label="حفظ القيمة" />
    </form>
  );
}

export function AddSubValueForm({ values }: { values: Opt[] }) {
  const [state, formAction] = useFormState<State, FormData>(createSubValue, undefined);
  return (
    <form action={formAction} className="card space-y-3">
      <h2 className="font-bold text-ghars-700">إضافة قيمة فرعية</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="label">القيمة الرئيسية</label>
          <select name="core_value_id" className="input" required defaultValue="">
            <option value="" disabled>اختر</option>
            {values.map((v) => <option key={v.id} value={v.id}>{v.label_ar}</option>)}
          </select>
        </div>
        <div>
          <label className="label">الاسم بالعربية</label>
          <input name="label_ar" className="input" required />
        </div>
        <div>
          <label className="label">المفتاح</label>
          <input name="key" className="input" required dir="ltr" />
        </div>
      </div>
      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      ) : null}
      <SubmitButton label="حفظ القيمة الفرعية" />
    </form>
  );
}

"use client";

import { useFormState } from "react-dom";
import { createFamilyCollective } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

type State = { error?: string | null } | undefined;
type Opt = { id: string; label_ar: string };

export function CreateCollectiveForm({ values }: { values: Opt[] }) {
  const [state, formAction] = useFormState<State, FormData>(createFamilyCollective, undefined);
  return (
    <form action={formAction} className="card space-y-3">
      <h2 className="font-display font-bold text-ghars-700">إنشاء إنجاز جماعي عائلي 🤝</h2>
      <p className="text-xs text-ghars-500">هدف تكمله الأسرة معًا — يتقدّم بالمهام المعتمدة فقط، مع سقف لكل طفل.</p>
      <div className="grid gap-3 sm:grid-cols-4">
        <input name="icon" className="input text-center" defaultValue="🤝" maxLength={2} />
        <input name="title_ar" className="input sm:col-span-3" placeholder="عنوان مثل: محيط العائلة" required />
      </div>
      <input name="description_ar" className="input" placeholder="وصف تحفيزي (اختياري)" />
      <div className="grid gap-3 sm:grid-cols-4">
        <div>
          <label className="label text-xs">القيمة (اختياري)</label>
          <select name="core_value_id" className="input" defaultValue="">
            <option value="">الكل</option>
            {values.map((v) => <option key={v.id} value={v.id}>{v.label_ar}</option>)}
          </select>
        </div>
        <div>
          <label className="label text-xs">الهدف (مهام)</label>
          <input name="target" type="number" min={1} defaultValue={8} className="input" dir="ltr" />
        </div>
        <div>
          <label className="label text-xs">سقف كل طفل</label>
          <input name="per_child_cap" type="number" min={1} defaultValue={5} className="input" dir="ltr" />
        </div>
        <div>
          <label className="label text-xs">مكافأة (نقاط)</label>
          <input name="reward_xp" type="number" min={0} defaultValue={40} className="input" dir="ltr" />
        </div>
      </div>
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <SubmitButton label="إنشاء" />
    </form>
  );
}

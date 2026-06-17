"use client";

import { useFormState } from "react-dom";
import { createOfficialCollective, deleteCollective } from "../actions";
import { SubmitButton } from "@/components/SubmitButton";

type State = { error?: string | null } | undefined;
type Opt = { id: string; label_ar: string };

export function OfficialCollectiveForm({ values }: { values: Opt[] }) {
  const [state, formAction] = useFormState<State, FormData>(createOfficialCollective, undefined);
  return (
    <form action={formAction} className="card space-y-3">
      <h2 className="font-display font-bold text-ghars-700">تحدٍّ جماعي رسمي 🏛️</h2>
      <p className="text-xs text-ghars-500">يظهر لكل الأسر ويدخل الترتيب — التقدّم من المهام المعتمدة فقط، مع سقف لكل طفل (لمنع التلاعب).</p>
      <div className="grid gap-3 sm:grid-cols-4">
        <input name="icon" className="input text-center" defaultValue="🏛️" maxLength={2} />
        <input name="title_ar" className="input sm:col-span-3" placeholder="عنوان التحدي" required />
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
          <label className="label text-xs">الهدف</label>
          <input name="target" type="number" min={1} defaultValue={10} className="input" dir="ltr" />
        </div>
        <div>
          <label className="label text-xs">سقف كل طفل</label>
          <input name="per_child_cap" type="number" min={1} defaultValue={6} className="input" dir="ltr" />
        </div>
        <div>
          <label className="label text-xs">مكافأة</label>
          <input name="reward_xp" type="number" min={0} defaultValue={80} className="input" dir="ltr" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-ghars-700">
        <input type="checkbox" name="is_published" defaultChecked /> نشر مباشرة
      </label>
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <SubmitButton label="إنشاء التحدي الرسمي" />
    </form>
  );
}

export function DeleteCollectiveButton({ id }: { id: string }) {
  const [, formAction] = useFormState<State, FormData>(deleteCollective, undefined);
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="rounded-full px-2.5 py-1 text-xs text-red-600 hover:bg-red-50">حذف</button>
    </form>
  );
}

"use client";

import { useFormState } from "react-dom";
import { addRewardItem, deleteRewardItem } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

type State = { error?: string | null } | undefined;

export function AddRewardForm() {
  const [state, formAction] = useFormState<State, FormData>(addRewardItem, undefined);
  return (
    <form action={formAction} className="card space-y-3">
      <h2 className="font-display font-bold text-ghars-700">إضافة مكافأة 🎁</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="label">وصف المكافأة</label>
          <input name="label_ar" className="input" required placeholder="مثال: نزهة عائلية، لعبة، وقت شاشة إضافي" />
        </div>
        <div>
          <label className="label">النوع</label>
          <select name="kind" className="input" defaultValue="material">
            <option value="material">مكافأة مادية</option>
            <option value="privilege">امتياز عائلي</option>
            <option value="activity_choice">اختيار نشاط</option>
            <option value="appreciation">بطاقة تقدير</option>
            <option value="message">رسالة تشجيع</option>
          </select>
        </div>
      </div>
      {state?.error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p> : null}
      <SubmitButton label="حفظ المكافأة" />
    </form>
  );
}

export function DeleteRewardButton({ id }: { id: string }) {
  const [, formAction] = useFormState<State, FormData>(deleteRewardItem, undefined);
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="rounded-full px-2.5 py-1 text-xs text-red-600 hover:bg-red-50">حذف</button>
    </form>
  );
}

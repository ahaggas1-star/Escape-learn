"use client";

import { useFormState } from "react-dom";
import { deleteChild, deleteFamilyData } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

type State = { error?: string | null } | undefined;

export function DeleteChildButton({ childId, name }: { childId: string; name: string }) {
  const [state, formAction] = useFormState<State, FormData>(deleteChild, undefined);
  return (
    <form action={formAction} className="flex items-center justify-between rounded-xl border border-ghars-100 px-3 py-2.5">
      <input type="hidden" name="child_id" value={childId} />
      <span className="text-sm font-semibold text-ghars-700">{name}</span>
      <div className="flex items-center gap-2">
        {state?.error ? <span className="text-xs text-red-600">{state.error}</span> : null}
        <button type="submit" className="rounded-full px-3 py-1 text-xs text-red-600 hover:bg-red-50">حذف</button>
      </div>
    </form>
  );
}

export function DeleteFamilyForm() {
  const [state, formAction] = useFormState<State, FormData>(deleteFamilyData, undefined);
  return (
    <form action={formAction} className="space-y-3 rounded-2xl border border-red-200 bg-red-50/50 p-4">
      <h2 className="font-display font-bold text-red-700">حذف بيانات الأسرة</h2>
      <p className="text-sm text-red-600">
        يحذف الأسرة وكل الأبناء والأهداف والمهام والتقدّم نهائيًا — لا يمكن التراجع.
      </p>
      <div>
        <label className="label text-red-700">اكتب «حذف» للتأكيد</label>
        <input name="confirm" className="input border-red-200" placeholder="حذف" required />
      </div>
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <SubmitButton label="حذف نهائيًا" className="btn bg-red-600 text-white hover:bg-red-700 w-full" pendingLabel="جارٍ الحذف…" />
    </form>
  );
}

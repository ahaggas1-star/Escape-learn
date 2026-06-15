"use client";

import { useFormState } from "react-dom";
import { createFamilyWithChild } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

type State = { error?: string | null } | undefined;

export function OnboardingForm() {
  const [state, formAction] = useFormState<State, FormData>(
    createFamilyWithChild,
    undefined
  );

  return (
    <form action={formAction} className="card space-y-4">
      <div>
        <label className="label" htmlFor="family_name">اسم الأسرة (اختياري)</label>
        <input className="input" id="family_name" name="family_name" type="text" placeholder="مثال: آل أحمد" />
      </div>

      <div className="border-t border-ghars-100 pt-4">
        <p className="mb-3 text-sm font-semibold text-ghars-700">أول ابن</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="child_name">اسم الابن</label>
            <input className="input" id="child_name" name="child_name" type="text" required />
          </div>
          <div>
            <label className="label" htmlFor="child_age">العمر</label>
            <input className="input" id="child_age" name="child_age" type="number" min={1} max={25} dir="ltr" />
          </div>
        </div>
        <p className="mt-2 text-xs text-ghars-500">
          نطلب أقل قدر من البيانات — يمكن استخدام اسم مختصر (الخصوصية أولًا).
        </p>
      </div>

      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      ) : null}

      <SubmitButton label="إنشاء الأسرة والمتابعة" />
    </form>
  );
}

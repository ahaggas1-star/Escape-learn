"use client";

import { useFormState } from "react-dom";
import { addChild } from "@/app/onboarding/actions";
import { SubmitButton } from "@/components/SubmitButton";

type State = { error?: string | null } | undefined;

export function AddChildForm() {
  const [state, formAction] = useFormState<State, FormData>(addChild, undefined);

  return (
    <form action={formAction} className="card space-y-4">
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

      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      ) : null}

      <SubmitButton label="إضافة الابن" />
    </form>
  );
}

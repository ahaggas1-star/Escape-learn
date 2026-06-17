"use client";

import { useFormState } from "react-dom";
import { childSignIn } from "../actions";
import { SubmitButton } from "@/components/SubmitButton";

type State = { error?: string | null } | undefined;

export function ChildLoginForm() {
  const [state, formAction] = useFormState<State, FormData>(childSignIn, undefined);
  return (
    <form action={formAction} className="card space-y-3">
      <div>
        <label className="label" htmlFor="username">اسم المستخدم</label>
        <input className="input" id="username" name="username" type="text" required dir="ltr" autoCapitalize="none" />
      </div>
      <div>
        <label className="label" htmlFor="password">كلمة المرور</label>
        <input className="input" id="password" name="password" type="password" required dir="ltr" />
      </div>
      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      ) : null}
      <SubmitButton label="دخول 🚀" />
    </form>
  );
}

"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { signIn, signUp } from "@/app/auth/actions";

type State = { error?: string | null; info?: string } | undefined;
const initial: State = undefined;

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "جارٍ المعالجة…" : label}
    </button>
  );
}

export function AuthForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const action = mode === "signin" ? signIn : signUp;
  const [state, formAction] = useFormState<State, FormData>(action, initial);

  return (
    <div className="card">
      <div className="mb-4 flex rounded-xl bg-ghars-50 p-1 text-sm font-medium">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`flex-1 rounded-lg py-2 ${mode === "signin" ? "bg-white text-ghars-700 shadow-sm" : "text-ghars-500"}`}
        >
          تسجيل الدخول
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-lg py-2 ${mode === "signup" ? "bg-white text-ghars-700 shadow-sm" : "text-ghars-500"}`}
        >
          حساب جديد
        </button>
      </div>

      <form action={formAction} className="space-y-3">
        <div>
          <label className="label" htmlFor="email">البريد الإلكتروني</label>
          <input className="input" id="email" name="email" type="email" required dir="ltr" />
        </div>
        <div>
          <label className="label" htmlFor="password">كلمة المرور</label>
          <input className="input" id="password" name="password" type="password" required dir="ltr" />
        </div>

        {state?.error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
        ) : null}
        {state?.info ? (
          <p className="rounded-lg bg-ghars-50 px-3 py-2 text-sm text-ghars-700">{state.info}</p>
        ) : null}

        <SubmitButton label={mode === "signin" ? "دخول" : "إنشاء الحساب"} />
      </form>
    </div>
  );
}

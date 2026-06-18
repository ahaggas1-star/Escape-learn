"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { addChild } from "@/app/onboarding/actions";
import { SubmitButton } from "@/components/SubmitButton";

type State = { error?: string | null } | undefined;

export function AddChildForm() {
  const [state, formAction] = useFormState<State, FormData>(addChild, undefined);
  const [withLogin, setWithLogin] = useState(false);

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

      {/* تجهيز الدخول في نفس الخطوة (اختياري) */}
      <div className="rounded-2xl bg-ghars-50/60 p-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-ghars-700">
          <input type="checkbox" checked={withLogin} onChange={(e) => setWithLogin(e.target.checked)} />
          🔑 جهّز دخول الطفل الآن (اختياري)
        </label>
        {withLogin ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">اسم المستخدم</label>
              <input className="input" name="username" dir="ltr" placeholder="abdullah" />
              <span className="mt-1 block text-xs text-ghars-400">أحرف إنجليزية صغيرة وأرقام و_ (3–30).</span>
            </div>
            <div>
              <label className="label">كلمة المرور</label>
              <input className="input" name="password" type="text" dir="ltr" placeholder="••••" />
              <span className="mt-1 block text-xs text-ghars-400">4 أحرف على الأقل — يمكنك تغييرها لاحقًا.</span>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-xs text-ghars-400">يمكنك تجهيزه الآن ليدخل الطفل بنفسه، أو لاحقًا من صفحة الابن.</p>
        )}
      </div>

      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      ) : null}

      <SubmitButton label="إضافة الابن" />
    </form>
  );
}

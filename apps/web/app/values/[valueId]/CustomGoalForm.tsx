"use client";

import { useFormState } from "react-dom";
import { createCustomGoal } from "@/app/goals/actions";
import { SubmitButton } from "@/components/SubmitButton";
import type { Child } from "@/lib/types";

type State = { error?: string | null } | undefined;

export function CustomGoalForm({
  coreValueId,
  children,
}: {
  coreValueId: string;
  children: Child[];
}) {
  const [state, formAction] = useFormState<State, FormData>(
    createCustomGoal,
    undefined
  );

  return (
    <form action={formAction} className="card space-y-3">
      <input type="hidden" name="core_value_id" value={coreValueId} />
      <h3 className="font-bold text-ghars-700">إنشاء هدف خاص</h3>

      <div>
        <label className="label" htmlFor="title_ar">عنوان الهدف</label>
        <input
          className="input"
          id="title_ar"
          name="title_ar"
          type="text"
          required
          placeholder="مثال: استخدام كلمات مهذبة عند الطلب والرفض"
        />
      </div>

      <div>
        <label className="label" htmlFor="measure_ar">طريقة القياس (مطلوبة)</label>
        <input
          className="input"
          id="measure_ar"
          name="measure_ar"
          type="text"
          required
          placeholder="مثال: مراقبة لمدة أسبوع، 5 مرات على الأقل"
        />
        <p className="mt-1 text-xs text-ghars-500">
          لا يُسمح بهدف عام غير قابل للمتابعة (مثل: «أريد ابني مهذبًا»).
        </p>
      </div>

      <div>
        <label className="label" htmlFor="description_ar">وصف قصير (اختياري)</label>
        <textarea className="input" id="description_ar" name="description_ar" rows={2} />
      </div>

      <div>
        <label className="label" htmlFor="child_id">الابن</label>
        <select id="child_id" name="child_id" className="input" required defaultValue="">
          <option value="" disabled>اختر الابن</option>
          {children.map((c) => (
            <option key={c.id} value={c.id}>{c.display_name}</option>
          ))}
        </select>
      </div>

      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      ) : null}

      <SubmitButton label="إنشاء الهدف" />
    </form>
  );
}

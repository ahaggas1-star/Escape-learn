"use client";

import { useFormState } from "react-dom";
import { createGoalTemplate } from "../actions";
import { SubmitButton } from "@/components/SubmitButton";

type State = { error?: string | null } | undefined;
type Opt = { id: string; label_ar: string; core_value_id?: string };

export function GoalTemplateForm({
  values,
  subValues,
  ageStages,
}: {
  values: Opt[];
  subValues: Opt[];
  ageStages: Opt[];
}) {
  const [state, formAction] = useFormState<State, FormData>(createGoalTemplate, undefined);

  return (
    <form action={formAction} className="card space-y-3">
      <h2 className="font-bold text-ghars-700">إضافة هدف جاهز</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">القيمة الرئيسية</label>
          <select name="core_value_id" className="input" required defaultValue="">
            <option value="" disabled>اختر</option>
            {values.map((v) => <option key={v.id} value={v.id}>{v.label_ar}</option>)}
          </select>
        </div>
        <div>
          <label className="label">القيمة الفرعية (اختياري)</label>
          <select name="sub_value_id" className="input" defaultValue="">
            <option value="">—</option>
            {subValues.map((s) => <option key={s.id} value={s.id}>{s.label_ar}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="label">عنوان الهدف</label>
        <input name="title_ar" className="input" required />
      </div>
      <div>
        <label className="label">الوصف (اختياري)</label>
        <textarea name="description_ar" className="input" rows={2} />
      </div>
      <div>
        <label className="label">معيار النجاح (اختياري)</label>
        <input name="success_criteria_ar" className="input" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="label">الفئة العمرية</label>
          <select name="age_stage_id" className="input" defaultValue="">
            <option value="">—</option>
            {ageStages.map((a) => <option key={a.id} value={a.id}>{a.label_ar}</option>)}
          </select>
        </div>
        <div>
          <label className="label">الصعوبة</label>
          <select name="difficulty" className="input" defaultValue="easy">
            <option value="easy">سهل</option>
            <option value="medium">متوسط</option>
            <option value="hard">صعب</option>
          </select>
        </div>
        <div>
          <label className="label">المدة (أيام)</label>
          <input name="suggested_duration_days" type="number" min={1} className="input" dir="ltr" />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-ghars-700">
        <input type="checkbox" name="is_published" /> نشر مباشرة (اعتماد المحتوى)
      </label>

      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      ) : null}
      <SubmitButton label="حفظ الهدف" />
    </form>
  );
}

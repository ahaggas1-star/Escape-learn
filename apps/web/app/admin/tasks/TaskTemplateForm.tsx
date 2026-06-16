"use client";

import { useFormState } from "react-dom";
import { createTaskTemplate } from "../actions";
import { SubmitButton } from "@/components/SubmitButton";

type State = { error?: string | null } | undefined;
type Opt = { id: string; label_ar: string };

export function TaskTemplateForm({
  values,
  subValues,
  ageStages,
}: {
  values: Opt[];
  subValues: Opt[];
  ageStages: Opt[];
}) {
  const [state, formAction] = useFormState<State, FormData>(createTaskTemplate, undefined);

  return (
    <form action={formAction} className="card space-y-3">
      <h2 className="font-bold text-ghars-700">إضافة مهمة جاهزة</h2>

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
        <label className="label">عنوان المهمة</label>
        <input name="title_ar" className="input" required />
      </div>
      <div>
        <label className="label">الوصف (اختياري)</label>
        <textarea name="description_ar" className="input" rows={2} />
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
          <label className="label">التكرار</label>
          <select name="repeat_type" className="input" defaultValue="daily">
            <option value="daily">يومية</option>
            <option value="weekly">أسبوعية</option>
            <option value="one_time">لمرة واحدة</option>
            <option value="family_challenge">تحدٍّ عائلي</option>
            <option value="reflection">ملاحظة/انعكاس</option>
            <option value="behavioral">سلوكية</option>
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="label">نوع الإثبات</label>
          <select name="proof" className="input" defaultValue="self_confirm">
            <option value="self_confirm">تأكيد ذاتي</option>
            <option value="note">ملاحظة</option>
            <option value="choice_list">اختيار من قائمة</option>
            <option value="guardian_direct">اعتماد مباشر</option>
            <option value="photo">صورة</option>
            <option value="auto_check">تحقق تلقائي</option>
          </select>
        </div>
        <div>
          <label className="label">XP الأساسي</label>
          <input name="base_xp" type="number" min={0} defaultValue={10} className="input" dir="ltr" />
        </div>
        <label className="flex items-end gap-2 pb-2 text-sm text-ghars-700">
          <input type="checkbox" name="needs_guardian_approval" defaultChecked /> يحتاج اعتماد
        </label>
      </div>

      <div>
        <label className="label">تعليمات للابن (اختياري)</label>
        <input name="child_instructions_ar" className="input" />
      </div>
      <div>
        <label className="label">إرشادات لولي الأمر (اختياري)</label>
        <input name="guardian_guidelines_ar" className="input" />
      </div>
      <div>
        <label className="label">معيار النجاح (اختياري)</label>
        <input name="success_criteria_ar" className="input" />
      </div>

      <label className="flex items-center gap-2 text-sm text-ghars-700">
        <input type="checkbox" name="is_published" /> نشر مباشرة (اعتماد المحتوى)
      </label>

      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      ) : null}
      <SubmitButton label="حفظ المهمة" />
    </form>
  );
}

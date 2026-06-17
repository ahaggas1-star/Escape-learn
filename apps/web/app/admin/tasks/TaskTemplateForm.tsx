"use client";

import { useFormState } from "react-dom";
import { createTaskTemplate } from "../actions";
import { SubmitButton } from "@/components/SubmitButton";

type State = { error?: string | null } | undefined;
type Opt = { id: string; label_ar: string };
type Action = (prev: State, fd: FormData) => Promise<State>;
type Initial = {
  id?: string;
  core_value_id?: string;
  sub_value_id?: string | null;
  age_stage_id?: string | null;
  title_ar?: string;
  description_ar?: string | null;
  difficulty?: string;
  repeat_type?: string;
  proof?: string;
  needs_guardian_approval?: boolean;
  base_xp?: number;
  child_instructions_ar?: string | null;
  guardian_guidelines_ar?: string | null;
  success_criteria_ar?: string | null;
  is_published?: boolean;
};

export function TaskTemplateForm({
  values,
  subValues,
  ageStages,
  action = createTaskTemplate,
  initial,
  submitLabel = "حفظ المهمة",
}: {
  values: Opt[];
  subValues: Opt[];
  ageStages: Opt[];
  action?: Action;
  initial?: Initial;
  submitLabel?: string;
}) {
  const [state, formAction] = useFormState<State, FormData>(action, undefined);

  return (
    <form action={formAction} className="card space-y-3">
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <h2 className="font-display font-bold text-ghars-700">
        {initial?.id ? "تعديل مهمة جاهزة" : "إضافة مهمة جاهزة"}
      </h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">القيمة الرئيسية</label>
          <select name="core_value_id" className="input" required defaultValue={initial?.core_value_id ?? ""}>
            <option value="" disabled>اختر</option>
            {values.map((v) => <option key={v.id} value={v.id}>{v.label_ar}</option>)}
          </select>
        </div>
        <div>
          <label className="label">القيمة الفرعية (اختياري)</label>
          <select name="sub_value_id" className="input" defaultValue={initial?.sub_value_id ?? ""}>
            <option value="">—</option>
            {subValues.map((s) => <option key={s.id} value={s.id}>{s.label_ar}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="label">عنوان المهمة</label>
        <input name="title_ar" className="input" required defaultValue={initial?.title_ar ?? ""} />
      </div>
      <div>
        <label className="label">الوصف (اختياري)</label>
        <textarea name="description_ar" className="input" rows={2} defaultValue={initial?.description_ar ?? ""} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="label">الفئة العمرية</label>
          <select name="age_stage_id" className="input" defaultValue={initial?.age_stage_id ?? ""}>
            <option value="">—</option>
            {ageStages.map((a) => <option key={a.id} value={a.id}>{a.label_ar}</option>)}
          </select>
        </div>
        <div>
          <label className="label">الصعوبة</label>
          <select name="difficulty" className="input" defaultValue={initial?.difficulty ?? "easy"}>
            <option value="easy">سهل</option>
            <option value="medium">متوسط</option>
            <option value="hard">صعب</option>
          </select>
        </div>
        <div>
          <label className="label">التكرار</label>
          <select name="repeat_type" className="input" defaultValue={initial?.repeat_type ?? "daily"}>
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
          <select name="proof" className="input" defaultValue={initial?.proof ?? "self_confirm"}>
            <option value="self_confirm">تأكيد ذاتي</option>
            <option value="note">ملاحظة</option>
            <option value="choice_list">اختيار من قائمة</option>
            <option value="guardian_direct">اعتماد مباشر</option>
            <option value="photo">صورة</option>
            <option value="auto_check">تحقق تلقائي</option>
          </select>
        </div>
        <div>
          <label className="label">نقاط الخبرة الأساسية</label>
          <input name="base_xp" type="number" min={0} defaultValue={initial?.base_xp ?? 10} className="input" dir="ltr" />
        </div>
        <label className="flex items-end gap-2 pb-2 text-sm text-ghars-700">
          <input type="checkbox" name="needs_guardian_approval" defaultChecked={initial?.needs_guardian_approval ?? true} /> يحتاج اعتماد
        </label>
      </div>

      <div>
        <label className="label">تعليمات للابن (اختياري)</label>
        <input name="child_instructions_ar" className="input" defaultValue={initial?.child_instructions_ar ?? ""} />
      </div>
      <div>
        <label className="label">إرشادات لولي الأمر (اختياري)</label>
        <input name="guardian_guidelines_ar" className="input" defaultValue={initial?.guardian_guidelines_ar ?? ""} />
      </div>
      <div>
        <label className="label">معيار النجاح (اختياري)</label>
        <input name="success_criteria_ar" className="input" defaultValue={initial?.success_criteria_ar ?? ""} />
      </div>

      <label className="flex items-center gap-2 text-sm text-ghars-700">
        <input type="checkbox" name="is_published" defaultChecked={initial?.is_published ?? false} /> نشر (اعتماد المحتوى)
      </label>

      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      ) : null}
      <SubmitButton label={submitLabel} />
    </form>
  );
}

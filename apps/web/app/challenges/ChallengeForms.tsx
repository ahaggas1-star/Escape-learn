"use client";

import { useFormState } from "react-dom";
import { createChallenge, awardChallenge } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

type State = { error?: string | null } | undefined;
type Opt = { id: string; label_ar: string };
type Child = { id: string; display_name: string };

export function CreateChallengeForm({ values }: { values: Opt[] }) {
  const [state, formAction] = useFormState<State, FormData>(createChallenge, undefined);
  return (
    <form action={formAction} className="card space-y-3">
      <h2 className="font-display font-bold text-ghars-700">تحدٍّ عائلي جديد 🚩</h2>
      <div>
        <label className="label">عنوان التحدي</label>
        <input name="title_ar" className="input" required placeholder="مثال: أسبوع التعاون العائلي" />
      </div>
      <div>
        <label className="label">الوصف (اختياري)</label>
        <textarea name="description_ar" className="input" rows={2} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="label">القيمة (اختياري)</label>
          <select name="core_value_id" className="input" defaultValue="">
            <option value="">—</option>
            {values.map((v) => <option key={v.id} value={v.id}>{v.label_ar}</option>)}
          </select>
        </div>
        <div>
          <label className="label">مكافأة XP</label>
          <input name="reward_xp" type="number" min={0} defaultValue={50} className="input" dir="ltr" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label">من</label>
            <input name="start_date" type="date" className="input" dir="ltr" />
          </div>
          <div>
            <label className="label">إلى</label>
            <input name="end_date" type="date" className="input" dir="ltr" />
          </div>
        </div>
      </div>
      {state?.error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p> : null}
      <SubmitButton label="إنشاء التحدي" />
    </form>
  );
}

export function AwardChallengeForm({
  challengeId,
  children,
}: {
  challengeId: string;
  children: Child[];
}) {
  const [state, formAction] = useFormState<State, FormData>(awardChallenge, undefined);
  return (
    <form action={formAction} className="mt-2 flex items-end gap-2">
      <input type="hidden" name="challenge_id" value={challengeId} />
      <div className="flex-1">
        <label className="label text-xs">منح الإنجاز لابن</label>
        <select name="child_id" className="input" required defaultValue="">
          <option value="" disabled>اختر الابن</option>
          {children.map((c) => <option key={c.id} value={c.id}>{c.display_name}</option>)}
        </select>
      </div>
      <SubmitButton label="منح 🎉" className="btn-joy" pendingLabel="…" />
      {state?.error ? <p className="w-full text-xs text-red-600">{state.error}</p> : null}
    </form>
  );
}

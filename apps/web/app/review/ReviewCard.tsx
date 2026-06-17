"use client";

import { useFormState, useFormStatus } from "react-dom";
import { reviewCompletion } from "./actions";

type State = { error?: string | null } | undefined;

function ReviewButtons() {
  const { pending } = useFormStatus();
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="submit"
        name="kind"
        value="approve"
        disabled={pending}
        className="btn-primary flex-1"
      >
        {pending ? "…" : "اعتماد ✓"}
      </button>
      <button
        type="submit"
        name="kind"
        value="redo"
        disabled={pending}
        className="btn-ghost flex-1"
      >
        إعادة تنفيذ
      </button>
      <button
        type="submit"
        name="kind"
        value="reject"
        disabled={pending}
        className="btn flex-1 bg-red-50 text-red-600 hover:bg-red-100"
      >
        رفض
      </button>
    </div>
  );
}

export function ReviewCard({
  completionId,
  childName,
  taskTitle,
  baseXp,
  note,
  photoUrl,
}: {
  completionId: string;
  childName: string;
  taskTitle: string;
  baseXp: number;
  note: string | null;
  photoUrl?: string | null;
}) {
  const [state, formAction] = useFormState<State, FormData>(
    reviewCompletion,
    undefined
  );

  return (
    <form action={formAction} className="card space-y-3">
      <input type="hidden" name="completion_id" value={completionId} />

      <div>
        <p className="font-semibold text-ghars-700">{taskTitle}</p>
        <p className="text-xs text-ghars-500">
          {childName} · عند الاعتماد: {baseXp}+ نقطة خبرة
        </p>
        {note ? (
          <p className="mt-1.5 rounded-lg bg-ghars-50 px-3 py-2 text-sm text-ghars-600">
            ملاحظة الابن: {note}
          </p>
        ) : null}
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt="صورة إثبات"
            className="mt-2 max-h-56 w-full rounded-2xl border border-ghars-100 object-cover"
          />
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div className="col-span-2 sm:col-span-1">
          <label className="label text-xs">نقاط خبرة إضافية (اختياري)</label>
          <input
            className="input"
            name="bonus_xp"
            type="number"
            min={0}
            max={100}
            defaultValue={0}
            dir="ltr"
          />
        </div>
        <input
          className="input col-span-2"
          name="comment"
          type="text"
          placeholder="تعليق/تشجيع (اختياري)"
        />
      </div>

      <ReviewButtons />

      {state?.error ? (
        <p className="text-xs text-red-600">{state.error}</p>
      ) : null}
    </form>
  );
}

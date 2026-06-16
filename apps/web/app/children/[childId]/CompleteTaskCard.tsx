"use client";

import { useFormState } from "react-dom";
import { completeTask } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

type State = { error?: string | null } | undefined;

export function CompleteTaskCard({
  assignedTaskId,
  title,
  description,
  baseXp,
  proof,
}: {
  assignedTaskId: string;
  title: string;
  description: string | null;
  baseXp: number;
  proof: string;
}) {
  const [state, formAction] = useFormState<State, FormData>(
    completeTask,
    undefined
  );
  const showNote = proof === "note";
  const showPhoto = proof === "photo";

  return (
    <form action={formAction} className="rounded-xl border border-ghars-100 p-4">
      <input type="hidden" name="assigned_task_id" value={assignedTaskId} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-ghars-700">{title}</p>
          {description ? (
            <p className="mt-0.5 text-xs text-ghars-500">{description}</p>
          ) : null}
          <p className="mt-1 text-xs text-ghars-600">{baseXp}+ XP</p>
        </div>
        <SubmitButton label="أنجزتها ✓" className="btn-primary" pendingLabel="…" />
      </div>

      {showNote ? (
        <textarea
          name="note"
          rows={2}
          className="input mt-3"
          placeholder="اكتب ملاحظة أو انعكاسًا قصيرًا (اختياري)"
        />
      ) : null}

      {showPhoto ? (
        <div className="mt-3">
          <label className="label text-xs">أرفق صورة إثبات</label>
          <input
            type="file"
            name="photo"
            accept="image/*"
            className="block w-full text-xs text-ghars-600 file:ml-2 file:rounded-xl file:border-0 file:bg-ghars-100 file:px-3 file:py-1.5 file:text-ghars-700"
          />
        </div>
      ) : null}

      {state?.error ? (
        <p className="mt-2 text-xs text-red-600">{state.error}</p>
      ) : null}
    </form>
  );
}

"use client";

import { useFormState } from "react-dom";
import { addTaskFromTemplate } from "@/app/goals/actions";
import { SubmitButton } from "@/components/SubmitButton";
import type { TaskTemplate } from "@/lib/types";

type State = { error?: string | null } | undefined;

export function AddTaskButton({
  template,
  goalId,
}: {
  template: TaskTemplate;
  goalId: string;
}) {
  const [state, formAction] = useFormState<State, FormData>(
    addTaskFromTemplate,
    undefined
  );

  return (
    <form action={formAction} className="rounded-xl border border-ghars-100 p-3">
      <input type="hidden" name="template_id" value={template.id} />
      <input type="hidden" name="goal_id" value={goalId} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-ghars-700">{template.title_ar}</p>
          {template.description_ar ? (
            <p className="text-xs text-ghars-500">{template.description_ar}</p>
          ) : null}
          <p className="mt-1 text-xs text-ghars-600">
            {template.base_xp}+ XP · {template.needs_guardian_approval ? "يحتاج اعتماد" : "بدون اعتماد"}
          </p>
        </div>
        <SubmitButton label="إسناد" className="btn-ghost text-xs" pendingLabel="…" />
      </div>
      {state?.error ? (
        <p className="mt-1 text-xs text-red-600">{state.error}</p>
      ) : null}
    </form>
  );
}

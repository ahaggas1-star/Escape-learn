"use client";

import { useFormState } from "react-dom";
import { addAllTasksFromTemplates } from "@/app/goals/actions";
import { SubmitButton } from "@/components/SubmitButton";

type State = { error?: string | null; info?: string } | undefined;

export function AddAllTasksButton({ goalId, count }: { goalId: string; count: number }) {
  const [state, formAction] = useFormState<State, FormData>(addAllTasksFromTemplates, undefined);
  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="goal_id" value={goalId} />
      <SubmitButton
        label={`⚡ أضف كل المهام المقترحة (${count})`}
        className="btn-primary text-sm"
        pendingLabel="جارٍ الإضافة…"
      />
      {state?.info ? <span className="text-xs text-ghars-600">{state.info}</span> : null}
      {state?.error ? <span className="text-xs text-red-600">{state.error}</span> : null}
    </form>
  );
}

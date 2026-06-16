"use client";

import { useFormState } from "react-dom";
import { deleteTemplate } from "./actions";

type State = { error?: string | null } | undefined;

export function DeleteTemplateButton({
  table,
  id,
}: {
  table: "goal_templates" | "task_templates";
  id: string;
}) {
  const [, formAction] = useFormState<State, FormData>(deleteTemplate, undefined);
  return (
    <form action={formAction}>
      <input type="hidden" name="table" value={table} />
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-full px-2.5 py-1 text-xs text-red-600 hover:bg-red-50"
        title="حذف"
      >
        حذف
      </button>
    </form>
  );
}

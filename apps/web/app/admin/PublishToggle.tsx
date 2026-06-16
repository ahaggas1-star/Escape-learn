"use client";

import { useFormState } from "react-dom";
import { setPublish } from "./actions";

type State = { error?: string | null } | undefined;

export function PublishToggle({
  table,
  id,
  published,
}: {
  table: "goal_templates" | "task_templates";
  id: string;
  published: boolean;
}) {
  const [, formAction] = useFormState<State, FormData>(setPublish, undefined);
  return (
    <form action={formAction}>
      <input type="hidden" name="table" value={table} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="publish" value={(!published).toString()} />
      <button
        type="submit"
        className={`rounded-full px-3 py-1 text-xs font-medium ${
          published
            ? "bg-ghars-100 text-ghars-700"
            : "bg-amber-50 text-amber-700"
        }`}
      >
        {published ? "منشور ✓" : "مسودة — نشر"}
      </button>
    </form>
  );
}

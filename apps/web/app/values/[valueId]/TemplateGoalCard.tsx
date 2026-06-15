"use client";

import { useFormState } from "react-dom";
import { createGoalFromTemplate } from "@/app/goals/actions";
import { SubmitButton } from "@/components/SubmitButton";
import type { Child, GoalTemplate } from "@/lib/types";

type State = { error?: string | null } | undefined;

export function TemplateGoalCard({
  template,
  children,
}: {
  template: GoalTemplate;
  children: Child[];
}) {
  const [state, formAction] = useFormState<State, FormData>(
    createGoalFromTemplate,
    undefined
  );

  return (
    <form action={formAction} className="rounded-xl border border-ghars-100 p-4">
      <input type="hidden" name="template_id" value={template.id} />
      <h3 className="font-bold text-ghars-700">{template.title_ar}</h3>
      {template.description_ar ? (
        <p className="mt-1 text-sm text-ghars-500">{template.description_ar}</p>
      ) : null}
      {template.success_criteria_ar ? (
        <p className="mt-2 text-xs text-ghars-600">
          معيار النجاح: {template.success_criteria_ar}
        </p>
      ) : null}

      <div className="mt-3 flex items-end gap-2">
        <div className="flex-1">
          <label className="label text-xs">الابن</label>
          <select name="child_id" className="input" required defaultValue="">
            <option value="" disabled>اختر الابن</option>
            {children.map((c) => (
              <option key={c.id} value={c.id}>{c.display_name}</option>
            ))}
          </select>
        </div>
        <SubmitButton label="اعتماد كهدف" className="btn-primary" pendingLabel="…" />
      </div>

      {state?.error ? (
        <p className="mt-2 text-xs text-red-600">{state.error}</p>
      ) : null}
    </form>
  );
}

"use client";

import { useFormState } from "react-dom";
import { approveAllPending } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

type State = { error?: string | null; info?: string } | undefined;

export function ApproveAllButton({ count }: { count: number }) {
  const [state, formAction] = useFormState<State, FormData>(approveAllPending, undefined);
  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <SubmitButton
        label={`✅ اعتمد الكل (${count})`}
        className="btn-primary text-sm"
        pendingLabel="جارٍ الاعتماد…"
      />
      {state?.info ? <span className="text-xs text-ghars-600">{state.info}</span> : null}
      {state?.error ? <span className="text-xs text-red-600">{state.error}</span> : null}
      <span className="text-xs text-ghars-400">يمنح النقاط الأساسية فقط — لمراجعة فردية استخدم البطاقات أدناه.</span>
    </form>
  );
}

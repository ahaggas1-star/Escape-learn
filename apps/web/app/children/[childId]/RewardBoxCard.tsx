"use client";

import { useFormState } from "react-dom";
import { openReward } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

type State = { error?: string | null } | undefined;

export function RewardBoxCard({ openingId, childId }: { openingId: string; childId: string }) {
  const [state, formAction] = useFormState<State, FormData>(openReward, undefined);

  return (
    <form action={formAction} className="rounded-xl border border-ghars-100 bg-white p-4 text-center">
      <input type="hidden" name="opening_id" value={openingId} />
      <input type="hidden" name="child_id" value={childId} />
      <div className="mb-2 text-3xl">🎁</div>
      <p className="mb-3 text-sm font-semibold text-ghars-700">صندوق إنجاز متاح</p>
      <SubmitButton label="افتح الصندوق" className="btn-primary w-full" pendingLabel="…" />
      {state?.error ? (
        <p className="mt-2 text-xs text-red-600">{state.error}</p>
      ) : null}
    </form>
  );
}

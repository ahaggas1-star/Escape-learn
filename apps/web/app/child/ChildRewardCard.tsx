"use client";

import { useFormState } from "react-dom";
import { childOpenReward } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

type State = { error?: string | null } | undefined;

export function ChildRewardCard({ openingId }: { openingId: string }) {
  const [state, formAction] = useFormState<State, FormData>(childOpenReward, undefined);
  return (
    <form action={formAction} className="rounded-2xl border border-joy-200 bg-gradient-to-br from-joy-50 to-bloom-50 p-4 text-center">
      <input type="hidden" name="opening_id" value={openingId} />
      <div className="mb-2 animate-float text-4xl">🎁</div>
      <p className="mb-3 text-sm font-bold text-ghars-700">صندوق مكافأة بانتظارك!</p>
      <SubmitButton label="افتح الآن 🎉" className="btn-joy w-full" pendingLabel="…" />
      {state?.error ? <p className="mt-2 text-xs text-red-600">{state.error}</p> : null}
    </form>
  );
}

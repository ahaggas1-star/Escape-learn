"use client";

import { useFormState } from "react-dom";
import { claimCollective } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Chip } from "@/components/ui/Chip";
import { cheer, type Collective } from "@/lib/collectives-shared";

type State = { error?: string | null; info?: string } | undefined;

export function CollectiveCard({ c, canClaim }: { c: Collective; canClaim: boolean }) {
  const [state, formAction] = useFormState<State, FormData>(claimCollective, undefined);
  const complete = c.current >= c.target;

  return (
    <div className="card space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <span className="text-2xl">{c.icon}</span>
          <div>
            <h3 className="font-display font-bold text-ghars-700">{c.title_ar}</h3>
            {c.description_ar ? <p className="text-xs text-ghars-500">{c.description_ar}</p> : null}
          </div>
        </div>
        <Chip tone={c.scope === "official" ? "grape" : "sky"}>
          {c.scope === "official" ? "رسمي" : "عائلي"}
        </Chip>
      </div>

      <ProgressBar value={c.pct} />
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-ghars-600">{c.current} / {c.target}</span>
        <span className="text-ghars-500">مكافأة {c.reward_xp} نقطة خبرة</span>
      </div>
      <p className="text-xs font-semibold text-ghars-600">{c.claimed ? "تم استلام المكافأة ✅" : cheer(c.pct)}</p>

      {canClaim && complete && !c.claimed ? (
        <form action={formAction}>
          <input type="hidden" name="collective_id" value={c.id} />
          <SubmitButton label="طالِب بالمكافأة 🎁" className="btn-joy w-full" pendingLabel="…" />
        </form>
      ) : null}
      {state?.error ? <p className="text-xs text-red-600">{state.error}</p> : null}
      {state?.info ? <p className="text-xs text-ghars-600">{state.info}</p> : null}
    </div>
  );
}

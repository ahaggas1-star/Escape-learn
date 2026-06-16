"use client";

import { useFormState } from "react-dom";
import { setUserRole } from "../actions";
import { SubmitButton } from "@/components/SubmitButton";

type State = { error?: string | null } | undefined;

const ROLES: { value: string; label: string }[] = [
  { value: "guardian", label: "ولي أمر" },
  { value: "content_manager", label: "مدير محتوى" },
  { value: "system_admin", label: "مدير نظام" },
];

export function RoleForm({
  userId,
  email,
  role,
}: {
  userId: string;
  email: string | null;
  role: string;
}) {
  const [state, formAction] = useFormState<State, FormData>(setUserRole, undefined);
  return (
    <form
      action={formAction}
      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-ghars-100 px-3 py-2.5"
    >
      <input type="hidden" name="user_id" value={userId} />
      <span className="text-sm text-ghars-700" dir="ltr">{email ?? userId.slice(0, 8)}</span>
      <div className="flex items-center gap-2">
        <select name="role" className="input !w-auto py-1.5 text-xs" defaultValue={role}>
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <SubmitButton label="حفظ" className="btn-ghost text-xs" pendingLabel="…" />
      </div>
      {state?.error ? (
        <p className="w-full text-xs text-red-600">{state.error}</p>
      ) : null}
    </form>
  );
}

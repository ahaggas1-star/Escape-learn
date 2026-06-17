"use client";

import { useFormState } from "react-dom";
import { setChildLogin, updateChildPublic } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

type State = { error?: string | null; info?: string } | undefined;

export function ChildLoginSettings({
  childId,
  username,
  nickname,
  publicMode,
}: {
  childId: string;
  username: string | null;
  nickname: string | null;
  publicMode: string;
}) {
  const [loginState, loginAction] = useFormState<State, FormData>(setChildLogin, undefined);
  const [pubState, pubAction] = useFormState<State, FormData>(updateChildPublic, undefined);

  return (
    <section className="space-y-3">
      {/* بيانات الدخول */}
      <form action={loginAction} className="card space-y-3">
        <input type="hidden" name="child_id" value={childId} />
        <h2 className="font-display font-bold text-ghars-700">🔑 دخول الطفل</h2>
        <p className="text-xs text-ghars-500">
          {username ? (
            <>اسم المستخدم الحالي: <span className="font-bold" dir="ltr">{username}</span> — يمكنك تغييره أو تحديث كلمة المرور.</>
          ) : (
            "أنشئ اسم مستخدم وكلمة مرور ليدخل بهما الطفل ويشاهد مهامه."
          )}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">اسم المستخدم</label>
            <input className="input" name="username" defaultValue={username ?? ""} dir="ltr" placeholder="abdullah" required />
          </div>
          <div>
            <label className="label">كلمة المرور</label>
            <input className="input" name="password" type="text" dir="ltr" placeholder="••••" required />
          </div>
        </div>
        {loginState?.error ? <p className="text-sm text-red-600">{loginState.error}</p> : null}
        {loginState?.info ? <p className="text-sm text-ghars-600">{loginState.info}</p> : null}
        <SubmitButton label={username ? "تحديث الدخول" : "إنشاء الدخول"} />
      </form>

      {/* الهوية العامة */}
      <form action={pubAction} className="card space-y-3">
        <input type="hidden" name="child_id" value={childId} />
        <h2 className="font-display font-bold text-ghars-700">👤 هوية الطفل العامة</h2>
        <p className="text-xs text-ghars-500">ما الذي يظهر للعامة في الترتيب والمشاركة؟</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">اللقب / الاسم المستعار</label>
            <input className="input" name="nickname" defaultValue={nickname ?? ""} placeholder="عبودي" />
          </div>
          <div>
            <label className="label">يظهر للعامة باسم</label>
            <select className="input" name="public_name_mode" defaultValue={publicMode}>
              <option value="nickname">اللقب / الاسم المستعار</option>
              <option value="first_name">الاسم الأول</option>
              <option value="full_name">الاسم الكامل</option>
            </select>
          </div>
        </div>
        {pubState?.error ? <p className="text-sm text-red-600">{pubState.error}</p> : null}
        {pubState?.info ? <p className="text-sm text-ghars-600">{pubState.info}</p> : null}
        <SubmitButton label="حفظ الهوية" />
      </form>
    </section>
  );
}

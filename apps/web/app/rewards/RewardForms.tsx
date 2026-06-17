"use client";

import { useFormState } from "react-dom";
import { createBox, updateBox, deleteBox, addRewardItem, deleteRewardItem } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

type State = { error?: string | null; info?: string } | undefined;

const TYPE_OPTS = [
  { v: "normal", l: "عادية 🎁" },
  { v: "special", l: "مميزة 🎀" },
  { v: "awesome", l: "رهيبة 💎" },
];

export function CreateBoxForm() {
  const [state, formAction] = useFormState<State, FormData>(createBox, undefined);
  return (
    <form action={formAction} className="card space-y-3">
      <h2 className="font-display font-bold text-ghars-700">إنشاء صندوق جديد 🎁</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <input name="title_ar" className="input sm:col-span-1" placeholder="اسم الصندوق" required />
        <select name="box_type" className="input" defaultValue="normal">
          {TYPE_OPTS.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
        </select>
        <input name="cost_coins" type="number" min={0} defaultValue={0} className="input" placeholder="التكلفة بالعملات (0 مجاني)" dir="ltr" />
      </div>
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <SubmitButton label="إنشاء الصندوق" />
    </form>
  );
}

export function BoxSettingsForm({
  boxId, title, boxType, cost, isActive,
}: { boxId: string; title: string; boxType: string; cost: number; isActive: boolean }) {
  const [state, formAction] = useFormState<State, FormData>(updateBox, undefined);
  return (
    <form action={formAction} className="card space-y-3">
      <input type="hidden" name="box_id" value={boxId} />
      <h2 className="font-display font-bold text-ghars-700">إعدادات الصندوق</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <input name="title_ar" className="input" defaultValue={title} required />
        <select name="box_type" className="input" defaultValue={boxType}>
          {TYPE_OPTS.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
        </select>
        <input name="cost_coins" type="number" min={0} defaultValue={cost} className="input" dir="ltr" />
      </div>
      <label className="flex items-center gap-2 text-sm text-ghars-700">
        <input type="checkbox" name="is_active" defaultChecked={isActive} /> مفعّل (يظهر للطفل)
      </label>
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state?.info ? <p className="text-sm text-ghars-600">{state.info}</p> : null}
      <div className="flex gap-2">
        <SubmitButton label="حفظ" className="btn-primary flex-1" />
      </div>
    </form>
  );
}

export function DeleteBoxForm({ boxId }: { boxId: string }) {
  return (
    <form action={deleteBox}>
      <input type="hidden" name="box_id" value={boxId} />
      <button type="submit" className="btn bg-red-50 text-red-600 hover:bg-red-100 text-xs">حذف الصندوق</button>
    </form>
  );
}

export function AddItemForm({ boxId }: { boxId: string }) {
  const [state, formAction] = useFormState<State, FormData>(addRewardItem, undefined);
  return (
    <form action={formAction} className="card space-y-3">
      <input type="hidden" name="box_id" value={boxId} />
      <h2 className="font-display font-bold text-ghars-700">إضافة عنصر / رسالة 💌</h2>
      <div className="grid gap-3 sm:grid-cols-4">
        <input name="label_ar" className="input sm:col-span-2" placeholder="النص (رسالتك أو المكافأة)" required />
        <select name="kind" className="input" defaultValue="message">
          <option value="message">رسالة</option>
          <option value="appreciation">تقدير</option>
          <option value="privilege">امتياز</option>
          <option value="material">مكافأة مادية</option>
          <option value="activity_choice">اختيار نشاط</option>
          <option value="xp">نقاط خبرة</option>
        </select>
        <input name="xp" type="number" min={1} defaultValue={10} className="input" placeholder="نقاط (إن كان نوعها نقاط)" dir="ltr" />
      </div>
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <SubmitButton label="إضافة" />
    </form>
  );
}

export function DeleteItemButton({ id, boxId }: { id: string; boxId: string }) {
  const [, formAction] = useFormState<State, FormData>(deleteRewardItem, undefined);
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="box_id" value={boxId} />
      <button type="submit" className="rounded-full px-2.5 py-1 text-xs text-red-600 hover:bg-red-50">حذف</button>
    </form>
  );
}

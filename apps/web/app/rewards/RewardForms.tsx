"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { createBox, updateBox, deleteBox, addRewardItem, deleteRewardItem } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

type State = { error?: string | null; info?: string } | undefined;

const TYPE_OPTS = [
  { v: "normal", l: "عادية 🎁", hint: "مكافأة بسيطة يومية" },
  { v: "special", l: "مميزة 🎀", hint: "لإنجاز أكبر" },
  { v: "awesome", l: "رهيبة 💎", hint: "لمناسبة استثنائية" },
];

const KIND_OPTS = [
  { v: "message", l: "رسالة 💌" },
  { v: "appreciation", l: "بطاقة تقدير 🌟" },
  { v: "privilege", l: "امتياز 👑" },
  { v: "material", l: "مكافأة مادية 🎁" },
  { v: "activity_choice", l: "اختيار نشاط 🎈" },
  { v: "xp", l: "نقاط خبرة ⭐" },
];
const KIND_LABEL: Record<string, string> = Object.fromEntries(KIND_OPTS.map((k) => [k.v, k.l]));

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-semibold text-ghars-700">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-ghars-400">{hint}</span> : null}
    </label>
  );
}

// حقل التكلفة بالعملات — واضح، مع أزرار سريعة وبدون لبس «السالب».
function CostField({ value, onChange, name = "cost_coins" }: { value: number; onChange: (n: number) => void; name?: string }) {
  return (
    <Field label="التكلفة بعملات الطفل 🪙">
      <div className="flex flex-wrap items-center gap-2">
        <input
          name={name}
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
          className="input w-28 text-center"
          dir="ltr"
        />
        <div className="flex flex-wrap gap-1.5">
          {[0, 5, 10, 20].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                value === n ? "bg-ghars-600 text-white" : "bg-ghars-50 text-ghars-700 hover:bg-ghars-100"
              }`}
            >
              {n === 0 ? "مجاني" : `${n} 🪙`}
            </button>
          ))}
        </div>
      </div>
      <span className="block text-xs text-ghars-500">
        {value > 0 ? `يفتح الطفل هذا الصندوق مقابل ${value} عملة.` : "الصندوق مجاني — يفتحه الطفل بدون أي عملات."}
      </span>
    </Field>
  );
}

// إنشاء صندوق كامل في صفحة وخطوة واحدة: الاسم + النوع + التكلفة + عناصره ورسائله.
export function CreateBoxForm() {
  const [state, formAction] = useFormState<State, FormData>(createBox, undefined);
  const [cost, setCost] = useState(0);
  const [items, setItems] = useState<{ kind: string; label: string; xp?: number }[]>([]);
  const [draftKind, setDraftKind] = useState("message");
  const [draftLabel, setDraftLabel] = useState("");
  const [draftXp, setDraftXp] = useState(10);

  function addItem() {
    if (draftLabel.trim().length < 2) return;
    setItems([...items, { kind: draftKind, label: draftLabel.trim(), xp: draftKind === "xp" ? draftXp : undefined }]);
    setDraftLabel("");
    setDraftKind("message");
    setDraftXp(10);
  }

  return (
    <form action={formAction} className="card space-y-5">
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      <div>
        <h2 className="font-display text-lg font-bold text-ghars-700">إنشاء صندوق مكافآت 🎁</h2>
        <p className="text-sm text-ghars-500">صفحة واحدة: سمِّ الصندوق، اختر نوعه وتكلفته، وضع رسائلك ومكافآتك بداخله.</p>
      </div>

      {/* الخطوة ١ */}
      <div className="space-y-3 rounded-2xl bg-ghars-50/50 p-3">
        <p className="text-xs font-bold text-ghars-600">الخطوة ١ — معلومات الصندوق</p>
        <Field label="اسم الصندوق" hint="مثال: صندوق نهاية الأسبوع">
          <input name="title_ar" className="input" placeholder="اكتب اسمًا واضحًا" required />
        </Field>
        <Field label="نوع الصندوق">
          <select name="box_type" className="input" defaultValue="normal">
            {TYPE_OPTS.map((t) => (
              <option key={t.v} value={t.v}>{t.l} — {t.hint}</option>
            ))}
          </select>
        </Field>
        <CostField value={cost} onChange={setCost} />
      </div>

      {/* الخطوة ٢ */}
      <div className="space-y-3 rounded-2xl bg-joy-50/40 p-3">
        <p className="text-xs font-bold text-ghars-600">الخطوة ٢ — ما بداخل الصندوق (رسائلك ومكافآتك)</p>
        {items.length > 0 ? (
          <ul className="space-y-1.5">
            {items.map((it, i) => (
              <li key={i} className="flex items-center justify-between rounded-xl border border-ghars-100 bg-white px-3 py-2 text-sm">
                <span className="text-ghars-700">
                  <span className="text-xs text-ghars-400">{KIND_LABEL[it.kind]}</span> — {it.label}
                  {it.xp ? ` (+${it.xp} نقطة)` : ""}
                </span>
                <button type="button" onClick={() => setItems(items.filter((_, j) => j !== i))} className="text-xs text-red-600 hover:underline">
                  حذف
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-ghars-400">لم تُضِف شيئًا بعد. أضف رسالة تشجيع أو مكافأة واحدة على الأقل.</p>
        )}

        <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <Field label="النص (رسالتك أو المكافأة)">
            <input
              value={draftLabel}
              onChange={(e) => setDraftLabel(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }}
              className="input"
              placeholder="مثال: أحسنت! اختر وجبتك المفضّلة"
            />
          </Field>
          <Field label="النوع">
            <select value={draftKind} onChange={(e) => setDraftKind(e.target.value)} className="input">
              {KIND_OPTS.map((k) => <option key={k.v} value={k.v}>{k.l}</option>)}
            </select>
          </Field>
          {draftKind === "xp" ? (
            <Field label="النقاط">
              <input type="number" min={1} value={draftXp} onChange={(e) => setDraftXp(Math.max(1, Number(e.target.value) || 1))} className="input w-20 text-center" dir="ltr" />
            </Field>
          ) : null}
          <button type="button" onClick={addItem} className="btn-ghost h-[42px] whitespace-nowrap">+ أضف</button>
        </div>
      </div>

      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <SubmitButton label="إنشاء الصندوق" className="btn-primary w-full" />
    </form>
  );
}

export function BoxSettingsForm({
  boxId, title, boxType, cost, isActive,
}: { boxId: string; title: string; boxType: string; cost: number; isActive: boolean }) {
  const [state, formAction] = useFormState<State, FormData>(updateBox, undefined);
  const [c, setC] = useState(cost);
  return (
    <form action={formAction} className="card space-y-3">
      <input type="hidden" name="box_id" value={boxId} />
      <h2 className="font-display font-bold text-ghars-700">إعدادات الصندوق</h2>
      <Field label="اسم الصندوق">
        <input name="title_ar" className="input" defaultValue={title} required />
      </Field>
      <Field label="نوع الصندوق">
        <select name="box_type" className="input" defaultValue={boxType}>
          {TYPE_OPTS.map((t) => <option key={t.v} value={t.v}>{t.l} — {t.hint}</option>)}
        </select>
      </Field>
      <CostField value={c} onChange={setC} />
      <label className="flex items-center gap-2 text-sm text-ghars-700">
        <input type="checkbox" name="is_active" defaultChecked={isActive} /> مفعّل (يظهر للطفل)
      </label>
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state?.info ? <p className="text-sm text-ghars-600">{state.info}</p> : null}
      <SubmitButton label="حفظ" className="btn-primary w-full" />
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
  const [kind, setKind] = useState("message");
  return (
    <form action={formAction} className="card space-y-3">
      <input type="hidden" name="box_id" value={boxId} />
      <h2 className="font-display font-bold text-ghars-700">إضافة عنصر / رسالة 💌</h2>
      <div className="grid gap-3 sm:grid-cols-4">
        <Field label="النص (رسالتك أو المكافأة)">
          <input name="label_ar" className="input" placeholder="مثال: أحسنت! استمر" required />
        </Field>
        <Field label="النوع">
          <select name="kind" value={kind} onChange={(e) => setKind(e.target.value)} className="input">
            {KIND_OPTS.map((k) => <option key={k.v} value={k.v}>{k.l}</option>)}
          </select>
        </Field>
        {kind === "xp" ? (
          <Field label="النقاط">
            <input name="xp" type="number" min={1} defaultValue={10} className="input" dir="ltr" />
          </Field>
        ) : null}
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

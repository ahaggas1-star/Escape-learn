"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export type Step = {
  key: string;
  icon: string;
  title: string;
  desc: string;
  href: string;
  cta: string;
  done: boolean;
};

const DISMISS_KEY = "qiyam_quickstart_dismissed_v1";

// رحلة بداية موجّهة لولي الأمر: خطوات مرتّبة، تُبرز الخطوة التالية فقط لتقليل التشتّت.
export function QuickStart({ steps, familyName }: { steps: Step[]; familyName: string }) {
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;
  const nextIndex = steps.findIndex((s) => !s.done);

  // قبل قراءة التخزين لا نعرض شيئًا (تفادي وميض)، وبعد الإكمال أو الإخفاء نختفي.
  if (dismissed === null) return null;
  if (dismissed || allDone) return null;

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  return (
    <section className="card border-ghars-200 bg-gradient-to-br from-white to-ghars-50/60">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-ghars-800">👋 لنبدأ خطوة بخطوة</h2>
          <p className="text-sm text-ghars-500">
            خمس خطوات بسيطة تجهّز {familyName} للاستفادة الكاملة. أكملت {doneCount} من {steps.length}.
          </p>
        </div>
        <button onClick={dismiss} className="shrink-0 text-xs text-ghars-400 hover:text-ghars-600">إخفاء</button>
      </div>

      {/* شريط تقدّم */}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-ghars-100">
        <div className="h-full rounded-full bg-ghars-600 transition-all" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
      </div>

      <ol className="mt-4 space-y-2">
        {steps.map((s, i) => {
          const isNext = i === nextIndex;
          return (
            <li
              key={s.key}
              className={`flex items-center gap-3 rounded-2xl border p-3 transition ${
                s.done
                  ? "border-ghars-100 bg-white/60"
                  : isNext
                  ? "border-ghars-300 bg-white shadow-soft"
                  : "border-line bg-white/40 opacity-70"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg ${
                  s.done ? "bg-ghars-100 text-ghars-600" : "bg-ghars-50 text-ghars-700"
                }`}
              >
                {s.done ? "✅" : s.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`font-display text-sm font-bold ${s.done ? "text-ghars-500 line-through" : "text-ghars-800"}`}>
                  {i + 1}. {s.title}
                </p>
                {!s.done && isNext ? <p className="text-xs text-ghars-500">{s.desc}</p> : null}
              </div>
              {!s.done ? (
                <Link
                  href={s.href}
                  className={`shrink-0 text-xs ${isNext ? "btn-primary" : "btn-ghost"}`}
                >
                  {s.cta}
                </Link>
              ) : null}
            </li>
          );
        })}
      </ol>

      <p className="mt-3 text-center text-xs text-ghars-400">
        تحتاج تفاصيل أكثر؟{" "}
        <Link href="/guide" className="font-semibold text-ghars-600 hover:underline">افتح دليل ولي الأمر</Link>
      </p>
    </section>
  );
}

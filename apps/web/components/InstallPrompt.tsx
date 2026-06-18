"use client";

import { useEffect, useState } from "react";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const DISMISS_KEY = "qiyam_install_dismissed_v1";

// لافتة «أضف التطبيق إلى الشاشة الرئيسية» — إحساس تطبيق أصلي (Android/Chrome + تلميح iOS).
export function InstallPrompt() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true;
    if (standalone) return;

    const onBIP = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", onBIP);

    // iOS لا يدعم beforeinstallprompt → نعرض تلميحًا يدويًا.
    const ua = window.navigator.userAgent;
    const isIos = /iPad|iPhone|iPod/.test(ua) && !/Windows/.test(ua);
    if (isIos) setIosHint(true);

    return () => window.removeEventListener("beforeinstallprompt", onBIP);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setEvt(null);
    setIosHint(false);
  }

  async function install() {
    if (!evt) return;
    await evt.prompt();
    await evt.userChoice.catch(() => undefined);
    dismiss();
  }

  if (!evt && !iosHint) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom)+76px)] lg:pb-4"
      role="dialog"
      aria-label="تثبيت التطبيق"
    >
      <div className="mx-auto flex w-full max-w-md items-center gap-3 rounded-2xl border border-line bg-white p-3 shadow-pop">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.svg" alt="" width={40} height={40} className="rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-bold text-ghars-800">ثبّت «قِيَم» كتطبيق</p>
          <p className="truncate text-xs text-ghars-500">
            {evt ? "وصول أسرع من شاشتك الرئيسية." : "شارك ← «أضف إلى الشاشة الرئيسية»."}
          </p>
        </div>
        {evt ? (
          <button onClick={install} className="btn-primary shrink-0 text-xs">تثبيت</button>
        ) : null}
        <button onClick={dismiss} className="shrink-0 px-1.5 text-lg leading-none text-ghars-400 hover:text-ghars-600" aria-label="إغلاق">×</button>
      </div>
    </div>
  );
}

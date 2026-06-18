"use client";

import { useEffect, useState } from "react";
import { celebrationBurst, fireConfetti, playSound, setSoundOn, isSoundOn } from "./effects";

// احتفال فوري عند فتح الصفحة ببطل الأمس (المركز الأول في الترتيب اليومي).
export function OnLoadCelebration({ name, family, avatar }: { name: string; family: string; avatar: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setShow(true);
      celebrationBurst();
      if (isSoundOn()) playSound("fanfare");
    }, 600);
    const t2 = setTimeout(() => setShow(false), 7000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[55] flex items-start justify-center px-4 pt-24" onClick={() => setShow(false)}>
      <div
        className="animate-pop pointer-events-auto w-full max-w-sm rounded-3xl border border-white/20 bg-gradient-to-br from-grape-600/90 to-bloom-600/80 p-6 text-center text-white shadow-pop backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs font-bold uppercase tracking-widest text-white/70">🏆 بطل الأمس — الترتيب اليومي</p>
        <div className="mx-auto mt-3 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 text-5xl ring-4 ring-white/30">
          {avatar}
        </div>
        <h3 className="mt-3 font-display text-2xl font-extrabold">مبروك {name}! 🎉</h3>
        <p className="text-sm text-white/80">حقّقت أسرة {family} المركز الأول أمس</p>

        <div className="mt-4 flex items-center justify-center gap-2">
          {!isSoundOn() ? (
            <button
              onClick={() => { setSoundOn(true); playSound("fanfare"); fireConfetti({ count: 60 }); }}
              className="rounded-full bg-white px-4 py-2 text-sm font-bold text-ghars-800"
            >
              🔊 شغّل صوت الاحتفال
            </button>
          ) : (
            <button
              onClick={() => { celebrationBurst(); playSound("win"); }}
              className="rounded-full bg-white px-4 py-2 text-sm font-bold text-ghars-800"
            >
              🎉 احتفل من جديد
            </button>
          )}
          <button onClick={() => setShow(false)} className="rounded-full border border-white/30 px-3 py-2 text-sm">إغلاق</button>
        </div>
      </div>
    </div>
  );
}

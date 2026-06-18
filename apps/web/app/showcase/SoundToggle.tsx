"use client";

import { useEffect, useState } from "react";
import { isSoundOn, setSoundOn, onSoundChange, playSound } from "./effects";

export function SoundToggle() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(isSoundOn());
    return onSoundChange(setOn);
  }, []);

  return (
    <button
      onClick={() => {
        const next = !on;
        setSoundOn(next);
        if (next) playSound("coin");
      }}
      className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold backdrop-blur transition hover:bg-white/20"
      aria-label="تبديل الصوت"
      title={on ? "إيقاف الصوت" : "تشغيل الصوت"}
    >
      {on ? "🔊 الصوت يعمل" : "🔈 شغّل الصوت"}
    </button>
  );
}

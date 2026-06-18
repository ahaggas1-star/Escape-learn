"use client";

import { useState } from "react";

export function ShareAchievement({ name }: { name: string }) {
  const [done, setDone] = useState(false);
  async function share() {
    const text = `🌟 ${name} يتصدّر أبطال «قِيَم» هذا الأسبوع! القيمة قبل النقاط.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "أبطال قِيَم", text });
      } else {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1800);
      }
    } catch {
      /* أُلغيت المشاركة — تجاهل */
    }
  }
  return (
    <button onClick={share} className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold text-ghars-800 transition hover:opacity-90">
      🔗 {done ? "تم النسخ!" : "شارك الإنجاز"}
    </button>
  );
}

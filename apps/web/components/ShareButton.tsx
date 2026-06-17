"use client";

import { useState } from "react";

// زر مشاركة بطاقة الإنجاز (يستخدم مشاركة النظام أو نسخ الرابط).
export function ShareButton({ path, title }: { path: string; title?: string }) {
  const [copied, setCopied] = useState(false);

  async function onShare() {
    const url = typeof window !== "undefined" ? window.location.origin + path : path;
    const data = { title: title ?? "بطاقة إنجاز — قِيَم", text: "شاهد إنجازاتي في منصة قِيَم! 🌟", url };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
    } catch {
      /* المستخدم ألغى — تجاهل */
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* تجاهل */
    }
  }

  return (
    <button type="button" onClick={onShare} className="btn-ghost text-xs">
      {copied ? "تم نسخ الرابط ✓" : "🔗 مشاركة إنجازاتي"}
    </button>
  );
}

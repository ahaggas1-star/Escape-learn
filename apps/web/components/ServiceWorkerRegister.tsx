"use client";

import { useEffect } from "react";

// يسجّل Service Worker للعمل دون اتصال والتثبيت كـPWA.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // تجاهل الفشل بصمت (لا يؤثر على التطبيق).
      });
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);
  return null;
}

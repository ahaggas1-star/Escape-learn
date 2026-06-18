"use client";

import { useEffect, useRef, useState } from "react";

// عدّاد متحرّك يبدأ من الصفر عند ظهوره — يبدأ بالقيمة النهائية في SSR (بلا تعارض ترطيب).
export function CountUp({ end, duration = 1300 }: { end: number; duration?: number }) {
  const [val, setVal] = useState(end);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const ease = (p: number) => 1 - Math.pow(1 - p, 3);
    setVal(0);
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setVal(Math.round(end * ease(p)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);

  return <span ref={ref}>{val.toLocaleString("en-US")}</span>;
}

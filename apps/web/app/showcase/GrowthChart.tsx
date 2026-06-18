// رسم نمو توضيحي (SVG) مع رسم متحرّك للخط — يعزّز إحساس «منصة تعمل منذ سنة».
const MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const SERIES = [2, 3, 5, 6, 8, 9, 11, 12, 14, 16, 18, 20]; // أسر تراكمية

export function GrowthChart() {
  const W = 720, H = 220, pad = 28;
  const max = 22;
  const x = (i: number) => pad + (i * (W - pad * 2)) / (SERIES.length - 1);
  const y = (v: number) => H - pad - (v / max) * (H - pad * 2);
  const line = SERIES.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L ${x(SERIES.length - 1).toFixed(1)} ${H - pad} L ${x(0).toFixed(1)} ${H - pad} Z`;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-white">📈 نمو الأسر خلال السنة</h3>
        <span className="rounded-full bg-leaf-400/20 px-3 py-1 text-xs font-bold text-leaf-200 ring-1 ring-leaf-300/30">+900% ↑</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="رسم نمو الأسر">
        <defs>
          <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#a78bfa" stopOpacity="0.45" />
            <stop offset="1" stopColor="#a78bfa" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="growthLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fb923c" />
            <stop offset="0.5" stopColor="#ec4899" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((g) => (
          <line key={g} x1={pad} x2={W - pad} y1={pad + g * ((H - pad * 2) / 3)} y2={pad + g * ((H - pad * 2) / 3)} stroke="rgba(255,255,255,0.08)" />
        ))}
        <path d={area} fill="url(#growthFill)" />
        <path d={line} fill="none" stroke="url(#growthLine)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="animate-draw" />
        {SERIES.map((v, i) => (
          <circle key={i} cx={x(i)} cy={y(v)} r="4" fill="#fff" />
        ))}
        {SERIES.map((v, i) => (
          i % 2 === 0 ? <text key={i} x={x(i)} y={H - 8} fill="rgba(255,255,255,0.45)" fontSize="11" textAnchor="middle">{MONTHS[i].slice(0, 3)}</text> : null
        ))}
      </svg>
    </div>
  );
}

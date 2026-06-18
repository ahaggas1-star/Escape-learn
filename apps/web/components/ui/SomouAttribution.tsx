// إسناد بصري لجمعية سمو لتعزيز القيم (ثنائي اللغة) — يربط منصة «قِيَم» بالعلامة الأم.
export function SomouAttribution({
  variant = "stacked",
  withLink = true,
  className = "",
}: {
  variant?: "stacked" | "inline";
  withLink?: boolean;
  className?: string;
}) {
  const inner =
    variant === "inline" ? (
      <span className="inline-flex items-center gap-1.5 text-xs text-ghars-500">
        <span aria-hidden>🌳</span>
        <span>مبادرة من <span className="font-semibold text-ghars-700">جمعية سمو لتعزيز القيم</span></span>
      </span>
    ) : (
      <span className="inline-flex flex-col items-center leading-tight">
        <span className="text-[11px] text-ghars-400">مبادرة من</span>
        <span className="font-display text-sm font-bold text-ghars-700">جمعية سمو لتعزيز القيم</span>
        <span className="mt-0.5 text-[9px] tracking-[0.12em] text-ghars-400">
          SOMOU ASSOCIATION FOR VALUES ENHANCEMENT
        </span>
      </span>
    );

  if (!withLink) return <span className={className}>{inner}</span>;

  return (
    <a
      href="https://sumo.org.sa/"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex transition hover:opacity-80 ${className}`}
    >
      {inner}
    </a>
  );
}

// بطاقة مؤشّر صغيرة بلون اختياري.
const TONES: Record<string, string> = {
  ghars: "text-ghars-700",
  joy: "text-joy-600",
  sky: "text-sky-600",
  bloom: "text-bloom-600",
  grape: "text-grape-600",
};

export function StatTile({
  label,
  value,
  tone = "ghars",
  icon,
}: {
  label: string;
  value: string | number;
  tone?: keyof typeof TONES;
  icon?: string;
}) {
  return (
    <div className="stat">
      {icon ? <div className="mb-0.5 text-lg">{icon}</div> : null}
      <p className={`font-display text-2xl font-extrabold ${TONES[tone] ?? TONES.ghars}`}>{value}</p>
      <p className="stat-label">{label}</p>
    </div>
  );
}

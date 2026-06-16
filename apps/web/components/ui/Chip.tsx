// رقاقة ملوّنة (شارات، قيم فرعية، وسوم).
const TONES: Record<string, string> = {
  ghars: "bg-ghars-100 text-ghars-700",
  joy: "bg-joy-100 text-joy-600",
  sky: "bg-sky-100 text-sky-600",
  bloom: "bg-bloom-100 text-bloom-600",
  grape: "bg-grape-100 text-grape-600",
};

export function Chip({
  children,
  tone = "ghars",
}: {
  children: React.ReactNode;
  tone?: keyof typeof TONES;
}) {
  return <span className={`chip ${TONES[tone] ?? TONES.ghars}`}>{children}</span>;
}

// شريط متحرّك لإنجازات حيّة — يعزّز إحساس الحركة والحياة.
const ITEMS = [
  "🏅 شارة «الملتزم» لـ سالم",
  "🎯 اكتمل «شهر الإحسان» بـ ١٩ أسرة",
  "⭐ نورة بلغت مستوى «قدوة»",
  "🎁 فتح يوسف الصندوق الرهيب",
  "🤝 مبادرة تعاون جديدة لأسرة النور",
  "🔥 ريم: ١٤ يومًا متتاليًا",
  "🚩 تحدٍّ عائلي جديد في أسرة العزم",
  "📚 ماراثون القراءة وصل ١٠٠٪",
  "💎 فهد حصل على ٣ شارات",
  "🌱 انضمام أسرة المستقبل",
];

export function AchievementsMarquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 py-3 backdrop-blur">
      <div className="flex w-max animate-marquee gap-3 px-3">
        {row.map((t, i) => (
          <span key={i} className="whitespace-nowrap rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/85">
            {t}
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#3f3350] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#241b30] to-transparent" />
    </div>
  );
}

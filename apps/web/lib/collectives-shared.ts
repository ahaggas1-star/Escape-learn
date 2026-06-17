// أنواع ومنطق عرض آمنة للعميل (بلا استيراد خادم).

export interface Collective {
  id: string;
  scope: "official" | "family";
  title_ar: string;
  description_ar: string | null;
  icon: string;
  target: number;
  reward_xp: number;
  current: number;
  claimed: boolean;
  pct: number;
}

export interface ChildRank {
  child_id: string;
  name: string;
  total_xp: number;
  rank: number;
}

// عبارة تشجيعية حسب نسبة التقدّم.
export function cheer(pct: number): string {
  if (pct >= 100) return "اكتمل! 🎉 طالبوا بالمكافأة";
  if (pct >= 80) return "تبقّى القليل جدًا… أنتم على وشك! 💪";
  if (pct >= 50) return "تجاوزتم المنتصف، استمروا! 🚀";
  if (pct >= 20) return "بداية رائعة، واصلوا معًا 🌱";
  return "ابدؤوا رحلتكم الجماعية ✨";
}

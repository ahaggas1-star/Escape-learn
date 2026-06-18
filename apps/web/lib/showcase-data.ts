// =============================================================================
// بيانات «العرض التفاعلي» (/showcase) — مولّد حتمي لبيانات وهمية غنية
// 20 أسرة · أطفال أبطال · ترتيب يومي/أسبوعي/شهري · إنجازات جماعية · نشاط حيّ.
// حتمي (بذرة ثابتة) كي لا يختلف بين التصيير على الخادم والعميل.
// =============================================================================

export type Champion = {
  id: number;
  name: string;
  family: string;
  avatar: string;
  age: number;
  total: number;
  weekly: number;
  daily: number;
  badges: number;
  achievements: number;
  streak: number;
  level: { key: string; label: string; emoji: string; min: number; next: number | null };
};

export type FamilyAgg = { name: string; owner: string; members: number; totalXp: number; sinceMonths: number };
export type Collective = {
  title: string; icon: string; desc: string; target: number; current: number;
  reward: number; status: "done" | "active"; families: number;
};
export type Activity = { icon: string; text: string; time: string; tone: string };
export type Challenge = { title: string; icon: string; family: string; progress: number; done: boolean };

export type ShowcaseData = {
  stats: { families: number; children: number; tasks: number; badges: number; challenges: number; coins: number; collectivesDone: number };
  champions: { daily: Champion[]; weekly: Champion[]; monthly: Champion[] };
  spotlight: { champion: Champion; quote: string; feats: string[] };
  families: FamilyAgg[];
  collectives: Collective[];
  activity: Activity[];
  challenges: Challenge[];
};

// مولّد عشوائي حتمي (mulberry32)
function rng(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BOYS = ["سالم", "فهد", "عبدالله", "يوسف", "خالد", "تركي", "ناصر", "محمد", "عمر", "بدر", "فيصل", "سعود", "ريان", "زياد", "أنس"];
const GIRLS = ["نورة", "ريم", "لمى", "جود", "سارة", "هند", "شهد", "رغد", "دانة", "العنود", "لين", "مها", "رهف", "وعد", "ميرا"];
const FAMILIES = ["الأمل", "النور", "السكينة", "الوفاء", "العزم", "البيان", "الإخلاص", "الهدى", "الفرقان", "الرشد", "السلام", "اليُسر", "الريادة", "البركة", "الصفا", "التقوى", "الإتقان", "النماء", "الرواد", "المستقبل"];
const AVATARS = ["🦊", "🐯", "🦁", "🐼", "🐨", "🐵", "🦄", "🐰", "🐶", "🐱", "🦉", "🐢", "🐧", "🦋", "🐝", "🦅", "🦌", "🐬", "🦚", "🐳"];

const LEVELS = [
  { key: "role_model", label: "قدوة", emoji: "👑", min: 3000 },
  { key: "fruitful", label: "مثمر", emoji: "🌳", min: 1500 },
  { key: "tree", label: "شجرة", emoji: "🌲", min: 700 },
  { key: "sprout", label: "نبتة", emoji: "🌿", min: 300 },
  { key: "seedling", label: "غرسة", emoji: "🌱", min: 100 },
  { key: "seed", label: "بذرة", emoji: "🌰", min: 0 },
];
function levelFor(xp: number) {
  const idx = LEVELS.findIndex((l) => xp >= l.min);
  const lvl = LEVELS[idx];
  const next = idx > 0 ? LEVELS[idx - 1].min : null;
  return { ...lvl, next };
}

export function getShowcaseData(): ShowcaseData {
  const rand = rng(20240601);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
  const between = (a: number, b: number) => a + Math.floor(rand() * (b - a + 1));

  const usedNames = new Set<string>();
  const uniqueName = (boy: boolean) => {
    for (let i = 0; i < 30; i++) {
      const n = pick(boy ? BOYS : GIRLS);
      if (!usedNames.has(n)) { usedNames.add(n); return n; }
    }
    return (boy ? "بطل" : "بطلة") + between(1, 99);
  };

  const champions: Champion[] = [];
  const families: FamilyAgg[] = [];
  let id = 1;

  for (let f = 0; f < 20; f++) {
    const famName = FAMILIES[f];
    const members = between(1, 3);
    let famXp = 0;
    for (let c = 0; c < members; c++) {
      const boy = rand() > 0.5;
      const total = between(120, 3400);
      const weekly = between(20, 640);
      const daily = between(2, 140);
      const ch: Champion = {
        id: id++,
        name: uniqueName(boy),
        family: famName,
        avatar: AVATARS[(id + f) % AVATARS.length],
        age: between(6, 16),
        total, weekly, daily,
        badges: between(0, 8),
        achievements: between(0, 6),
        streak: between(0, 21),
        level: levelFor(total),
      };
      champions.push(ch);
      famXp += total;
    }
    families.push({ name: famName, owner: "أبو " + pick(BOYS), members, totalXp: famXp, sinceMonths: between(1, 12) });
  }

  const byMonthly = [...champions].sort((a, b) => b.total - a.total);
  const byWeekly = [...champions].sort((a, b) => b.weekly - a.weekly);
  const byDaily = [...champions].sort((a, b) => b.daily - a.daily);

  const stats = {
    families: 20,
    children: champions.length,
    tasks: champions.reduce((s, c) => s + Math.round(c.total / 20), 0),
    badges: champions.reduce((s, c) => s + c.badges, 0),
    challenges: 34,
    coins: champions.reduce((s, c) => s + Math.round(c.total / 5), 0),
    collectivesDone: 3,
  };

  const top = byWeekly[0];
  const spotlight = {
    champion: top,
    quote: "كل يوم أحاول أكون أفضل من أمس — والقيمة قبل النقاط 🌟",
    feats: [
      `أكمل ${between(12, 28)} مهمة معتمدة هذا الأسبوع`,
      `حصل على شارة «الملتزم» و«المتعاون»`,
      `حافظ على ${top.streak} يومًا متتاليًا من الإنجاز`,
      `ساهم في تحدي الأسرة «محيط العائلة»`,
    ],
  };

  const collectives: Collective[] = [
    { title: "تحدي الالتزام الشهري", icon: "⏰", desc: "أكملوا مهام الالتزام معًا", target: 500, current: 500, reward: 80, status: "done", families: 18 },
    { title: "أسبوع الاحترام", icon: "🤝", desc: "مبادرات احترام موثّقة", target: 300, current: 216, reward: 60, status: "active", families: 15 },
    { title: "ماراثون القراءة", icon: "📚", desc: "دقائق قراءة تراكمية", target: 1000, current: 1000, reward: 100, status: "done", families: 20 },
    { title: "مبادرة التعاون الكبرى", icon: "💚", desc: "أعمال تعاون أسري", target: 400, current: 184, reward: 70, status: "active", families: 12 },
    { title: "تحدي النظافة والترتيب", icon: "✨", desc: "مهام تنظيم يومية", target: 250, current: 221, reward: 50, status: "active", families: 17 },
    { title: "شهر الإحسان", icon: "🌙", desc: "أعمال خير وعطاء", target: 600, current: 600, reward: 120, status: "done", families: 19 },
  ];

  const activity: Activity[] = [
    { icon: "✅", text: `اعتمد ولي أمر أسرة ${byDaily[2].family} مهمة لـ${byDaily[2].name}`, time: "قبل ٣ د", tone: "leaf" },
    { icon: "🏅", text: `حصل ${byWeekly[1].name} على شارة «المتعاون»`, time: "قبل ١١ د", tone: "joy" },
    { icon: "🎁", text: `فتح ${byDaily[0].name} الصندوق الرهيب 💎`, time: "قبل ٢٢ د", tone: "grape" },
    { icon: "🎯", text: `اقتربت أسرة ${families[4].name} من إكمال «أسبوع الاحترام»`, time: "قبل ٣٥ د", tone: "sky" },
    { icon: "⭐", text: `بلغ ${byMonthly[0].name} مستوى «قدوة»`, time: "قبل ساعة", tone: "joy" },
    { icon: "🚩", text: `أنشأت أسرة ${families[9].name} تحديًا عائليًا جديدًا`, time: "قبل ساعتين", tone: "bloom" },
    { icon: "🤝", text: `سجّلت أسرة ${families[1].name} مبادرة تعاون`, time: "اليوم", tone: "leaf" },
    { icon: "🌱", text: `انضمت أسرة ${families[18].name} إلى المنصة`, time: "اليوم", tone: "ghars" },
    { icon: "🏆", text: `تصدّر ${byWeekly[0].name} ترتيب الأبطال الأسبوعي`, time: "أمس", tone: "joy" },
    { icon: "📊", text: `أكملت أسرة ${families[6].name} تقريرها الأسبوعي`, time: "أمس", tone: "sky" },
    { icon: "💎", text: `حصل ${byMonthly[3].name} على ٣ شارات هذا الأسبوع`, time: "أمس", tone: "grape" },
    { icon: "🌙", text: `اكتمل تحدي «شهر الإحسان» بمشاركة ١٩ أسرة`, time: "قبل يومين", tone: "bloom" },
  ];

  const challenges: Challenge[] = [
    { title: "محيط العائلة", icon: "🤝", family: families[0].name, progress: 100, done: true },
    { title: "صباح النشاط", icon: "🌅", family: families[3].name, progress: 72, done: false },
    { title: "أبطال الترتيب", icon: "✨", family: families[7].name, progress: 88, done: false },
    { title: "أسبوع الصدق", icon: "💙", family: families[11].name, progress: 100, done: true },
    { title: "تحدي القراءة", icon: "📖", family: families[14].name, progress: 45, done: false },
    { title: "كنز التعاون", icon: "💎", family: families[2].name, progress: 60, done: false },
  ];

  return {
    stats,
    champions: { daily: byDaily, weekly: byWeekly, monthly: byMonthly },
    spotlight,
    families: [...families].sort((a, b) => b.totalXp - a.totalXp),
    collectives,
    activity,
    challenges,
  };
}

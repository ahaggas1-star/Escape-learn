// إعداد Supabase. تبقى متغيرات البيئة لها الأولوية؛ وعند غيابها نستخدم
// قيم مشروع العرض العامة (URL + publishable key) — وهي آمنة للواجهة بطبيعتها
// (مفتاح النشر عام، والحماية عبر Row Level Security). هذا يجعل النشر يعمل فورًا.
const DEMO_URL = "https://jbkdltstxugxbibniubb.supabase.co";
const DEMO_ANON_KEY = "sb_publishable_URwXch2GwEb3bpatFiSQXg_ZgMaPxT4";
const DEMO_SCHEMA = "ghars";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || DEMO_URL;
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEMO_ANON_KEY;
export const SUPABASE_DB_SCHEMA =
  process.env.NEXT_PUBLIC_SUPABASE_DB_SCHEMA || DEMO_SCHEMA;

// مهيأة دائمًا الآن (إما من البيئة أو قيم العرض العامة).
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

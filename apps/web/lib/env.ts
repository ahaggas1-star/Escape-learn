// قراءة متغيرات البيئة لـ Supabase مع رسالة واضحة عند غيابها.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// السكيمة في قاعدة البيانات. افتراضيًا public (لمشروع مخصّص)؛
// عند مشاركة مشروع Supabase قائم نعزل غرس في سكيمة ghars.
export const SUPABASE_DB_SCHEMA =
  process.env.NEXT_PUBLIC_SUPABASE_DB_SCHEMA ?? "public";

// هل أُعدّت Supabase؟ نستخدمها لإظهار شاشة إعداد بدل الانهيار أثناء التطوير.
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

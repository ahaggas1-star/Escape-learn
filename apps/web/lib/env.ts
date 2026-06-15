// قراءة متغيرات البيئة لـ Supabase مع رسالة واضحة عند غيابها.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// هل أُعدّت Supabase؟ نستخدمها لإظهار شاشة إعداد بدل الانهيار أثناء التطوير.
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieToSet = { name: string; value: string; options?: CookieOptions };
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";

// عميل Supabase لمكوّنات الخادم وServer Actions (يقرأ/يكتب الكوكيز).
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // يُستدعى من Server Component — يتولى middleware تحديث الجلسة.
        }
      },
    },
  });
}

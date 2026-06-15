import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

import { SUPABASE_ANON_KEY, SUPABASE_DB_SCHEMA, SUPABASE_URL } from "@/lib/env";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

// عميل Supabase لمكوّنات الخادم وServer Actions (يقرأ/يكتب الكوكيز).
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    db: { schema: SUPABASE_DB_SCHEMA },
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

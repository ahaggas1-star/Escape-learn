"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_DB_SCHEMA, SUPABASE_URL } from "@/lib/env";

// عميل Supabase للمتصفح (مكوّنات العميل).
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    db: { schema: SUPABASE_DB_SCHEMA },
  });
}

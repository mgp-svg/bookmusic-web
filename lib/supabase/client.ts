"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Browser client. Only ever uses the anon key — RLS plus SECURITY DEFINER RPCs enforce every rule. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

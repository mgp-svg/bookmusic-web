import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/** Anonymous, cookie-less client for public surfaces (sitemap, OG images) where there is
 *  no signed-in user to represent. Everything it can read is public by RLS anyway. */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}

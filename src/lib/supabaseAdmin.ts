import { createClient } from "@supabase/supabase-js";

// Cliente server-side com service role — bypassa RLS, NUNCA use no browser
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

import "./apenas-servidor";
import { getSupabaseAdmin } from "./supabaseAdmin";

export function db() {
  return getSupabaseAdmin();
}

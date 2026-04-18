import { env, isSupabaseConfigured } from "@/lib/env";

export function getSupabaseCredentialsOrThrow() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
  return {
    url: env.supabaseUrl,
    anonKey: env.supabaseAnonKey,
  };
}


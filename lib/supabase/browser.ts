"use client";

import { createBrowserClient } from "@supabase/ssr";

import { Database } from "@/lib/db/database.types";
import { getSupabaseCredentialsOrThrow } from "@/lib/supabase/config";

export function createSupabaseBrowserClient() {
  const { url, anonKey } = getSupabaseCredentialsOrThrow();
  return createBrowserClient<Database>(url, anonKey);
}


import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AuthenticatedContext {
  userId: string;
  email: string;
}

export async function requireAuthenticatedUser(): Promise<AuthenticatedContext> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return {
    userId: user.id,
    email: user.email ?? "",
  };
}

export async function requireAdminUser(): Promise<AuthenticatedContext> {
  const base = await requireAuthenticatedUser();
  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", base.userId).maybeSingle();
  const profileRole = (profile as { role?: string } | null)?.role;

  if (profileRole !== "admin") {
    redirect("/dashboard?forbidden=1");
  }

  return base;
}

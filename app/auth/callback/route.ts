import { NextRequest, NextResponse } from "next/server";

import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/dashboard";
  redirectUrl.search = "";

  if (!isSupabaseConfigured()) {
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("error", "Supabase is not configured.");
    return NextResponse.redirect(redirectUrl);
  }

  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("error", "Missing auth code.");
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("error", error.message);
  }

  return NextResponse.redirect(redirectUrl);
}


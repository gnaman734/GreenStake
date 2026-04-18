import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth/request-auth";
import { getAdminStats } from "@/lib/repositories/admin-repository";

export async function GET() {
  const auth = await requireApiUser();
  if ("error" in auth) {
    return auth.error;
  }

  const { data: profile, error: profileError } = await auth.supabase
    .from("profiles")
    .select("role")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }
  const profileRole = (profile as { role?: string } | null)?.role;
  if (profileRole !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const stats = await getAdminStats(auth.supabase);
    return NextResponse.json({ stats });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to fetch admin stats." },
      { status: 400 },
    );
  }
}

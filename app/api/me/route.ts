import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth/request-auth";
import { getProfileByUserId } from "@/lib/repositories/profile-repository";
import { getLatestSubscriptionForUser } from "@/lib/repositories/subscription-repository";

export async function GET() {
  const auth = await requireApiUser();
  if ("error" in auth) {
    return auth.error;
  }

  try {
    const [profile, subscription] = await Promise.all([
      getProfileByUserId(auth.supabase, auth.user.id),
      getLatestSubscriptionForUser(auth.supabase, auth.user.id),
    ]);

    return NextResponse.json({
      user: {
        id: auth.user.id,
        email: auth.user.email,
      },
      profile,
      subscription,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to fetch user context." },
      { status: 400 },
    );
  }
}


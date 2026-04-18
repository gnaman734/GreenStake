import { NextRequest, NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth/request-auth";
import { createScoreForUser, listScoresForUser } from "@/lib/repositories/score-repository";
import { scoreInputSchema } from "@/lib/scoring/schemas";

export async function GET() {
  const auth = await requireApiUser();
  if ("error" in auth) {
    return auth.error;
  }

  try {
    const scores = await listScoresForUser(auth.supabase, auth.user.id);
    return NextResponse.json({ scores });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to fetch scores." }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser();
  if ("error" in auth) {
    return auth.error;
  }

  try {
    const payload = scoreInputSchema.parse(await request.json());
    const scores = await createScoreForUser(auth.supabase, auth.user.id, payload);
    return NextResponse.json({ scores });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create score." }, { status: 400 });
  }
}


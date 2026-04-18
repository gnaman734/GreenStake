import { NextRequest, NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth/request-auth";
import { deleteScoreForUser, updateScoreForUser } from "@/lib/repositories/score-repository";
import { scoreInputSchema } from "@/lib/scoring/schemas";

interface RouteContext {
  params: Promise<{ scoreId: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireApiUser();
  if ("error" in auth) {
    return auth.error;
  }

  try {
    const { scoreId } = await context.params;
    const payload = scoreInputSchema.parse(await request.json());
    const scores = await updateScoreForUser(auth.supabase, auth.user.id, scoreId, payload);
    return NextResponse.json({ scores });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update score." }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const auth = await requireApiUser();
  if ("error" in auth) {
    return auth.error;
  }

  try {
    const { scoreId } = await context.params;
    const scores = await deleteScoreForUser(auth.supabase, auth.user.id, scoreId);
    return NextResponse.json({ scores });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete score." }, { status: 400 });
  }
}


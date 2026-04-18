import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import { requireApiUser } from "@/lib/auth/request-auth";
import { runDrawSimulation } from "@/lib/draws/engine";

const simulationInputSchema = z.object({
  mode: z.enum(["random", "weighted"]).default("random"),
  basePrizePoolInr: z.number().int().min(0),
  jackpotRolloverInr: z.number().int().min(0).default(0),
});

type ScoreRow = {
  user_id: string;
  stableford_score: number;
  played_on: string;
};

function latestFiveNumbersByUser(scores: ScoreRow[]) {
  const grouped = new Map<string, ScoreRow[]>();
  scores.forEach((score) => {
    const existing = grouped.get(score.user_id) ?? [];
    existing.push(score);
    grouped.set(score.user_id, existing);
  });

  const mapped: Record<string, number[]> = {};
  grouped.forEach((userScores, userId) => {
    mapped[userId] = userScores
      .sort((left, right) => right.played_on.localeCompare(left.played_on))
      .slice(0, 5)
      .map((item) => item.stableford_score);
  });
  return mapped;
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser();
  if ("error" in auth) {
    return auth.error;
  }

  const { data: profile } = await auth.supabase.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
  const profileRole = (profile as { role?: string } | null)?.role;
  if (profileRole !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const input = simulationInputSchema.parse(await request.json());

    const { data: activeSubscriptions, error: subsError } = await auth.supabase
      .from("subscriptions")
      .select("user_id")
      .eq("status", "active");
    if (subsError) throw new Error(subsError.message);

    const activeRows = (activeSubscriptions ?? []) as { user_id: string }[];
    const activeUserIds = [...new Set(activeRows.map((row) => row.user_id))];
    if (activeUserIds.length === 0) {
      return NextResponse.json({
        simulation: runDrawSimulation({
          mode: input.mode,
          basePrizePoolInr: input.basePrizePoolInr,
          jackpotRolloverInr: input.jackpotRolloverInr,
          userNumbers: {},
        }),
      });
    }

    const { data: scores, error: scoresError } = await auth.supabase
      .from("score_entries")
      .select("user_id, stableford_score, played_on")
      .in("user_id", activeUserIds);
    if (scoresError) throw new Error(scoresError.message);

    const userNumbers = latestFiveNumbersByUser((scores ?? []) as ScoreRow[]);

    return NextResponse.json({
      simulation: runDrawSimulation({
        mode: input.mode,
        basePrizePoolInr: input.basePrizePoolInr,
        jackpotRolloverInr: input.jackpotRolloverInr,
        userNumbers,
      }),
      participantCount: Object.keys(userNumbers).length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to run draw simulation." },
      { status: 400 },
    );
  }
}

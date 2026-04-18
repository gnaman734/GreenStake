import { SupabaseClient } from "@supabase/supabase-js";

import { Database } from "@/lib/db/database.types";

type DbClient = SupabaseClient<Database>;

export interface ScoreRecord {
  id: string;
  date: string;
  stablefordScore: number;
  createdAt: string;
  updatedAt: string;
}

function mapScore(row: Database["public"]["Tables"]["score_entries"]["Row"]): ScoreRecord {
  return {
    id: row.id,
    date: row.played_on,
    stablefordScore: row.stableford_score,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listScoresForUser(client: DbClient, userId: string): Promise<ScoreRecord[]> {
  const { data, error } = await client
    .from("score_entries")
    .select("*")
    .eq("user_id", userId)
    .order("played_on", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []).map(mapScore);
}

export async function createScoreForUser(
  client: DbClient,
  userId: string,
  input: { date: string; stablefordScore: number },
): Promise<ScoreRecord[]> {
  const { error } = await client.from("score_entries").insert({
    user_id: userId,
    played_on: input.date,
    stableford_score: input.stablefordScore,
  });

  if (error) {
    throw new Error(error.message);
  }

  return listScoresForUser(client, userId);
}

export async function updateScoreForUser(
  client: DbClient,
  userId: string,
  scoreId: string,
  input: { date: string; stablefordScore: number },
): Promise<ScoreRecord[]> {
  const { error } = await client
    .from("score_entries")
    .update({
      played_on: input.date,
      stableford_score: input.stablefordScore,
    })
    .eq("id", scoreId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return listScoresForUser(client, userId);
}

export async function deleteScoreForUser(client: DbClient, userId: string, scoreId: string): Promise<ScoreRecord[]> {
  const { error } = await client.from("score_entries").delete().eq("id", scoreId).eq("user_id", userId);
  if (error) {
    throw new Error(error.message);
  }
  return listScoresForUser(client, userId);
}


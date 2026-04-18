import { SupabaseClient } from "@supabase/supabase-js";

import { Database } from "@/lib/db/database.types";

type DbClient = SupabaseClient<Database>;

export interface ProfileRecord {
  id: string;
  email: string;
  fullName: string;
  role: "subscriber" | "admin";
  charityPercent: number;
  selectedCharityId: string | null;
}

function mapProfile(row: Database["public"]["Tables"]["profiles"]["Row"]): ProfileRecord {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    charityPercent: row.charity_percent,
    selectedCharityId: row.selected_charity_id,
  };
}

export async function getProfileByUserId(client: DbClient, userId: string): Promise<ProfileRecord | null> {
  const { data, error } = await client.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data ? mapProfile(data) : null;
}

export async function updateProfilePreferences(
  client: DbClient,
  userId: string,
  input: {
    selectedCharityId?: string | null;
    charityPercent?: number;
  },
): Promise<ProfileRecord> {
  const { data, error } = await client
    .from("profiles")
    .update({
      selected_charity_id: input.selectedCharityId,
      charity_percent: input.charityPercent,
    })
    .eq("id", userId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return mapProfile(data);
}


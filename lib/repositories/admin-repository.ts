import { SupabaseClient } from "@supabase/supabase-js";

import { Database } from "@/lib/db/database.types";

type DbClient = SupabaseClient<Database>;

export interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalPrizePoolInr: number;
  charityContributionInr: number;
  drawEntriesThisMonth: number;
}

function firstDayOfCurrentMonth(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10);
}

export async function getAdminStats(client: DbClient): Promise<AdminStats> {
  const [{ count: totalUsers, error: usersError }, { count: activeSubscriptions, error: subscriptionsError }] =
    await Promise.all([
      client.from("profiles").select("id", { count: "exact", head: true }),
      client.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
    ]);

  if (usersError) throw new Error(usersError.message);
  if (subscriptionsError) throw new Error(subscriptionsError.message);

  const [{ data: subscriptions, error: subscriptionAmountError }, { data: draws, error: drawsError }] = await Promise.all([
    client.from("subscriptions").select("charity_contribution_inr"),
    client.from("draws").select("prize_pool_total_inr"),
  ]);

  if (subscriptionAmountError) throw new Error(subscriptionAmountError.message);
  if (drawsError) throw new Error(drawsError.message);

  const subscriptionRows = (subscriptions ?? []) as { charity_contribution_inr: number }[];
  const drawRows = (draws ?? []) as { prize_pool_total_inr: number }[];

  const charityContributionInr = subscriptionRows.reduce(
    (sum, row) => sum + row.charity_contribution_inr,
    0,
  );
  const totalPrizePoolInr = drawRows.reduce((sum, row) => sum + row.prize_pool_total_inr, 0);

  const startOfMonth = firstDayOfCurrentMonth();
  const { data: thisMonthDraws, error: thisMonthDrawsError } = await client
    .from("draws")
    .select("id")
    .gte("month_key", startOfMonth);

  if (thisMonthDrawsError) throw new Error(thisMonthDrawsError.message);

  const drawIds = ((thisMonthDraws ?? []) as { id: string }[]).map((row) => row.id);
  let drawEntriesThisMonth = 0;
  if (drawIds.length > 0) {
    const { count, error } = await client
      .from("draw_entries")
      .select("id", { count: "exact", head: true })
      .in("draw_id", drawIds);
    if (error) throw new Error(error.message);
    drawEntriesThisMonth = count ?? 0;
  }

  return {
    totalUsers: totalUsers ?? 0,
    activeSubscriptions: activeSubscriptions ?? 0,
    totalPrizePoolInr,
    charityContributionInr,
    drawEntriesThisMonth,
  };
}

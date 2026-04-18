import { SupabaseClient } from "@supabase/supabase-js";

import { Database } from "@/lib/db/database.types";
import { SubscriptionPlan } from "@/lib/domain/types";

type DbClient = SupabaseClient<Database>;

export interface SubscriptionRecord {
  id: string;
  userId: string;
  planCode: string;
  billingCycleMonths: number;
  status: "pending" | "active" | "lapsed" | "cancelled";
  gateway: string;
  gatewayReference: string | null;
  amountInr: number;
  charityContributionInr: number;
  renewalDate: string | null;
  startedAt: string | null;
  createdAt: string;
}

function mapSubscription(row: Database["public"]["Tables"]["subscriptions"]["Row"]): SubscriptionRecord {
  return {
    id: row.id,
    userId: row.user_id,
    planCode: row.plan_code,
    billingCycleMonths: row.billing_cycle_months,
    status: row.status,
    gateway: row.gateway,
    gatewayReference: row.gateway_reference,
    amountInr: row.amount_inr,
    charityContributionInr: row.charity_contribution_inr,
    renewalDate: row.renewal_date,
    startedAt: row.started_at,
    createdAt: row.created_at,
  };
}

export async function createPendingSubscription(
  client: DbClient,
  input: {
    userId: string;
    plan: SubscriptionPlan;
    gateway: string;
    gatewayReference: string;
    charityPercent: number;
  },
): Promise<SubscriptionRecord> {
  const charityContributionInr = Math.ceil((input.plan.priceInr * input.charityPercent) / 100);

  const { data, error } = await client
    .from("subscriptions")
    .insert({
      user_id: input.userId,
      plan_code: input.plan.code,
      status: "pending",
      gateway: input.gateway,
      gateway_reference: input.gatewayReference,
      amount_inr: input.plan.priceInr,
      billing_cycle_months: input.plan.billingCycleMonths,
      charity_contribution_inr: charityContributionInr,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapSubscription(data);
}

export async function markSubscriptionActiveByReference(
  client: DbClient,
  input: {
    gateway: string;
    gatewayReference: string;
    renewalDate: string;
  },
): Promise<void> {
  const { error } = await client
    .from("subscriptions")
    .update({
      status: "active",
      started_at: new Date().toISOString(),
      renewal_date: input.renewalDate,
    })
    .eq("gateway", input.gateway)
    .eq("gateway_reference", input.gatewayReference);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getSubscriptionByGatewayReference(
  client: DbClient,
  input: {
    gateway: string;
    gatewayReference: string;
  },
): Promise<SubscriptionRecord | null> {
  const { data, error } = await client
    .from("subscriptions")
    .select("*")
    .eq("gateway", input.gateway)
    .eq("gateway_reference", input.gatewayReference)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  return data ? mapSubscription(data) : null;
}

export async function getLatestSubscriptionForUser(client: DbClient, userId: string): Promise<SubscriptionRecord | null> {
  const { data, error } = await client
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  return data ? mapSubscription(data) : null;
}

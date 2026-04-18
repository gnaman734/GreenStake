import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { getCharityById } from "@/lib/charities/repository";
import { SubscriptionPlanCode } from "@/lib/domain/types";
import { isSupabaseConfigured } from "@/lib/env";
import { createCheckoutSessionWithFallback } from "@/lib/payments/service";
import { updateProfilePreferences } from "@/lib/repositories/profile-repository";
import {
  createPendingSubscription,
  getLatestSubscriptionForUser,
  markSubscriptionActiveByReference,
} from "@/lib/repositories/subscription-repository";
import { getPlanOrThrow } from "@/lib/subscriptions/plans";

interface CheckoutPayload {
  email: string;
  planCode: SubscriptionPlanCode;
  charityId: string;
  charityPercent: number;
}

function parsePayload(body: unknown): CheckoutPayload {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid payload.");
  }

  const typedBody = body as Partial<CheckoutPayload>;
  const email = typedBody.email?.trim();
  const planCode = typedBody.planCode;
  const charityId = typedBody.charityId?.trim();
  const charityPercent = Number(typedBody.charityPercent);

  if (!email || !email.includes("@")) {
    throw new Error("A valid email is required.");
  }
  if (!planCode || (planCode !== "monthly" && planCode !== "yearly")) {
    throw new Error("Invalid plan.");
  }
  if (!charityId || !getCharityById(charityId)) {
    throw new Error("Please select a valid charity.");
  }
  if (!Number.isFinite(charityPercent) || charityPercent < 10 || charityPercent > 80) {
    throw new Error("Charity percentage must be between 10 and 80.");
  }

  getPlanOrThrow(planCode);

  return {
    email,
    planCode,
    charityId,
    charityPercent,
  };
}

function renewalDateFromNow(months: number): string {
  const next = new Date();
  next.setMonth(next.getMonth() + months);
  return next.toISOString().slice(0, 10);
}

export async function POST(request: NextRequest) {
  try {
    const payload = parsePayload(await request.json());
    const origin = request.headers.get("origin") ?? new URL(request.url).origin;
    const plan = getPlanOrThrow(payload.planCode);

    const session = await createCheckoutSessionWithFallback({
      ...payload,
      successUrl: `${origin}/dashboard?checkout=success`,
      cancelUrl: `${origin}/subscribe?checkout=cancelled`,
    });

    if (isSupabaseConfigured()) {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Please login before starting checkout." }, { status: 401 });
      }

      await createPendingSubscription(supabase, {
        userId: user.id,
        plan,
        gateway: session.provider,
        gatewayReference: session.paymentReference,
        charityPercent: payload.charityPercent,
      });

      if (session.provider === "mock") {
        await markSubscriptionActiveByReference(supabase, {
          gateway: session.provider,
          gatewayReference: session.paymentReference,
          renewalDate: renewalDateFromNow(plan.billingCycleMonths),
        });
      }

      await updateProfilePreferences(supabase, user.id, {
        selectedCharityId: payload.charityId,
        charityPercent: payload.charityPercent,
      });

      const latest = await getLatestSubscriptionForUser(supabase, user.id);
      return NextResponse.json({
        ...session,
        subscription: latest,
      });
    }

    return NextResponse.json(session);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to create checkout session.",
      },
      { status: 400 },
    );
  }
}

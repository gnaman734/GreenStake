import { NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";
import { verifyRazorpayWebhookSignature } from "@/lib/payments/providers/razorpay-provider";
import {
  getSubscriptionByGatewayReference,
  markSubscriptionActiveByReference,
} from "@/lib/repositories/subscription-repository";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

function addMonths(date: Date, months: number): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

export async function POST(request: NextRequest) {
  if (!env.razorpayWebhookSecret) {
    return NextResponse.json(
      { error: "Razorpay webhook secret is not configured for this environment." },
      { status: 501 },
    );
  }

  const signature = request.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Razorpay signature header." }, { status: 400 });
  }

  const rawBody = await request.text();
  const isValid = verifyRazorpayWebhookSignature(rawBody, signature);
  if (!isValid) {
    return NextResponse.json({ error: "Webhook signature verification failed." }, { status: 400 });
  }

  const event = JSON.parse(rawBody) as {
    event?: string;
    payload?: {
      payment_link?: { entity?: { id?: string } };
      payment?: { entity?: { notes?: Record<string, string> } };
    };
  };

  if (event.event !== "payment_link.paid") {
    return NextResponse.json({
      received: true,
      ignored: true,
      eventType: event.event ?? "unknown",
    });
  }

  const paymentLinkId =
    event.payload?.payment_link?.entity?.id ?? event.payload?.payment?.entity?.notes?.payment_link_id ?? "";

  if (!paymentLinkId) {
    return NextResponse.json({ received: true, ignored: true, reason: "Payment link id missing." });
  }

  try {
    const supabase = createSupabaseServiceRoleClient();
    const subscription = await getSubscriptionByGatewayReference(supabase, {
      gateway: "razorpay",
      gatewayReference: paymentLinkId,
    });

    if (!subscription) {
      return NextResponse.json({
        received: true,
        ignored: true,
        reason: "No matching subscription for payment link.",
      });
    }

    const renewalDate = addMonths(new Date(), subscription.billingCycleMonths).toISOString().slice(0, 10);
    await markSubscriptionActiveByReference(supabase, {
      gateway: "razorpay",
      gatewayReference: paymentLinkId,
      renewalDate,
    });

    return NextResponse.json({ received: true, activated: true, gatewayReference: paymentLinkId });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to activate subscription.",
      },
      { status: 400 },
    );
  }
}


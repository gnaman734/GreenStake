import { createHmac, timingSafeEqual } from "crypto";

import { env } from "@/lib/env";
import { CheckoutSessionInput, CheckoutSessionResult, PaymentProvider } from "@/lib/payments/types";
import { getPlanOrThrow } from "@/lib/subscriptions/plans";

export class RazorpayPaymentProvider implements PaymentProvider {
  readonly name = "razorpay" as const;

  async createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutSessionResult> {
    if (!env.razorpayKeyId || !env.razorpayKeySecret) {
      throw new Error("Razorpay keys are not configured.");
    }

    const plan = getPlanOrThrow(input.planCode);
    const auth = Buffer.from(`${env.razorpayKeyId}:${env.razorpayKeySecret}`).toString("base64");

    const response = await fetch("https://api.razorpay.com/v1/payment_links", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: plan.priceInr * 100,
        currency: "INR",
        accept_partial: false,
        description: `${plan.label} subscription`,
        customer: {
          email: input.email,
        },
        notify: {
          sms: false,
          email: true,
        },
        notes: {
          charity_id: input.charityId,
          charity_percent: String(input.charityPercent),
          plan_code: input.planCode,
        },
        callback_url: input.successUrl,
        callback_method: "get",
      }),
      cache: "no-store",
    });

    const payload = (await response.json()) as {
      id?: string;
      short_url?: string;
      error?: { description?: string };
    };

    if (!response.ok || !payload.id || !payload.short_url) {
      throw new Error(payload.error?.description ?? "Razorpay payment link creation failed.");
    }

    return {
      provider: this.name,
      mode: "redirect",
      sessionId: payload.id,
      checkoutUrl: payload.short_url,
      paymentReference: payload.id,
      fallbackUsed: false,
    };
  }
}

export function verifyRazorpayWebhookSignature(rawBody: string, signatureHeader: string): boolean {
  if (!env.razorpayWebhookSecret) {
    return false;
  }

  const expectedSignature = createHmac("sha256", env.razorpayWebhookSecret).update(rawBody).digest("hex");
  const expected = Buffer.from(expectedSignature);
  const actual = Buffer.from(signatureHeader);

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}

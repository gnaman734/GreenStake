import { SubscriptionPlanCode } from "@/lib/domain/types";

export type PaymentProviderName = "razorpay" | "mock";

export interface CheckoutSessionInput {
  email: string;
  planCode: SubscriptionPlanCode;
  charityId: string;
  charityPercent: number;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResult {
  provider: PaymentProviderName;
  mode: "redirect" | "manual";
  sessionId?: string;
  checkoutUrl?: string;
  paymentReference: string;
  fallbackUsed: boolean;
  fallbackReason?: string;
}

export interface PaymentProvider {
  readonly name: PaymentProviderName;
  createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutSessionResult>;
}

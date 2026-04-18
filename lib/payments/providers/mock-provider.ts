import { CheckoutSessionInput, CheckoutSessionResult, PaymentProvider } from "@/lib/payments/types";

function randomId(): string {
  if (typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock" as const;

  async createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutSessionResult> {
    const paymentReference = `mock_${randomId()}`;
    const checkoutUrl = `${input.successUrl}?mockPayment=1&ref=${paymentReference}`;

    return {
      provider: this.name,
      mode: "redirect",
      checkoutUrl,
      paymentReference,
      fallbackUsed: false,
    };
  }
}

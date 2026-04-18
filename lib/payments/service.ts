import { getFallbackPaymentProvider, getPrimaryPaymentProvider } from "@/lib/payments/provider-factory";
import { MockPaymentProvider } from "@/lib/payments/providers/mock-provider";
import { CheckoutSessionInput, CheckoutSessionResult } from "@/lib/payments/types";

export async function createCheckoutSessionWithFallback(
  input: CheckoutSessionInput,
): Promise<CheckoutSessionResult> {
  const primaryProvider = getPrimaryPaymentProvider();
  const fallbackProvider = getFallbackPaymentProvider();

  try {
    return await primaryProvider.createCheckoutSession(input);
  } catch (error) {
    if (primaryProvider.name === fallbackProvider.name) {
      if (primaryProvider.name === "mock") {
        throw error;
      }

      const lastResortProvider = new MockPaymentProvider();
      const lastResortResult = await lastResortProvider.createCheckoutSession(input);
      return {
        ...lastResortResult,
        fallbackUsed: true,
        fallbackReason: error instanceof Error ? error.message : "Unknown primary gateway failure",
      };
    }

    const result = await fallbackProvider.createCheckoutSession(input);
    return {
      ...result,
      fallbackUsed: true,
      fallbackReason: error instanceof Error ? error.message : "Unknown primary gateway failure",
    };
  }
}

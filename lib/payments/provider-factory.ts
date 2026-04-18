import { env } from "@/lib/env";
import { MockPaymentProvider } from "@/lib/payments/providers/mock-provider";
import { RazorpayPaymentProvider } from "@/lib/payments/providers/razorpay-provider";
import { PaymentProvider } from "@/lib/payments/types";

export function getPrimaryPaymentProvider(): PaymentProvider {
  if (env.paymentProvider === "mock") {
    return new MockPaymentProvider();
  }

  if (env.paymentProvider === "razorpay") {
    return new RazorpayPaymentProvider();
  }

  if (env.razorpayKeyId && env.razorpayKeySecret) {
    return new RazorpayPaymentProvider();
  }

  return new MockPaymentProvider();
}

export function getFallbackPaymentProvider(): PaymentProvider {
  if (env.fallbackPaymentProvider === "razorpay") {
    return new RazorpayPaymentProvider();
  }
  return new MockPaymentProvider();
}

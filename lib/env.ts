type PaymentProviderName = "auto" | "razorpay" | "mock";

function getNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "GreenStake",
  sessionDays: getNumber(process.env.SESSION_DAYS, 7),
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  paymentProvider: (process.env.PAYMENT_PROVIDER ?? "auto") as PaymentProviderName,
  fallbackPaymentProvider: (process.env.PAYMENT_FALLBACK_PROVIDER ??
    "mock") as Exclude<PaymentProviderName, "auto">,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID ?? "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET ?? "",
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET ?? "",
};

export function isSupabaseConfigured(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

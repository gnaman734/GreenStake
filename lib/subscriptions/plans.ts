import { SubscriptionPlan, SubscriptionPlanCode } from "@/lib/domain/types";

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    code: "monthly",
    label: "Monthly Impact",
    priceInr: 1200,
    billingCycleMonths: 1,
  },
  {
    code: "yearly",
    label: "Yearly Impact",
    priceInr: 12000,
    billingCycleMonths: 12,
    discountLabel: "Save 17%",
  },
];

export function getPlanOrThrow(planCode: SubscriptionPlanCode): SubscriptionPlan {
  const plan = SUBSCRIPTION_PLANS.find((item) => item.code === planCode);
  if (!plan) {
    throw new Error(`Unsupported subscription plan: ${planCode}`);
  }
  return plan;
}


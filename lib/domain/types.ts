export type SubscriptionPlanCode = "monthly" | "yearly";

export type SubscriptionStatus = "active" | "inactive" | "lapsed" | "cancelled";

export type DrawMatchTier = "match_5" | "match_4" | "match_3";

export interface Charity {
  id: string;
  name: string;
  description: string;
  heroImage: string;
  tags: string[];
  upcomingEvent?: string;
  isFeatured?: boolean;
}

export interface SubscriptionPlan {
  code: SubscriptionPlanCode;
  label: string;
  priceInr: number;
  billingCycleMonths: 1 | 12;
  discountLabel?: string;
}

export interface ScoreEntry {
  id: string;
  date: string; // YYYY-MM-DD
  stablefordScore: number; // 1-45
  createdAt: string;
  updatedAt: string;
}

export interface SubscriberProfile {
  id: string;
  email: string;
  fullName: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan?: SubscriptionPlanCode;
  renewalDate?: string;
  charityId?: string;
  charityPercent: number;
}


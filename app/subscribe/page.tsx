import Link from "next/link";

import { SubscribeForm } from "@/components/SubscribeForm";
import { listCharities } from "@/lib/charities/repository";
import { SUBSCRIPTION_PLANS } from "@/lib/subscriptions/plans";

export default function SubscribePage() {
  const charities = listCharities();

  return (
    <main className="page narrow">
      <header className="page-header">
        <p className="eyebrow">Subscription Setup</p>
        <h1>Start your impact subscription</h1>
        <p>
          Checkout now runs on Razorpay as the primary gateway with a mock fallback so onboarding never blocks.
        </p>
        <p className="helper">For production mode, subscriptions are linked to your authenticated Supabase profile.</p>
      </header>

      <SubscribeForm plans={SUBSCRIPTION_PLANS} charities={charities} />

      <p className="helper">
        Already subscribed? <Link href="/dashboard">Go to dashboard</Link>
      </p>
    </main>
  );
}

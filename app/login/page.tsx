import { Suspense } from "react";

import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="page narrow">
      <header className="page-header">
        <p className="eyebrow">Welcome Back</p>
        <h1>Login to your GreenStake account</h1>
        <p>Access your score history, monthly draws, subscriptions, and impact dashboard.</p>
      </header>
      <Suspense fallback={<p className="helper">Loading login form...</p>}>
        <AuthForm mode="login" />
      </Suspense>
    </main>
  );
}

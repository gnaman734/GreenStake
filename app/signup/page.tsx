import { Suspense } from "react";

import { AuthForm } from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <main className="page narrow">
      <header className="page-header">
        <p className="eyebrow">Get Started</p>
        <h1>Create your subscriber account</h1>
        <p>Join monthly draws, track your last 5 Stableford rounds, and support your selected charity.</p>
      </header>
      <Suspense fallback={<p className="helper">Loading signup form...</p>}>
        <AuthForm mode="signup" />
      </Suspense>
    </main>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthMode = "login" | "signup";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(() => searchParams.get("next") ?? "/dashboard", [searchParams]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(searchParams.get("error"));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      const supabase = createSupabaseBrowserClient();

      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName }, emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (signUpError) throw signUpError;
        setInfo("Signup successful! You can now sign in.");
        router.push("/login");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      router.push(nextPath);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  const isSignup = mode === "signup";

  return (
    <div className="auth-layout">
      <div className="auth-artwork">
        <div className="auth-artwork-inner">
          <Image src="/logo.png" alt="GreenStake" width={80} height={80} style={{ borderRadius: "var(--r-lg)" }} />
          <h2 style={{ marginTop: "1.5rem", fontSize: "1.6rem" }}>GreenStake</h2>
          <p style={{ maxWidth: "26ch", textAlign: "center", marginTop: "0.5rem", fontSize: "0.88rem", color: "rgba(244,247,240,0.55)" }}>
            {isSignup ? "Join the community. Play, give, and win together." : "Welcome back. Your impact awaits."}
          </p>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-wrapper">
          <div style={{ marginBottom: "1.5rem" }}>
            <h2>{isSignup ? "Create your account" : "Welcome back"}</h2>
            <p className="text-muted" style={{ marginTop: "0.25rem", fontSize: "0.88rem" }}>
              {isSignup ? "Start your journey with GreenStake" : "Sign in to your GreenStake account"}
            </p>
          </div>

          <form className="form-glass" onSubmit={handleSubmit}>
            {isSignup ? (
              <label>Full Name <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required /></label>
            ) : null}
            <label>Email <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></label>
            <label>Password <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 characters" minLength={6} required /></label>

            {error ? <p className="error">{error}</p> : null}
            {info ? <p className="info">{info}</p> : null}

            <button type="submit" disabled={loading}>
              {loading ? "Please wait..." : isSignup ? "Create Account" : "Sign In"}
            </button>

            <p className="helper" style={{ textAlign: "center" }}>
              {isSignup ? (
                <>Already have an account? <Link href="/login" className="inline-link">Sign in</Link></>
              ) : (
                <>New here? <Link href="/signup" className="inline-link">Create an account</Link></>
              )}
            </p>
          </form>
        </div>
      </div>

      <style>{`
        .auth-layout { display: grid; grid-template-columns: 1fr 1fr; min-height: calc(100vh - var(--nav-h)); }
        .auth-artwork {
          display: flex; align-items: center; justify-content: center;
          background: var(--grad-hero); color: #f4f7f0; padding: 2rem;
          border-right: 1px solid var(--border-light);
        }
        .auth-artwork-inner { display: flex; flex-direction: column; align-items: center; }
        .auth-artwork h2 { color: #f4f7f0; }
        .auth-form-side { display: flex; align-items: center; justify-content: center; padding: 2rem; }
        .auth-form-wrapper { max-width: 400px; width: 100%; }
        @media (max-width: 768px) {
          .auth-layout { grid-template-columns: 1fr; }
          .auth-artwork { display: none; }
        }
      `}</style>
    </div>
  );
}

"use client";

import { FormEvent, useMemo, useState, useEffect } from "react";
import { Charity, SubscriptionPlan } from "@/lib/domain/types";

interface SubscribeFormProps { plans: SubscriptionPlan[]; charities: Charity[]; }
interface CheckoutApiResult { checkoutUrl?: string; provider: string; fallbackUsed: boolean; fallbackReason?: string; }

export function SubscribeForm({ plans, charities }: SubscribeFormProps) {
  const [email, setEmail] = useState("");
  const [planCode, setPlanCode] = useState(plans[0]?.code ?? "monthly");
  const [charityId, setCharityId] = useState(charities[0]?.id ?? "");
  const [charityPercent, setCharityPercent] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const selectedPlan = useMemo(() => plans.find((p) => p.code === planCode), [planCode, plans]);
  const selectedCharity = useMemo(() => charities.find((c) => c.id === charityId), [charityId, charities]);

  useEffect(() => {
    let m = true;
    async function load() {
      try {
        const r = await fetch("/api/me", { cache: "no-store" });
        if (!r.ok || !m) return;
        const d = (await r.json()) as { user?: { email?: string } };
        if (d.user?.email) setEmail(d.user.email);
      } catch {}
    }
    void load();
    return () => { m = false; };
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setError(null); setInfo(null);
    try {
      const r = await fetch("/api/subscriptions/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, planCode, charityId, charityPercent }),
      });
      const result = (await r.json()) as CheckoutApiResult & { error?: string };
      if (!r.ok) throw new Error(result.error ?? "Checkout failed.");
      if (result.fallbackUsed) setInfo(`Switched to ${result.provider}: ${result.fallbackReason ?? "Primary unavailable"}`);
      if (result.checkoutUrl) { window.location.assign(result.checkoutUrl); return; }
      throw new Error("Checkout URL missing.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to complete checkout.");
    } finally { setLoading(false); }
  }

  const charityContribution = selectedPlan ? Math.ceil((selectedPlan.priceInr * charityPercent) / 100) : 0;

  return (
    <div>
      {/* Plan Toggle */}
      <div className="grid-2" style={{ marginBottom: "1.5rem" }}>
        {plans.map((plan) => (
          <button
            key={plan.code}
            type="button"
            onClick={() => setPlanCode(plan.code)}
            className={`plan-card ${planCode === plan.code ? "featured" : ""}`}
            style={{ cursor: "pointer", textAlign: "left" }}
          >
            <div>
              <p className="eyebrow">{plan.label}</p>
              <div className="plan-price">
                ₹{plan.priceInr.toLocaleString("en-IN")}
                <span> /{plan.billingCycleMonths === 1 ? "mo" : "yr"}</span>
              </div>
            </div>
            {plan.discountLabel ? <span className="badge badge-success">{plan.discountLabel}</span> : null}
          </button>
        ))}
      </div>

      <form className="form-glass" onSubmit={onSubmit}>
        <label>Email <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></label>

        {/* Charity Selector */}
        <label>Choose a Charity</label>
        <div className="grid" style={{ gap: "0.75rem", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
          {charities.map((c) => (
            <button
              key={c.id} type="button" onClick={() => setCharityId(c.id)}
              style={{
                padding: "1rem", borderRadius: "var(--r-lg)", cursor: "pointer", textAlign: "left",
                border: charityId === c.id ? "1.5px solid var(--lime-500)" : "1.5px solid var(--border-light)",
                background: charityId === c.id ? "rgba(132, 204, 22, 0.06)" : "var(--bg-1)",
                transition: "all var(--dur-fast) var(--ease)",
                boxShadow: charityId === c.id ? "var(--shadow-sm)" : "none",
              }}
            >
              <p style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text-1)", marginBottom: "0.2rem" }}>{c.name}</p>
              <p style={{ fontSize: "0.76rem", color: "var(--text-3)" }}>{c.tags.join(" · ")}</p>
            </button>
          ))}
        </div>

        {/* Contribution Slider */}
        <label>
          Charity Contribution: <span className="gradient-text" style={{ fontWeight: 700 }}>{charityPercent}%</span>
          <input type="range" min={10} max={80} step={1} value={charityPercent} onChange={(e) => setCharityPercent(Number(e.target.value))} />
          <div className="flex-between" style={{ fontSize: "0.76rem", color: "var(--text-3)" }}>
            <span>10% minimum</span><span>80% maximum</span>
          </div>
        </label>

        {/* Summary */}
        {selectedPlan ? (
          <div className="stat-card" style={{ borderColor: "var(--border-hover)" }}>
            <div className="flex-between">
              <div>
                <p className="stat-label">Total Payment</p>
                <p className="stat-value gradient-text" style={{ fontSize: "1.5rem" }}>₹{selectedPlan.priceInr.toLocaleString("en-IN")}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p className="stat-label">To {selectedCharity?.name ?? "Charity"}</p>
                <p className="stat-value gold-text" style={{ fontSize: "1.5rem" }}>₹{charityContribution.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </div>
        ) : null}

        {error ? <p className="error">{error}</p> : null}
        {info ? <p className="info">{info}</p> : null}

        <button type="submit" disabled={loading}>{loading ? "Creating checkout..." : "Subscribe & Continue"}</button>
      </form>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";

import { Footer } from "@/components/Footer";
import { StatsCounter } from "@/components/StatsCounter";
import { listCharities } from "@/lib/charities/repository";
import { SUBSCRIPTION_PLANS } from "@/lib/subscriptions/plans";

const CHARITY_IMAGES: Record<string, string> = {
  "junior-fairways-foundation": "/charity-junior-fairways.png",
  "clean-water-drive": "/charity-clean-water.png",
  "green-links-initiative": "/charity-green-links.png",
};

export default function HomePage() {
  const charities = listCharities();

  return (
    <>
      <main className="page">
        {/* ── HERO — Dark contrast section ────────────── */}
        <section className="hero-section">
          <div className="hero-bg-glow" />
          <Image src="/hero-impact.png" alt="" width={380} height={380} className="hero-banner-img" priority />

          <div className="hero-content anim-fade-up">
            <p className="eyebrow anim-fade-up anim-delay-1">Charity-first platform</p>
            <h1 className="anim-fade-up anim-delay-2">
              Every score you enter<br />
              <span className="gradient-text">changes a life</span>
            </h1>
            <p className="hero-copy anim-fade-up anim-delay-3">
              Subscribe, track your Stableford performance, and watch your scores
              fuel monthly prize draws while funding the charities you believe in.
            </p>
            <div className="hero-actions anim-fade-up anim-delay-4">
              <Link href="/subscribe" className="btn-primary">Start Your Subscription</Link>
              <Link href="/charities" className="btn-secondary" style={{ color: "var(--lime-300)", borderColor: "rgba(163, 230, 53, 0.25)" }}>
                Explore Charities
              </Link>
            </div>
          </div>
        </section>

        {/* ── Impact Numbers ─────────────────────────── */}
        <section className="anim-fade-up anim-delay-1">
          <div className="grid-3">
            <StatsCounter label="Active Members" target={2847} suffix="+" />
            <StatsCounter label="Monthly Prize Pool" target={425000} prefix="₹" />
            <StatsCounter label="Charity Raised" target={185000} prefix="₹" />
          </div>
        </section>

        {/* ── How It Works ───────────────────────────── */}
        <section className="steps-section">
          <div className="center-col" style={{ marginBottom: "2.5rem" }}>
            <p className="eyebrow">How It Works</p>
            <h2>Three steps to making an impact</h2>
            <p className="text-muted" style={{ marginTop: "0.5rem", maxWidth: "50ch" }}>
              Your subscription fuels charitable giving. Your scores become your
              winning numbers in monthly draws.
            </p>
          </div>
          <div className="grid-3">
            {[
              { n: "1", title: "Subscribe", icon: stepIconSubscribe, desc: "Choose a monthly or yearly plan. A portion goes directly to a charity you select." },
              { n: "2", title: "Enter Scores", icon: stepIconScore, desc: "Log your last 5 Stableford scores. They become your unique draw entries." },
              { n: "3", title: "Win & Give", icon: stepIconWin, desc: "Monthly draws match your numbers. Match 3, 4 or all 5 to win from the pool." },
            ].map((step) => (
              <div key={step.n} className={`step-card anim-fade-up anim-delay-${step.n}`}>
                <div className="step-number">{step.n}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Charities Section ──────────────────────── */}
        <section style={{ padding: "2rem 0 3rem" }}>
          <div className="flex-between" style={{ marginBottom: "2rem" }}>
            <div>
              <p className="eyebrow">Impact Spotlight</p>
              <h2>Charities making a difference</h2>
            </div>
            <Link href="/charities" className="btn-secondary">View All</Link>
          </div>
          <div className="grid-3">
            {charities.slice(0, 3).map((charity, idx) => (
              <Link key={charity.id} href={`/charities/${charity.id}`} style={{ textDecoration: "none" }}>
                <div className={`charity-card anim-fade-up anim-delay-${idx + 1}`}>
                  <div className="charity-card-image">
                    <Image
                      src={CHARITY_IMAGES[charity.id] ?? "/hero-impact.png"}
                      alt={charity.name}
                      width={400} height={180}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div className="charity-card-body">
                    <h3>{charity.name}</h3>
                    <p className="text-muted" style={{ fontSize: "0.84rem", marginBottom: "0.6rem" }}>
                      {charity.description}
                    </p>
                    <div className="flex-row">
                      {charity.tags.map((tag) => (
                        <span key={tag} className="charity-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Plans ──────────────────────────────────── */}
        <section style={{ padding: "2rem 0" }}>
          <div className="center-col" style={{ marginBottom: "2.5rem" }}>
            <p className="eyebrow">Pricing</p>
            <h2>Choose your impact level</h2>
          </div>
          <div className="grid-2">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <div key={plan.code} className={`plan-card ${plan.code === "yearly" ? "featured" : ""}`}>
                <div>
                  <p className="eyebrow">{plan.label}</p>
                  <div className="plan-price">
                    ₹{plan.priceInr.toLocaleString("en-IN")}
                    <span> /{plan.billingCycleMonths === 1 ? "month" : "year"}</span>
                  </div>
                  {plan.discountLabel ? (
                    <span className="badge badge-success" style={{ marginTop: "0.5rem" }}>{plan.discountLabel}</span>
                  ) : null}
                </div>
                <ul className="plan-features">
                  <li>Monthly prize draw entries</li>
                  <li>Track 5 rolling Stableford scores</li>
                  <li>Support your chosen charity (min 10%)</li>
                  <li>Full dashboard access</li>
                  {plan.code === "yearly" ? <li>Priority support</li> : null}
                </ul>
                <Link href="/subscribe" className="btn-primary" style={{ textAlign: "center" }}>Get Started</Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── Draw Mechanics ─────────────────────────── */}
        <section style={{ padding: "2rem 0" }}>
          <div className="center-col" style={{ marginBottom: "2.5rem" }}>
            <p className="eyebrow">The Draw</p>
            <h2>How winners are chosen</h2>
          </div>
          <div className="grid-3">
            {[
              { tier: "5-Number Match", pct: "40%", sub: "Jackpot — rolls over if unclaimed", accent: true },
              { tier: "4-Number Match", pct: "35%", sub: "Split equally among all 4-match winners" },
              { tier: "3-Number Match", pct: "25%", sub: "Split equally among all 3-match winners" },
            ].map((item) => (
              <div key={item.tier} className="card-glass" style={{ textAlign: "center", padding: "2rem 1.5rem" }}>
                <p className="eyebrow" style={{ marginBottom: "0.75rem" }}>{item.tier}</p>
                <p className={`stat-value ${item.accent ? "gold-text" : "gradient-text"}`} style={{ fontSize: "2.2rem", fontFamily: "var(--font-dm, 'DM Serif Display', serif)", marginBottom: "0.5rem" }}>
                  {item.pct}
                </p>
                <p style={{ fontSize: "0.84rem", color: "var(--text-2)" }}>of prize pool</p>
                <p className="text-dim" style={{ fontSize: "0.8rem", marginTop: "0.6rem" }}>{item.sub}</p>
                {item.accent ? (
                  <span className="badge badge-warning" style={{ marginTop: "0.75rem" }}>Rollover Eligible</span>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        {/* ── Final CTA — Dark section ───────────────── */}
        <section style={{ padding: "2rem 0" }}>
          <div className="dark-section center-col">
            <p className="eyebrow" style={{ marginBottom: "0.75rem" }}>Ready to make an impact?</p>
            <h2 style={{ marginBottom: "0.75rem" }}>
              Join GreenStake today
            </h2>
            <p style={{ maxWidth: "46ch", marginBottom: "1.5rem" }}>
              Every subscription fuels the prize pool and funds the charities you believe in.
            </p>
            <div className="flex-row">
              <Link href="/signup" className="btn-primary">Create Free Account</Link>
              <Link href="/login" className="btn-ghost" style={{ color: "rgba(244,247,240,0.6)" }}>Already a member? Login</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

/* SVG icon placeholder variables (not rendered, just for type safety) */
const stepIconSubscribe = "subscribe";
const stepIconScore = "score";
const stepIconWin = "win";

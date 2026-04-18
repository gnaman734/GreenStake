import Link from "next/link";

import { GolfAvatar } from "@/components/GolfAvatar";

export function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-bg-glow" />
      <div className="hero-golf-avatar">
        <GolfAvatar size={320} />
      </div>

      <div className="hero-content anim-fade-up">
        <p className="eyebrow anim-fade-up anim-delay-1">Golf × Charity × Rewards</p>
        <h1 className="anim-fade-up anim-delay-2">
          <span className="gradient-text">Play.</span>{" "}
          <span className="gold-text">Give.</span>{" "}
          <span>Win.</span>
        </h1>
        <p className="hero-copy anim-fade-up anim-delay-3">
          Subscribe, track your Stableford scores, fund the charities you care
          about, and compete in monthly prize draws powered by your performance.
        </p>
        <div className="hero-actions anim-fade-up anim-delay-4">
          <Link href="/subscribe" className="btn-primary">
            Start Your Subscription →
          </Link>
          <Link href="/charities" className="btn-secondary">
            Explore Charities
          </Link>
        </div>
      </div>
    </section>
  );
}

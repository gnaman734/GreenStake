"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

import { CountdownTimer } from "@/components/CountdownTimer";
import { ProgressRing } from "@/components/ProgressRing";
import { ScoreCard } from "@/components/ScoreCard";

interface Score { id: string; played_on: string; stableford_score: number; }
interface ProfileData { fullName: string; email: string; role: string; subscriptionStatus: string; charityName?: string; charityPercent?: number; }

export default function DashboardPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [playedOn, setPlayedOn] = useState(() => new Date().toISOString().slice(0, 10));
  const [scoreValue, setScoreValue] = useState(20);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [meRes, scoresRes] = await Promise.all([
        fetch("/api/me", { cache: "no-store" }),
        fetch("/api/scores", { cache: "no-store" }),
      ]);
      if (meRes.ok) {
        const d = await meRes.json();
        setProfile({
          fullName: d.profile?.fullName ?? d.user?.email ?? "Subscriber",
          email: d.user?.email ?? "", role: d.profile?.role ?? "subscriber",
          subscriptionStatus: d.profile?.subscriptionStatus ?? "none",
          charityName: d.profile?.charityName, charityPercent: d.profile?.charityPercent,
        });
      }
      if (scoresRes.ok) { const d = await scoresRes.json(); setScores(d.scores ?? []); }
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  async function handleAddScore(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSubmitting(true); setFormError(null); setFormSuccess(null);
    try {
      const res = await fetch("/api/scores", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ playedOn, stablefordScore: scoreValue }) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error ?? "Failed to add score."); }
      setFormSuccess("Score added successfully!"); setScoreValue(20); await loadData();
    } catch (err) { setFormError(err instanceof Error ? err.message : "Failed to add score."); } finally { setSubmitting(false); }
  }

  async function handleDeleteScore(id: string) {
    try { const res = await fetch(`/api/scores/${id}`, { method: "DELETE" }); if (res.ok) await loadData(); } catch { /* silent */ }
  }

  const avgScore = scores.length > 0 ? Math.round(scores.reduce((s, x) => s + x.stableford_score, 0) / scores.length) : 0;

  if (loading) {
    return <main className="page"><div className="center-col" style={{ padding: "4rem 0" }}><div className="skeleton skeleton-heading" /><div className="skeleton skeleton-text" style={{ width: "40%" }} /></div></main>;
  }

  return (
    <main className="page">
      {/* Welcome */}
      <div className="card-glass anim-fade-up" style={{ marginBottom: "1.5rem", padding: "1.75rem 2rem" }}>
        <div className="flex-between">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h2 style={{ marginTop: "0.25rem" }}>Welcome, <span className="gradient-text">{profile?.fullName ?? "Hero"}</span></h2>
            <p className="text-muted" style={{ marginTop: "0.15rem", fontSize: "0.84rem" }}>{profile?.email}</p>
          </div>
          <div className="flex-row">
            {profile?.subscriptionStatus === "active" ? (
              <span className="badge badge-success">Active</span>
            ) : profile?.subscriptionStatus === "pending" ? (
              <span className="badge badge-warning">Pending</span>
            ) : (
              <span className="badge badge-neutral">No Subscription</span>
            )}
            {profile?.role === "admin" ? <span className="badge badge-info">Admin</span> : null}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-3 anim-fade-up anim-delay-1" style={{ marginBottom: "1.5rem" }}>
        <div className="stat-card">
          <span className="stat-label">Average Score</span>
          <span className="stat-value gradient-text">{avgScore || "—"}</span>
          <span className="stat-sub">Stableford points</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Scores Logged</span>
          <div style={{ marginTop: "0.25rem" }}><ProgressRing current={scores.length} max={5} label="out of 5 slots" /></div>
        </div>
        <div className="stat-card">
          <span className="stat-label">Next Draw</span>
          <div style={{ marginTop: "0.25rem" }}><CountdownTimer /></div>
        </div>
      </div>

      <div className="grid-2">
        {/* Score Entry */}
        <div className="anim-fade-up anim-delay-2">
          <h3 style={{ marginBottom: "1rem" }}>Enter a Score</h3>
          <form className="form-glass" onSubmit={handleAddScore}>
            <label>Date Played <input type="date" value={playedOn} onChange={(e) => setPlayedOn(e.target.value)} max={new Date().toISOString().slice(0, 10)} required /></label>
            <label>
              Stableford Score: <span className="gradient-text" style={{ fontWeight: 700 }}>{scoreValue}</span>
              <input type="range" min={1} max={45} step={1} value={scoreValue} onChange={(e) => setScoreValue(Number(e.target.value))} />
              <div className="flex-between" style={{ fontSize: "0.74rem", color: "var(--text-3)" }}>
                <span>1</span><span>Poor · 18 · Average · 28 · Good · 36 · Excellent</span><span>45</span>
              </div>
            </label>
            {formError ? <p className="error">{formError}</p> : null}
            {formSuccess ? <p className="info">{formSuccess}</p> : null}
            <button type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Add Score"}</button>
            {scores.length >= 5 ? <p className="muted-small" style={{ textAlign: "center" }}>All 5 slots used. A new score replaces the oldest.</p> : null}
          </form>
        </div>

        {/* Score History */}
        <div className="anim-fade-up anim-delay-3">
          <div className="flex-between" style={{ marginBottom: "1rem" }}>
            <h3>Score History</h3>
            <span className="badge badge-neutral">{scores.length}/5 filled</span>
          </div>
          {scores.length === 0 ? (
            <div className="card-glass center-col" style={{ padding: "3rem 1.5rem" }}>
              <p style={{ fontSize: "0.88rem", color: "var(--text-3)", marginTop: "0.5rem" }}>No scores yet. Enter your first round to get started.</p>
            </div>
          ) : (
            <div className="scores-list">
              {scores.map((s) => <ScoreCard key={s.id} id={s.id} playedOn={s.played_on} score={s.stableford_score} onDelete={handleDeleteScore} />)}
            </div>
          )}

          {profile?.charityName ? (
            <div className="card-glass" style={{ marginTop: "1.25rem" }}>
              <div className="flex-row">
                <div style={{ width: 36, height: 36, borderRadius: "var(--r-md)", background: "var(--grad-brand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.88rem" }}>Supporting: {profile.charityName}</p>
                  <p className="muted-small">{profile.charityPercent ?? 10}% of your subscription goes to this charity</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Draw Numbers */}
      <section style={{ marginTop: "2rem" }} className="anim-fade-up anim-delay-4">
        <h3 style={{ marginBottom: "1rem" }}>Your Draw Numbers</h3>
        <div className="card-glass">
          {scores.length === 0 ? (
            <p className="text-muted">Enter at least one score to generate your draw numbers.</p>
          ) : (
            <>
              <p className="text-muted" style={{ marginBottom: "1rem", fontSize: "0.84rem" }}>
                Your latest {scores.length} score{scores.length !== 1 ? "s" : ""} {scores.length < 5 ? `(need ${5 - scores.length} more for a full entry)` : "form your draw entry"}:
              </p>
              <div className="flex-row" style={{ gap: "0.5rem" }}>
                {scores.map((s) => (
                  <div key={s.id} style={{ width: 50, height: 50, borderRadius: "50%", background: "var(--grad-brand)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1rem", color: "var(--text-inv)", fontFamily: "var(--font-dm, 'DM Serif Display', serif)" }}>
                    {s.stableford_score}
                  </div>
                ))}
                {Array.from({ length: Math.max(0, 5 - scores.length) }).map((_, i) => (
                  <div key={`e-${i}`} style={{ width: 50, height: 50, borderRadius: "50%", border: "2px dashed var(--border-default)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", fontSize: "0.78rem" }}>?</div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

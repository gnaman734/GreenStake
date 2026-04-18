"use client";

import { useCallback, useEffect, useState } from "react";

interface DrawSimResult {
  winningNumbers: number[];
  matchResults: { match_5: number; match_4: number; match_3: number; none: number };
  prizePool: { total: number; match_5: number; match_4: number; match_3: number };
}

type Tab = "overview" | "draws" | "charities";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<{ totalProfiles: number; activeSubscriptions: number; totalScores: number; totalDraws: number } | null>(null);
  const [simResult, setSimResult] = useState<DrawSimResult | null>(null);
  const [simLoading, setSimLoading] = useState(false);
  const [drawMode, setDrawMode] = useState<"random" | "weighted">("random");
  const [drawPool, setDrawPool] = useState(50000);
  const [drawRollover, setDrawRollover] = useState(0);
  const [loading, setLoading] = useState(true);
  const [charities, setCharities] = useState<{ id: string; name: string; description: string; tags: string[]; is_featured: boolean; upcoming_event?: string }[]>([]);

  const loadStats = useCallback(async () => {
    try { const r = await fetch("/api/admin/stats", { cache: "no-store" }); if (r.ok) setStats(await r.json()); } catch {} setLoading(false);
  }, []);

  const loadCharities = useCallback(async () => {
    try { const r = await fetch("/api/admin/charities", { cache: "no-store" }); if (r.ok) { const d = await r.json(); setCharities(d.charities ?? []); } } catch {}
  }, []);

  useEffect(() => { void loadStats(); void loadCharities(); }, [loadStats, loadCharities]);

  async function runSim() {
    setSimLoading(true); setSimResult(null);
    try { const r = await fetch("/api/draws/simulate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: drawMode, prizePoolTotalInr: drawPool, jackpotRolloverInr: drawRollover }) }); if (r.ok) setSimResult(await r.json()); } catch {}
    setSimLoading(false);
  }

  if (loading) return <main className="page"><div className="center-col" style={{ padding: "4rem 0" }}><div className="skeleton skeleton-heading" /></div></main>;

  return (
    <main className="page">
      <div className="page-header anim-fade-up"><p className="eyebrow">Admin Panel</p><h2>Platform Management</h2></div>

      <div className="tabs anim-fade-up anim-delay-1">
        <button className={`tab-btn ${tab === "overview" ? "active" : ""}`} onClick={() => setTab("overview")}>Overview</button>
        <button className={`tab-btn ${tab === "draws" ? "active" : ""}`} onClick={() => setTab("draws")}>Draw Engine</button>
        <button className={`tab-btn ${tab === "charities" ? "active" : ""}`} onClick={() => setTab("charities")}>Charities</button>
      </div>

      {tab === "overview" && (
        <div className="anim-fade-up">
          <div className="grid-3" style={{ marginBottom: "1.5rem" }}>
            <div className="stat-card"><span className="stat-label">Total Users</span><span className="stat-value gradient-text">{stats?.totalProfiles ?? "—"}</span></div>
            <div className="stat-card"><span className="stat-label">Active Subscriptions</span><span className="stat-value gradient-text">{stats?.activeSubscriptions ?? "—"}</span></div>
            <div className="stat-card"><span className="stat-label">Total Scores</span><span className="stat-value gradient-text">{stats?.totalScores ?? "—"}</span></div>
          </div>
          <div className="grid-2">
            <div className="card-glass">
              <h3 style={{ marginBottom: "0.75rem" }}>Pool Distribution</h3>
              {[{ l: "Match 5 (Jackpot)", p: 40, c: "var(--gold-500)" }, { l: "Match 4", p: 35, c: "var(--lime-500)" }, { l: "Match 3", p: 25, c: "var(--lime-600)" }].map((t) => (
                <div key={t.l} style={{ marginBottom: "0.75rem" }}>
                  <div className="flex-between" style={{ marginBottom: "0.2rem" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.84rem" }}>{t.l}</span>
                    <span style={{ color: t.c, fontWeight: 700, fontSize: "0.84rem" }}>{t.p}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: "var(--r-full)", background: "var(--bg-3)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${t.p}%`, background: t.c, borderRadius: "var(--r-full)", transition: "width 0.6s var(--ease)" }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="card-glass">
              <h3 style={{ marginBottom: "0.75rem" }}>Quick Actions</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <button className="btn-primary" onClick={() => setTab("draws")}>Run Draw Simulation</button>
                <button className="btn-secondary" onClick={() => setTab("charities")}>Manage Charities</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "draws" && (
        <div className="anim-fade-up">
          <div className="grid-2">
            <div>
              <h3 style={{ marginBottom: "1rem" }}>Draw Simulation</h3>
              <div className="form-glass">
                <label>Draw Mode<select value={drawMode} onChange={(e) => setDrawMode(e.target.value as "random" | "weighted")}><option value="random">Random</option><option value="weighted">Weighted</option></select></label>
                <label>Prize Pool (INR)<input type="number" value={drawPool} onChange={(e) => setDrawPool(Number(e.target.value))} min={1000} step={1000} /></label>
                <label>Jackpot Rollover (INR)<input type="number" value={drawRollover} onChange={(e) => setDrawRollover(Number(e.target.value))} min={0} step={1000} /></label>
                <button type="button" className="btn-gold" onClick={runSim} disabled={simLoading}>{simLoading ? "Running..." : "Run Simulation"}</button>
              </div>
            </div>
            <div>
              <h3 style={{ marginBottom: "1rem" }}>Results</h3>
              {simResult ? (
                <div className="card-glass">
                  <p className="eyebrow" style={{ marginBottom: "0.75rem" }}>Winning Numbers</p>
                  <div className="flex-row" style={{ gap: "0.5rem", marginBottom: "1.25rem" }}>
                    {simResult.winningNumbers.map((n, i) => (
                      <div key={i} style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--grad-gold)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1rem", color: "var(--text-inv)", fontFamily: "var(--font-dm)" }}>{n}</div>
                    ))}
                  </div>
                  <p className="eyebrow" style={{ marginBottom: "0.5rem" }}>Match Distribution</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1.25rem" }}>
                    <div className="flex-between"><span style={{ fontSize: "0.84rem" }}>5-Number Match</span><span className="badge badge-warning">{simResult.matchResults.match_5} entries</span></div>
                    <div className="flex-between"><span style={{ fontSize: "0.84rem" }}>4-Number Match</span><span className="badge badge-success">{simResult.matchResults.match_4} entries</span></div>
                    <div className="flex-between"><span style={{ fontSize: "0.84rem" }}>3-Number Match</span><span className="badge badge-info">{simResult.matchResults.match_3} entries</span></div>
                    <div className="flex-between"><span style={{ fontSize: "0.84rem", color: "var(--text-3)" }}>No Match</span><span className="badge badge-neutral">{simResult.matchResults.none} entries</span></div>
                  </div>
                  <p className="eyebrow" style={{ marginBottom: "0.5rem" }}>Prize Split</p>
                  <div className="grid-3" style={{ gap: "0.5rem" }}>
                    <div className="stat-card"><span className="stat-label">Jackpot (5)</span><span className="stat-value gold-text" style={{ fontSize: "1.1rem" }}>₹{simResult.prizePool.match_5.toLocaleString("en-IN")}</span></div>
                    <div className="stat-card"><span className="stat-label">Match 4</span><span className="stat-value gradient-text" style={{ fontSize: "1.1rem" }}>₹{simResult.prizePool.match_4.toLocaleString("en-IN")}</span></div>
                    <div className="stat-card"><span className="stat-label">Match 3</span><span className="stat-value gradient-text" style={{ fontSize: "1.1rem" }}>₹{simResult.prizePool.match_3.toLocaleString("en-IN")}</span></div>
                  </div>
                </div>
              ) : (
                <div className="card-glass center-col" style={{ padding: "3rem 1.5rem" }}>
                  <p className="text-muted" style={{ fontSize: "0.88rem" }}>Configure parameters and run a simulation.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "charities" && (
        <div className="anim-fade-up">
          <div className="flex-between" style={{ marginBottom: "1.5rem" }}><h3>Charity Directory</h3><span className="badge badge-neutral">{charities.length} charities</span></div>
          {charities.length === 0 ? (
            <div className="card-glass center-col" style={{ padding: "3rem 1.5rem" }}><p className="text-muted">No charities found.</p></div>
          ) : (
            <div className="grid">
              {charities.map((c) => (
                <div key={c.id} className="card-glass">
                  <div className="flex-between" style={{ marginBottom: "0.4rem" }}><h4>{c.name}</h4>{c.is_featured ? <span className="badge badge-warning">Featured</span> : null}</div>
                  <p className="text-muted" style={{ fontSize: "0.84rem", marginBottom: "0.4rem" }}>{c.description}</p>
                  <div className="flex-row">{c.tags.map((t) => <span key={t} className="charity-tag">{t}</span>)}</div>
                  {c.upcoming_event ? <p className="text-dim" style={{ fontSize: "0.76rem", marginTop: "0.4rem" }}>{c.upcoming_event}</p> : null}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

"use client";

interface ScoreCardProps { id: string; playedOn: string; score: number; onDelete?: (id: string) => void; }

export function ScoreCard({ id, playedOn, score, onDelete }: ScoreCardProps) {
  const formattedDate = new Date(playedOn).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  function getScoreColor(s: number): string {
    if (s >= 36) return "var(--gold-500)";
    if (s >= 28) return "var(--lime-700)";
    if (s >= 18) return "var(--text-1)";
    return "var(--text-3)";
  }

  return (
    <div className="score-item">
      <div>
        <p style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text-1)" }}>{formattedDate}</p>
        <p className="muted-small">Stableford Score</p>
      </div>
      <div className="flex-row">
        <span className="score-value" style={{ color: getScoreColor(score) }}>{score}</span>
        {onDelete ? (
          <button type="button" className="btn-danger" onClick={() => onDelete(id)} style={{ fontSize: "0.74rem", padding: "0.35rem 0.6rem" }}>Remove</button>
        ) : null}
      </div>
    </div>
  );
}

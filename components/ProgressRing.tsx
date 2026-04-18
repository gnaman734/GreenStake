"use client";

interface ProgressRingProps {
  current: number;
  max: number;
  size?: number;
  label?: string;
}

export function ProgressRing({ current, max, size = 56, label }: ProgressRingProps) {
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(current / max, 1);
  const offset = circumference - progress * circumference;

  return (
    <div className="progress-ring-container">
      <svg
        className="progress-ring"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          className="progress-ring-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
        <circle
          className="progress-ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div>
        <p style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>
          {current}/{max}
        </p>
        {label ? (
          <p className="muted-small">{label}</p>
        ) : null}
      </div>
    </div>
  );
}

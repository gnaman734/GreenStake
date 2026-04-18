"use client";

import { useEffect, useState } from "react";

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function calc() {
      const now = new Date();
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const diff = end.getTime() - now.getTime();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    }
    setTimeLeft(calc());
    const t = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="countdown-row">
      {[
        { l: "Days", v: timeLeft.days },
        { l: "Hrs", v: timeLeft.hours },
        { l: "Min", v: timeLeft.minutes },
        { l: "Sec", v: timeLeft.seconds },
      ].map((u) => (
        <div key={u.l} className="countdown-unit">
          <span className="countdown-value">{String(u.v).padStart(2, "0")}</span>
          <span className="countdown-label">{u.l}</span>
        </div>
      ))}
      <style>{`
        .countdown-row { display: flex; gap: 0.5rem; }
        .countdown-unit {
          display: flex; flex-direction: column; align-items: center;
          padding: 0.45rem 0.6rem;
          background: var(--bg-2); border: 1px solid var(--border-light);
          border-radius: var(--r-md); min-width: 48px;
        }
        .countdown-value {
          font-family: var(--font-dm, 'DM Serif Display', serif);
          font-size: 1.3rem; color: var(--lime-700); line-height: 1;
        }
        .countdown-label { font-size: 0.62rem; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 0.15rem; }
      `}</style>
    </div>
  );
}

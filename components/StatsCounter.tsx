"use client";

import { useEffect, useRef, useState } from "react";

interface StatsCounterProps {
  label: string;
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}

export function StatsCounter({
  label,
  target,
  prefix = "",
  suffix = "",
  duration = 2000,
}: StatsCounterProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | null = null;
    let rafId: number;

    function animate(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    }

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [isVisible, target, duration]);

  return (
    <div ref={ref} className="stat-card">
      <span className="stat-label">{label}</span>
      <span className="stat-value gradient-text">
        {prefix}
        {count.toLocaleString("en-IN")}
        {suffix}
      </span>
    </div>
  );
}

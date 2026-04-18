import { ReactNode } from "react";

interface SectionCardProps { title: string; icon?: ReactNode; children: ReactNode; }

export function SectionCard({ title, icon, children }: SectionCardProps) {
  return (
    <div className="section-card">
      {icon ? <div style={{ marginBottom: "0.6rem", fontSize: "1.2rem" }}>{icon}</div> : null}
      <h3>{title}</h3>
      {children}
    </div>
  );
}

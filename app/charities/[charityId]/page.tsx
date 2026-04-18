import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Footer } from "@/components/Footer";
import { listCharities } from "@/lib/charities/repository";

const CHARITY_IMAGES: Record<string, string> = {
  "junior-fairways-foundation": "/charity-junior-fairways.png",
  "clean-water-drive": "/charity-clean-water.png",
  "green-links-initiative": "/charity-green-links.png",
};

interface Props { params: Promise<{ charityId: string }>; }

export default async function CharityDetailPage(props: Props) {
  const { charityId } = await props.params;
  const charity = listCharities().find((c) => c.id === charityId);
  if (!charity) notFound();

  return (
    <>
      <main className="page">
        <div className="anim-fade-up">
          <Link href="/charities" className="inline-link" style={{ fontSize: "0.84rem" }}>Back to Charities</Link>

          <div className="card-glass" style={{ marginTop: "1.5rem", overflow: "hidden", padding: 0 }}>
            <div style={{ width: "100%", height: 280, position: "relative", overflow: "hidden" }}>
              <Image src={CHARITY_IMAGES[charity.id] ?? "/hero-impact.png"} alt={charity.name} width={1200} height={280} style={{ width: "100%", height: "100%", objectFit: "cover" }} priority />
            </div>
            <div style={{ padding: "1.5rem 2rem 2rem" }}>
              <div className="flex-between" style={{ marginBottom: "0.6rem" }}>
                <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}>{charity.name}</h1>
                {charity.isFeatured ? <span className="badge badge-warning">Featured</span> : null}
              </div>
              <p style={{ color: "var(--text-2)", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "1.25rem" }}>{charity.description}</p>
              <div className="flex-row" style={{ marginBottom: "1.25rem" }}>{charity.tags.map((t) => <span key={t} className="charity-tag">{t}</span>)}</div>
              {charity.upcomingEvent ? (
                <div className="stat-card" style={{ marginBottom: "1.25rem" }}>
                  <span className="stat-label">Upcoming Event</span>
                  <span className="stat-value" style={{ fontSize: "1.1rem" }}>{charity.upcomingEvent}</span>
                </div>
              ) : null}
              <div className="divider" />
              <div className="center-col" style={{ padding: "1rem 0" }}>
                <h3>Support {charity.name}</h3>
                <p className="text-muted" style={{ maxWidth: "38ch", marginTop: "0.5rem", marginBottom: "1rem", fontSize: "0.88rem" }}>
                  Subscribe and select this charity to receive a portion of your subscription.
                </p>
                <Link href="/subscribe" className="btn-primary">Subscribe & Support</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

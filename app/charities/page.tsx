import Link from "next/link";
import Image from "next/image";

import { Footer } from "@/components/Footer";
import { listCharities } from "@/lib/charities/repository";

const CHARITY_IMAGES: Record<string, string> = {
  "junior-fairways-foundation": "/charity-junior-fairways.png",
  "clean-water-drive": "/charity-clean-water.png",
  "green-links-initiative": "/charity-green-links.png",
};

export const metadata = { title: "Charities — GreenStake", description: "Browse the charities supported by the GreenStake platform." };

export default function CharitiesPage() {
  const charities = listCharities();
  const featured = charities.filter((c) => c.isFeatured);
  const others = charities.filter((c) => !c.isFeatured);

  return (
    <>
      <main className="page">
        <div className="page-header anim-fade-up">
          <p className="eyebrow">Impact Directory</p>
          <h1>Charities We Support</h1>
          <p>A portion of every subscription goes directly to the charity of your choice. Browse our partners below.</p>
        </div>

        {featured.length > 0 ? (
          <section style={{ marginBottom: "2rem" }} className="anim-fade-up anim-delay-1">
            <p className="eyebrow" style={{ marginBottom: "1rem" }}>Featured</p>
            <div className="grid-2">
              {featured.map((c) => (
                <Link key={c.id} href={`/charities/${c.id}`} style={{ textDecoration: "none" }}>
                  <div className="charity-card" style={{ borderColor: "var(--border-hover)" }}>
                    <div className="charity-card-image" style={{ height: 200 }}>
                      <Image src={CHARITY_IMAGES[c.id] ?? "/hero-impact.png"} alt={c.name} width={600} height={200} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div className="charity-card-body">
                      <div className="flex-between" style={{ marginBottom: "0.4rem" }}>
                        <h3>{c.name}</h3>
                        <span className="badge badge-warning">Featured</span>
                      </div>
                      <p className="text-muted" style={{ fontSize: "0.84rem", marginBottom: "0.6rem" }}>{c.description}</p>
                      <div className="flex-row">{c.tags.map((t) => <span key={t} className="charity-tag">{t}</span>)}</div>
                      {c.upcomingEvent ? <p className="text-dim" style={{ fontSize: "0.78rem", marginTop: "0.5rem" }}>{c.upcomingEvent}</p> : null}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {others.length > 0 ? (
          <section className="anim-fade-up anim-delay-2">
            <div className="grid-3">
              {others.map((c) => (
                <Link key={c.id} href={`/charities/${c.id}`} style={{ textDecoration: "none" }}>
                  <div className="charity-card">
                    <div className="charity-card-image">
                      <Image src={CHARITY_IMAGES[c.id] ?? "/hero-impact.png"} alt={c.name} width={400} height={180} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div className="charity-card-body">
                      <h3>{c.name}</h3>
                      <p className="text-muted" style={{ fontSize: "0.82rem", marginBottom: "0.4rem" }}>{c.description}</p>
                      <div className="flex-row">{c.tags.map((t) => <span key={t} className="charity-tag">{t}</span>)}</div>
                      {c.upcomingEvent ? <p className="text-dim" style={{ fontSize: "0.76rem", marginTop: "0.4rem" }}>{c.upcomingEvent}</p> : null}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section style={{ marginTop: "3rem" }} className="anim-fade-up anim-delay-3">
          <div className="dark-section center-col">
            <h3>Want to make a difference?</h3>
            <p style={{ maxWidth: "42ch", marginTop: "0.5rem", marginBottom: "1rem" }}>Subscribe and choose a charity to support with every payment.</p>
            <Link href="/subscribe" className="btn-primary">Start Your Subscription</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

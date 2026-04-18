"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

interface Viewer {
  id: string;
  email: string;
  fullName?: string;
  role?: "subscriber" | "admin";
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadViewer() {
      try {
        const response = await fetch("/api/me", { cache: "no-store" });
        if (!mounted) return;
        if (!response.ok) { setViewer(null); return; }
        const payload = (await response.json()) as {
          user?: { id: string; email: string };
          profile?: { role?: "subscriber" | "admin"; fullName?: string };
        };
        if (!payload.user) { setViewer(null); return; }
        setViewer({
          id: payload.user.id,
          email: payload.user.email,
          fullName: payload.profile?.fullName,
          role: payload.profile?.role,
        });
      } catch { setViewer(null); }
    }
    void loadViewer();
    return () => { mounted = false; };
  }, [pathname]);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  async function signOut() {
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  function getInitials(name?: string, email?: string): string {
    if (name) {
      const parts = name.trim().split(/\s+/);
      return parts.length >= 2
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : parts[0].slice(0, 2).toUpperCase();
    }
    return email ? email.slice(0, 2).toUpperCase() : "DH";
  }

  return (
    <>
      <header className="top-nav">
        <Link href="/" className="nav-brand" aria-label="GreenStake Home">
          <span className="brand-icon">
            <Image src="/logo.png" alt="GreenStake" width={30} height={30} />
          </span>
          GreenStake
        </Link>

        <nav className={menuOpen ? "open" : ""}>
          <Link href="/" className={pathname === "/" ? "active" : ""}>Home</Link>
          <Link href="/subscribe" className={pathname === "/subscribe" ? "active" : ""}>Subscribe</Link>
          <Link href="/charities" className={pathname?.startsWith("/charities") ? "active" : ""}>Charities</Link>
          <Link href="/dashboard" className={pathname === "/dashboard" ? "active" : ""}>Dashboard</Link>
          {viewer?.role === "admin" ? (
            <Link href="/admin" className={pathname === "/admin" ? "active" : ""}>Admin</Link>
          ) : null}
        </nav>

        <div className="nav-right">
          {viewer ? (
            <>
              <div className="nav-avatar" title={viewer.email}>{getInitials(viewer.fullName, viewer.email)}</div>
              <button type="button" className="btn-secondary" onClick={signOut} style={{ padding: "0.4rem 0.8rem", fontSize: "0.78rem" }}>Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">Login</Link>
              <Link href="/signup" className="btn-primary" style={{ padding: "0.5rem 1.1rem" }}>Sign Up</Link>
            </>
          )}
          <button type="button" className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              {menuOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </header>
      {children}
    </>
  );
}

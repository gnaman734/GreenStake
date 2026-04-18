import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <div className="footer-brand flex-row" style={{ gap: "0.5rem" }}>
            <Image src="/logo.png" alt="" width={24} height={24} style={{ borderRadius: "6px" }} />
            GreenStake
          </div>
          <p className="footer-description">
            A subscription-driven platform combining performance tracking,
            charity fundraising, and monthly draw-based prize pools.
          </p>
        </div>

        <div className="footer-section">
          <h4>Platform</h4>
          <div className="footer-links">
            <Link href="/subscribe">Subscribe</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/charities">Charities</Link>
          </div>
        </div>

        <div className="footer-section">
          <h4>Account</h4>
          <div className="footer-links">
            <Link href="/login">Login</Link>
            <Link href="/signup">Sign Up</Link>
            <Link href="/admin">Admin Panel</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>&copy; {new Date().getFullYear()} GreenStake. All rights reserved.</span>
        <span>Built with impact in mind.</span>
      </div>
    </footer>
  );
}

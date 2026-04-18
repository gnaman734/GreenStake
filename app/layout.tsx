import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import { ReactNode } from "react";

import "@/styles/globals.css";
import { AppShell } from "@/components/AppShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GreenStake — Play. Give. Win.",
  description:
    "A subscription-driven platform combining golf performance tracking, charity fundraising, and monthly prize draws. Subscribe, enter your scores, support a cause, and win big.",
  keywords: ["golf", "charity", "subscription", "prize draw", "stableford", "greenstake"],
  openGraph: {
    title: "GreenStake — Play. Give. Win.",
    description: "Track scores, fund causes, win prizes.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSerif.variable}`}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

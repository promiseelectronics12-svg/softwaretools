/**
 * PageShell — Standard wrapper for every page.
 * Provides: sticky header → scrollable content → footer.
 * Use this in EVERY page.tsx so the layout is always consistent.
 */
"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PageShell({
  children,
  noPad = false,
}: {
  children: React.ReactNode;
  noPad?: boolean;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-base, #f5f7f5)",
      }}
    >
      <Header />
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          paddingBottom: `calc(60px + env(safe-area-inset-bottom, 0px))`, // Space for MobileDock + Safe Area
        }}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}

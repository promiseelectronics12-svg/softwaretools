"use client";

import Link from "next/link";
import { useState } from "react";
import { useLang } from "@/lib/language-context";
import { useCart } from "@/lib/cart-context";

const navItems = [
  {
    href: "/",
    labelEn: "Home",
    labelBn: "হোম",
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    href: "/shop",
    labelEn: "Shop",
    labelBn: "শপ",
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72M6.75 18h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75z" />
      </svg>
    ),
  },
  {
    href: "/cart",
    labelEn: "Cart",
    labelBn: "কার্ট",
    isCart: true,
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
      </svg>
    ),
  },
  {
    href: "/orders",
    labelEn: "Orders",
    labelBn: "অর্ডার",
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
];

export default function MobileDock() {
  const { toggleLang, lang } = useLang();
  const { items } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const linkStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    padding: "0.375rem 0.25rem",
    color: "#64748b",
    textDecoration: "none",
    gap: "0.2rem",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "color 0.2s ease",
  };

  return (
    <>
      {/* ── Bottom Tab Bar ── */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          background: "rgba(255,255,255,0.94)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(0,0,0,0.07)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.05)",
        }}
        className="mobile-dock"
      >
        <div style={{ height: 60, display: "flex", alignItems: "stretch", maxWidth: 480, margin: "0 auto" }}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} style={linkStyle} className="dock-link">
              <span style={{ position: "relative", display: "flex" }}>
                {item.icon}
                {item.isCart && items.length > 0 && (
                  <span className="animate-scale-in" style={{ position: "absolute", top: -4, right: -6, width: 16, height: 16, background: "#10b981", color: "#fff", borderRadius: "9999px", fontSize: "0.5625rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {items.length}
                  </span>
                )}
              </span>
              <span style={{ fontSize: "0.625rem", fontWeight: 700, lineHeight: 1 }}>
                {lang === "bn" ? item.labelBn : item.labelEn}
              </span>
            </Link>
          ))}

          {/* Menu button */}
          <button onClick={() => setIsOpen(true)} style={linkStyle} className="dock-link">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            <span style={{ fontSize: "0.625rem", fontWeight: 700, lineHeight: 1 }}>
              {lang === "bn" ? "মেনু" : "Menu"}
            </span>
          </button>
        </div>
      </nav>

      {/* ── Slide-up Drawer ── */}
      {isOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          {/* Backdrop */}
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.28)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }} onClick={() => setIsOpen(false)} />

          {/* Drawer */}
          <div
            className="animate-fade-up"
            style={{
              position: "relative",
              zIndex: 10,
              background: "rgba(255,255,255,0.97)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderRadius: "1.5rem 1.5rem 0 0",
              borderTop: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 -12px 40px rgba(0,0,0,0.1)",
              padding: "1.5rem",
              paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
              maxWidth: 480,
              width: "100%",
              marginInline: "auto",
            }}
          >
            {/* Handle */}
            <div style={{ width: 40, height: 5, background: "#cbd5e1", borderRadius: "9999px", margin: "0 auto 1.5rem" }} />

            {/* Nav grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
              {[
                { href: "/shop", icon: "🛍️", labelEn: "Shop", labelBn: "শপ" },
                { href: "/orders", icon: "📦", labelEn: "Track Order", labelBn: "অর্ডার ট্র্যাক" },
                { href: "/contact", icon: "📞", labelEn: "Contact", labelBn: "যোগাযোগ" },
                { href: "/cart", icon: "🛒", labelEn: "Cart", labelBn: "কার্ট" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1rem", borderRadius: "1rem", background: "#f8faf9", border: "1px solid #e2e8f0", textDecoration: "none", color: "#475569", gap: "0.375rem" }}
                >
                  <span style={{ fontSize: "1.5rem" }}>{link.icon}</span>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 600 }}>{lang === "bn" ? link.labelBn : link.labelEn}</span>
                </Link>
              ))}
            </div>

            {/* Language switcher */}
            <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8faf9", border: "1px solid #e2e8f0", borderRadius: "0.875rem", padding: "0.75rem 1rem" }}>
                <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#475569" }}>🌐 Language / ভাষা</span>
                <button
                  onClick={toggleLang}
                  style={{ height: 36, padding: "0 1rem", background: "linear-gradient(135deg,#00c853,#059669)", border: "none", borderRadius: "0.625rem", color: "#fff", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                >
                  {lang === "en" ? "বাং" : "EN"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) { .mobile-dock { display: none !important; } }
        .dock-link:hover { color: #10b981 !important; }
      `}</style>
    </>
  );
}

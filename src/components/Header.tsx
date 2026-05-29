"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useLang } from "@/lib/language-context";
import { useCart } from "@/lib/cart-context";

const categories = [
  { key: "all", value: "" },
  { key: "aiTools", value: "AI Tools" },
  { key: "streaming", value: "Streaming" },
  { key: "educational", value: "Educational" },
  { key: "microsoft", value: "Microsoft Office" },
  { key: "design", value: "Design Tools" },
  { key: "vpn", value: "VPN & Security" },
  { key: "seo", value: "SEO Tools" },
];

export default function Header() {
  const router = useRouter();
  const { t, toggleLang, lang } = useLang();
  const { items } = useCart();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (catFilter) params.set("cat", catFilter);
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        transition: "all 0.3s ease",
        background: scrolled ? "rgba(255,255,255,0.94)" : "rgba(255,255,255,0.72)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: scrolled ? "1px solid rgba(0,0,0,0.07)" : "1px solid rgba(0,0,0,0.04)",
        boxShadow: scrolled ? "0 2px 16px rgba(0,0,0,0.06)" : "none",
      }}
    >
      {/* ── Brand Bar ── */}
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 clamp(1rem,4vw,1.5rem)",
          height: 64,
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none", flexShrink: 0 }}>
          <div
            style={{
              width: 38, height: 38, borderRadius: "0.75rem",
              background: "linear-gradient(135deg,#00c853,#059669)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(16,185,129,0.22)", flexShrink: 0,
            }}
          >
            <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="logo-text" style={{ fontSize: "1.0625rem", fontWeight: 800, letterSpacing: "-0.02em", color: "#0f172a", display: "none" }}>
            Official<span className="text-gradient">ToolStore</span>
          </span>
        </Link>

        {/* Desktop Search */}
        <form onSubmit={handleSearch} className="desktop-search" style={{ flex: 1, maxWidth: 520, display: "none", alignItems: "center", height: 44 }}>
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            style={{ height: 44, padding: "0 0.75rem", background: "#f8faf9", border: "1.5px solid #e2e8f0", borderRight: "none", borderRadius: "0.75rem 0 0 0.75rem", fontSize: "0.75rem", fontFamily: "inherit", color: "#475569", outline: "none", cursor: "pointer", flexShrink: 0 }}
          >
            <option value="">{t.selectCategory}</option>
            {categories.map((c) => (
              <option key={c.key} value={c.value}>{t.categories[c.key as keyof typeof t.categories]}</option>
            ))}
          </select>
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchPlaceholder}
            style={{ flex: 1, height: 44, padding: "0 0.875rem", background: "#f8faf9", border: "1.5px solid #e2e8f0", borderLeft: "none", borderRight: "none", fontSize: "0.875rem", fontFamily: "inherit", color: "#0f172a", outline: "none" }}
          />
          <button type="submit" style={{ height: 44, width: 48, background: "linear-gradient(135deg,#00c853,#059669)", border: "none", borderRadius: "0 0.75rem 0.75rem 0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="17" height="17" fill="none" stroke="#fff" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>

        {/* Flex spacer on mobile */}
        <div className="mobile-spacer" style={{ flex: 1 }} />

        {/* Right Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexShrink: 0 }}>

          {/* Language Toggle */}
          <button onClick={toggleLang} style={{ height: 36, padding: "0 0.75rem", borderRadius: "0.625rem", fontSize: "0.75rem", fontWeight: 700, color: "#475569", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
            {lang === "en" ? "বাং" : "EN"}
          </button>

          {/* Orders link — desktop only */}
          <Link href="/orders" className="orders-link" style={{ height: 36, padding: "0 0.75rem", borderRadius: "0.625rem", fontSize: "0.8125rem", fontWeight: 600, color: "#475569", textDecoration: "none", display: "none", alignItems: "center", whiteSpace: "nowrap" }}>
            Order Status
          </Link>

          {/* My Subscription link */}
          <Link href="/lookup" className="orders-link" style={{ height: 36, padding: "0 0.75rem", borderRadius: "0.625rem", fontSize: "0.8125rem", fontWeight: 700, color: "#059669", textDecoration: "none", display: "none", alignItems: "center", whiteSpace: "nowrap", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
            🔑 My Subscription
          </Link>


          {/* Cart */}
          <Link href="/cart" style={{ width: 38, height: 38, borderRadius: "0.75rem", background: "#f8faf9", border: "1.5px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", position: "relative", textDecoration: "none", transition: "all 0.2s ease" }}>
            <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
            </svg>
            {items.length > 0 && (
              <span className="animate-scale-in" style={{ position: "absolute", top: -5, right: -5, width: 18, height: 18, background: "#10b981", color: "#fff", borderRadius: "9999px", fontSize: "0.625rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(16,185,129,0.3)" }}>
                {items.length}
              </span>
            )}
          </Link>

          {/* Hamburger — mobile only */}
          <button onClick={() => setMobileMenu(!mobileMenu)} className="hamburger-btn" style={{ width: 38, height: 38, borderRadius: "0.75rem", background: "#f8faf9", border: "1.5px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", cursor: "pointer" }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {mobileMenu
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />}
            </svg>
          </button>
        </div>
      </div>

      {/* ── Desktop Sub-Nav ── */}
      <div className="subnav-bar" style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(1rem,4vw,1.5rem)", height: 40, display: "flex", alignItems: "center", gap: "0.25rem" }}>
          {[
            { href: "/shop", label: t.shop },
            { href: "/orders", label: t.order },
            { href: "/contact", label: t.contact },
          ].map((link) => (
            <Link key={link.href} href={link.href} style={{ padding: "0 0.75rem", height: 30, borderRadius: "0.5rem", fontSize: "0.8125rem", fontWeight: 600, color: "#64748b", textDecoration: "none", display: "flex", alignItems: "center", transition: "all 0.2s ease", whiteSpace: "nowrap" }} className="subnav-link">
              {link.label}
            </Link>
          ))}
          <div style={{ marginLeft: "auto" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", background: "#f8faf9", border: "1px solid #e2e8f0", padding: "0.2rem 0.625rem", borderRadius: "9999px" }}>
              📞 +880 1879-009680
            </span>
          </div>
        </div>
      </div>

      {/* ── Mobile Dropdown ── */}
      {mobileMenu && (
        <div className="animate-fade-in" style={{ background: "rgba(255,255,255,0.98)", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <div style={{ padding: "0.875rem clamp(1rem,4vw,1.5rem)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <form onSubmit={handleSearch} style={{ display: "flex", height: 44, marginBottom: "0.25rem" }}>
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchPlaceholder}
                className="input"
                style={{ borderRadius: "0.75rem 0 0 0.75rem", minHeight: "auto", height: 44 }}
              />
              <button type="submit" className="btn btn-primary" style={{ borderRadius: "0 0.75rem 0.75rem 0", width: 48, padding: 0, minHeight: "auto", height: 44, flexShrink: 0 }}>
                🔍
              </button>
            </form>
            {[
              { href: "/shop", label: t.shop },
              { href: "/orders", label: "Order Status" },
              { href: "/contact", label: t.contact },
            ].map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileMenu(false)} style={{ display: "block", padding: "0.75rem 0.875rem", borderRadius: "0.75rem", fontSize: "0.9375rem", fontWeight: 600, color: "#475569", textDecoration: "none", background: "#f8faf9" }}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .logo-text { display: block !important; }
          .desktop-search { display: flex !important; }
          .mobile-spacer { display: none !important; }
          .orders-link { display: flex !important; }
          .hamburger-btn { display: none !important; }
          .subnav-bar { display: block; }
        }
        @media (max-width: 767px) {
          .subnav-bar { display: none; }
        }
        .subnav-link:hover { color: #059669 !important; background: rgba(16,185,129,0.06) !important; }
      `}</style>
    </header>
  );
}

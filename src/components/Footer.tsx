"use client";

import Link from "next/link";
import { useLang } from "@/lib/language-context";
import { useSettings } from "@/lib/use-settings";

export default function Footer() {
  const { t } = useLang();
  const s = useSettings();

  return (
    <footer
      style={{
        borderTop: "1px solid rgba(0,0,0,0.06)",
        background: "linear-gradient(180deg, #f5f7f5 0%, #eef2ee 100%)",
        marginTop: "auto",
        position: "relative",
      }}
    >
      <div
        className="grid-bg"
        style={{ position: "absolute", inset: 0, opacity: 0.25, pointerEvents: "none" }}
      />

      <div
        className="container"
        style={{
          position: "relative",
          paddingTop: "3rem",
          paddingBottom: "calc(5.5rem + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
            gap: "2.5rem",
          }}
        >
          {/* Brand column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "0.75rem",
                  background: "linear-gradient(135deg,#00c853,#059669)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(16,185,129,0.2)",
                  flexShrink: 0,
                }}
              >
                <svg width="17" height="17" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span style={{ fontWeight: 800, fontSize: "1rem", color: "#0f172a", letterSpacing: "-0.02em" }}>
                Official<span className="text-gradient">ToolStore</span>
              </span>
            </Link>
            <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#64748b", lineHeight: 1.6, maxWidth: 240 }}>
              {t.footerTagline}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3
              style={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                color: "#0f172a",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "1rem",
              }}
            >
              {t.quickLinks}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {[
                { href: "/shop", label: t.shop },
                { href: "/orders", label: "Order Status" },
                { href: "/contact", label: t.contact },
                { href: "/terms", label: "Terms & Conditions" },
                { href: "/refund", label: "Refund Policy" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#64748b",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3
              style={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                color: "#0f172a",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "1rem",
              }}
            >
              {t.followUs}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {s.telegram_link && (
                <a
                  href={s.telegram_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", fontWeight: 600, color: "#64748b", textDecoration: "none" }}
                >
                  <span>📱</span> Telegram Support
                </a>
              )}
              {s.support_email && (
                <a
                  href={`mailto:${s.support_email}`}
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", fontWeight: 600, color: "#64748b", textDecoration: "none" }}
                >
                  <span>✉️</span> {s.support_email}
                </a>
              )}
              {s.whatsapp_link && (
                <a
                  href={s.whatsapp_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", fontWeight: 600, color: "#64748b", textDecoration: "none" }}
                >
                  <span>💬</span> WhatsApp Support
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid rgba(0,0,0,0.07)",
            marginTop: "2.5rem",
            paddingTop: "1.5rem",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            © {new Date().getFullYear()} {s.store_name || "OfficialToolStore"}. {t.allRightsReserved}
          </p>
          <div style={{ display: "flex", gap: "1rem" }}>
            <Link href="/terms" style={{ fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", textDecoration: "none" }}>Terms</Link>
            <Link href="/refund" style={{ fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", textDecoration: "none" }}>Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

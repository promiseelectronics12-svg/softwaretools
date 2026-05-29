"use client";

import { useLang } from "@/lib/language-context";

const BRANDS = [
  {
    name: "OpenAI",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5L7 19M22 12H2M19 17L5 7" />
      </svg>
    ),
  },
  {
    name: "Spotify",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.783-8.892-1.007-.33.075-.662-.135-.74-.467-.075-.33.136-.662.467-.74 3.856-.882 7.15-.506 9.818 1.13.295.18.387.563.207.857zm1.225-2.72c-.226.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.082-1.182-.413.125-.85-.107-.978-.52-.128-.413.108-.85.52-.978 3.673-1.114 8.243-.57 11.35 1.344.368.226.488.707.264 1.076zm.105-2.81C14.692 8.878 9.24 8.7 6.096 9.654c-.495.15-1.01-.128-1.16-.623-.15-.495.13-1.01.623-1.16 3.636-1.102 9.638-.9 13.376 1.32.445.264.59.838.326 1.28-.262.44-.837.59-1.28.327z" />
      </svg>
    ),
  },
  {
    name: "Netflix",
    icon: <span style={{ color: "#e50914", fontWeight: 900, fontFamily: "sans-serif" }}>N</span>,
  },
  {
    name: "Canva",
    icon: <span style={{ background: "linear-gradient(135deg, #00c4cc, #7d2ae8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 800, fontSize: "0.8rem" }}>Canva</span>,
  },
  {
    name: "Microsoft",
    icon: (
      <svg width="14" height="14" viewBox="0 0 23 23" fill="currentColor">
        <rect x="0" y="0" width="10" height="10" fill="#f25022" />
        <rect x="12" y="0" width="10" height="10" fill="#7fba00" />
        <rect x="0" y="12" width="10" height="10" fill="#00a4ef" />
        <rect x="12" y="12" width="10" height="10" fill="#ffb900" />
      </svg>
    ),
  },
  {
    name: "NordVPN",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

export default function Hero() {
  const { t } = useLang();

  return (
    <section style={{ position: "relative", overflow: "hidden" }}>
      {/* Decorative mesh background */}
      <div
        className="grid-bg"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      />
      {/* Soft green radial glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(90vw, 800px)",
          height: 480,
          background: "radial-gradient(ellipse at center, rgba(16,185,129,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Decorative floating orbs */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "8%",
          width: 320,
          height: 320,
          borderRadius: "9999px",
          background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
          animation: "float-orb-1 22s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "12%",
          right: "8%",
          width: 360,
          height: 360,
          borderRadius: "9999px",
          background: "radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 70%)",
          filter: "blur(70px)",
          pointerEvents: "none",
          animation: "float-orb-2 28s ease-in-out infinite",
        }}
      />

      <div
        className="container"
        style={{ paddingTop: "clamp(3rem,8vw,5rem)", paddingBottom: "clamp(3rem,8vw,5rem)" }}
      >
        {/* Badge */}
        <div
          className="animate-fade-up"
          style={{ display: "flex", justifyContent: "center", marginBottom: "1.25rem" }}
        >
          <div
            className="badge badge-green animate-pulse-glow"
            style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.35rem 0.875rem" }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                background: "#10b981",
                borderRadius: "9999px",
                display: "inline-block",
                animation: "pulseGlow 1.5s ease-in-out infinite",
              }}
            />
            {t.heroBadge}
          </div>
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-up delay-100"
          style={{
            fontSize: "clamp(1.875rem, 5vw, 4rem)",
            fontWeight: 800,
            lineHeight: 1.15,
            textAlign: "center",
            color: "#0f172a",
            letterSpacing: "-0.03em",
            marginBottom: "1.25rem",
          }}
        >
          {t.heroHeading1}{" "}
          <br style={{ display: "none" }} className="hidden-sm-up" />
          <span className="text-gradient">{t.heroHeading2}</span>
        </h1>

        {/* Subtitle */}
        <p
          className="animate-fade-up delay-200"
          style={{
            textAlign: "center",
            color: "#64748b",
            fontSize: "clamp(0.9375rem, 2vw, 1.0625rem)",
            maxWidth: 520,
            margin: "0 auto 2.25rem",
            lineHeight: 1.65,
            fontWeight: 500,
          }}
        >
          {t.heroSub}
        </p>

        {/* CTA Buttons */}
        <div
          className="animate-fade-up delay-300"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            gap: "0.75rem",
            maxWidth: 360,
            margin: "0 auto 2.5rem",
          }}
        >
          <a
            href="/shop"
            className="btn btn-primary"
            style={{ textAlign: "center", fontSize: "0.9375rem", padding: "0 2rem" }}
          >
            {t.exploreProducts} &rarr;
          </a>
          <a
            href="#how-it-works"
            className="btn btn-ghost"
            style={{ textAlign: "center", fontSize: "0.9375rem", padding: "0 2rem" }}
          >
            {t.howItWorksBtn}
          </a>
        </div>

        {/* Brand Scroller (Social Proof) */}
        <div
          className="animate-fade-up delay-300"
          style={{
            maxWidth: 800,
            margin: "0 auto 3.5rem",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "0.6875rem",
              fontWeight: 700,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "0.875rem",
            }}
          >
            Access accounts from premium digital providers
          </p>
          <div
            style={{
              width: "100%",
              overflow: "hidden",
              position: "relative",
              background: "rgba(255, 255, 255, 0.45)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(0, 0, 0, 0.05)",
              borderRadius: "1rem",
              padding: "0.875rem 0",
              maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
              WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
            }}
          >
            <div
              className="marquee-inner"
              style={{
                display: "flex",
                width: "max-content",
                gap: "4rem",
                animation: "marquee-scroll 25s linear infinite",
              }}
            >
              {/* Slide group 1 */}
              <div style={{ display: "flex", gap: "4rem", alignItems: "center" }}>
                {BRANDS.map((b) => (
                  <div key={b.name} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#64748b", fontWeight: 700, fontSize: "0.8125rem" }}>
                    {b.icon}
                    <span>{b.name}</span>
                  </div>
                ))}
              </div>
              {/* Slide group 2 (for perfect loop) */}
              <div style={{ display: "flex", gap: "4rem", alignItems: "center" }}>
                {BRANDS.map((b) => (
                  <div key={`${b.name}-dup`} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#64748b", fontWeight: 700, fontSize: "0.8125rem" }}>
                    {b.icon}
                    <span>{b.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bento Grid — responsive stats */}
        <div
          className="bento-grid animate-fade-up delay-400"
          style={{ maxWidth: 960, margin: "0 auto" }}
        >
          {/* Delivery speed */}
          <div
            className="card bento-span-2"
            style={{ padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "1.25rem" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                className="icon-box icon-box-green"
                style={{ width: 42, height: 42, borderRadius: "0.75rem", fontSize: "1.25rem" }}
              >⚡</div>
              <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                {t.pill1}
              </span>
            </div>
            <div>
              <p style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
                60<span style={{ color: "#10b981", fontSize: "1.125rem" }}>min</span>
              </p>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", marginTop: "0.25rem" }}>Average delivery time</p>
            </div>
          </div>

          {/* Warranty */}
          <div
            className="card"
            style={{ padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "1.25rem" }}
          >
            <div className="icon-box icon-box-green" style={{ width: 42, height: 42, borderRadius: "0.75rem", fontSize: "1.25rem" }}>🛡️</div>
            <div>
              <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>{t.pill2}</p>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", marginTop: "0.25rem" }}>Full replacement warranty</p>
            </div>
          </div>

          {/* Trust */}
          <div
            className="card"
            style={{ padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "1.25rem" }}
          >
            <div className="icon-box icon-box-green" style={{ width: 42, height: 42, borderRadius: "0.75rem", fontSize: "1.25rem" }}>⭐</div>
            <div>
              <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>{t.pill3}</p>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", marginTop: "0.25rem" }}>Verified trusted seller</p>
            </div>
          </div>

          {/* Product count */}
          <div
            className="card bento-span-2 bento-tools-card"
            style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1.25rem" }}
          >
            <div style={{ display: "flex", marginLeft: -8 }}>
              {["🤖", "✨", "🍿", "🚀"].map((icon, i) => (
                <div
                  key={i}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "0.75rem",
                    background: "#fff",
                    border: "2px solid #f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.25rem",
                    marginLeft: i > 0 ? -10 : 0,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  {icon}
                </div>
              ))}
            </div>
            <div>
              <p style={{ fontSize: "1.625rem", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>7+</p>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", marginTop: "0.25rem" }}>Premium digital tools active</p>
            </div>
          </div>

          {/* Support */}
          <div
            className="card bento-span-2"
            style={{
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "1.25rem",
              background: "linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(255,255,255,0.85) 100%)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div className="icon-box icon-box-green" style={{ width: 42, height: 42, borderRadius: "0.75rem", fontSize: "1.25rem" }}>💬</div>
              <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                {t.telegramSupport}
              </span>
            </div>
            <div>
              <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>24/7 Dedicated Support</p>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", marginTop: "0.25rem" }}>Always here to help you</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-orb-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -45px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes float-orb-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-35px, 35px) scale(1.15); }
        }
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (max-width: 639px) {
          .bento-tools-card {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1rem !important;
          }
          .bento-tools-card div:last-child {
            width: 100%;
          }
        }
        @media (min-width: 640px) {
          .hidden-sm-up { display: block !important; }
        }
        @media (max-width: 639px) {
          .btn-row { flex-direction: column; }
        }
      `}</style>
    </section>
  );
}

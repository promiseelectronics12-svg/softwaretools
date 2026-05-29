"use client";

import { useLang } from "@/lib/language-context";

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
            margin: "0 auto 4rem",
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
            className="card bento-span-2"
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

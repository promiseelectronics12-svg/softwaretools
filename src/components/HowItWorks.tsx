"use client";

import { useLang } from "@/lib/language-context";

export default function HowItWorks() {
  const { t } = useLang();

  const steps = [
    {
      label: t.step1Label,
      title: t.step1Title,
      desc: t.step1Desc,
      icon: "🛒",
      accent: { bg: "rgba(16,185,129,0.1)", text: "#059669" },
    },
    {
      label: t.step2Label,
      title: t.step2Title,
      desc: t.step2Desc,
      icon: "💳",
      accent: { bg: "rgba(59,130,246,0.1)", text: "#2563eb" },
    },
    {
      label: t.step3Label,
      title: t.step3Title,
      desc: t.step3Desc,
      icon: "🚀",
      accent: { bg: "rgba(139,92,246,0.1)", text: "#7c3aed" },
    },
  ];

  return (
    <section
      id="how-it-works"
      style={{ position: "relative", padding: "clamp(3rem,8vw,5.5rem) 0", overflow: "hidden" }}
    >
      {/* grid background */}
      <div className="grid-bg" style={{ position: "absolute", inset: 0, opacity: 0.35, pointerEvents: "none" }} />

      <div className="container" style={{ position: "relative" }}>
        <h2
          className="animate-fade-up"
          style={{
            fontSize: "clamp(1.375rem, 3.5vw, 2.25rem)",
            fontWeight: 800,
            textAlign: "center",
            color: "#0f172a",
            letterSpacing: "-0.025em",
            marginBottom: "clamp(2rem,5vw,3.5rem)",
          }}
        >
          {t.howItWorks}
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
            gap: "1.25rem",
          }}
        >
          {steps.map((step, i) => (
            <div
              key={i}
              className="card animate-fade-up"
              style={{
                padding: "2rem 1.5rem",
                textAlign: "center",
                animationDelay: `${i * 120}ms`,
                position: "relative",
              }}
            >
              {/* Step number */}
              <div
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  width: 24,
                  height: 24,
                  background: "rgba(0,0,0,0.04)",
                  borderRadius: "9999px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.6875rem",
                  fontWeight: 800,
                  color: "#94a3b8",
                }}
              >
                {i + 1}
              </div>

              {/* Icon */}
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "1.125rem",
                  background: step.accent.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  margin: "0 auto 1.25rem",
                  border: `1px solid ${step.accent.bg}`,
                  transition: "transform 0.4s ease",
                }}
                className="step-icon"
              >
                {step.icon}
              </div>

              <p
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  color: step.accent.text,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "0.5rem",
                }}
              >
                {step.label}
              </p>
              <h3
                style={{
                  fontWeight: 700,
                  fontSize: "1.0625rem",
                  color: "#0f172a",
                  marginBottom: "0.625rem",
                  letterSpacing: "-0.01em",
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  color: "#64748b",
                  fontSize: "0.875rem",
                  lineHeight: 1.65,
                  fontWeight: 500,
                }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .card:hover .step-icon { transform: scale(1.1) rotate(3deg); }
      `}</style>
    </section>
  );
}

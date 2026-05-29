"use client";

import { useState } from "react";
import { useLang } from "@/lib/language-context";

export default function HowItWorks() {
  const { t } = useLang();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How fast is delivery after payment verification?",
      a: "Orders are processed by our automated delivery pipeline. In average cases, your premium account credentials (including custom devices safety settings) will be delivered inline directly to your dashboard in less than 60 minutes.",
    },
    {
      q: "What is your 'Single-Device Fingerprint' verification rule?",
      a: "To ensure maximum account safety and guarantee your active resource features remain secure, each purchase binds directly to your primary device's hardware cookie and IP range. This prevents unauthorized secondary logins.",
    },
    {
      q: "How can I transfer my active license if I change devices?",
      a: "If you replace your phone or computer, you can contact our verified WhatsApp or Telegram support team directly. Our staff can immediately reset your device fingerprint binding so you can log in on your new hardware.",
    },
    {
      q: "Are the subscription warranties 100% covered?",
      a: "Yes. All digital tools purchased on DiziStore come with a full active replacement warranty. If you encounter any access blocks or technical issues during your package duration, we will instantly replace the credentials.",
    },
  ];

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

        {/* Interactive FAQ Accordion Section */}
        <div style={{ marginTop: "5rem", maxWidth: 768, marginInline: "auto" }}>
          <h3
            style={{
              fontSize: "clamp(1.125rem, 3vw, 1.5rem)",
              fontWeight: 800,
              textAlign: "center",
              color: "#0f172a",
              letterSpacing: "-0.025em",
              marginBottom: "2rem",
            }}
          >
            Frequently Asked Questions
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="card"
                  style={{
                    background: "rgba(255, 255, 255, 0.75)",
                    backdropFilter: "blur(12px)",
                    borderRadius: "0.875rem",
                    border: "1px solid rgba(0, 0, 0, 0.05)",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                >
                  {/* Question Row */}
                  <div style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 700, color: isOpen ? "#059669" : "#0f172a", transition: "color 0.2s" }}>
                      {faq.q}
                    </span>
                    <span style={{ fontSize: "1rem", color: isOpen ? "#059669" : "#94a3b8", transition: "all 0.3s ease", transform: isOpen ? "rotate(180deg)" : "none", fontWeight: "bold" }}>
                      ▾
                    </span>
                  </div>
                  {/* Answer Row */}
                  <div style={{ maxHeight: isOpen ? 250 : 0, opacity: isOpen ? 1 : 0, overflow: "hidden", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}>
                    <div style={{ padding: "0 1.25rem 1.25rem", fontSize: "0.8125rem", color: "#64748b", lineHeight: 1.6, fontWeight: 500 }}>
                      {faq.a}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <style>{`
        .card:hover .step-icon { transform: scale(1.1) rotate(3deg); }
      `}</style>
    </section>
  );
}

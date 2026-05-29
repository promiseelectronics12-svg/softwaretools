"use client";

import { useState } from "react";
import { useLang } from "@/lib/language-context";
import { useSettings } from "@/lib/use-settings";

export default function ContactPage() {
  const { t } = useLang();
  const s = useSettings();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div
      className="container"
      style={{ paddingTop: "2rem", paddingBottom: "7rem" }}
    >
      <h1
        className="animate-fade-up"
        style={{
          fontSize: "clamp(1.25rem, 4vw, 2rem)",
          fontWeight: 800,
          color: "#0f172a",
          letterSpacing: "-0.025em",
          marginBottom: "2rem",
        }}
      >
        {t.contactUs}
      </h1>

      {/* Contact cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: "1.25rem",
          marginBottom: "2rem",
        }}
      >
        {/* WhatsApp */}
        <div
          className="card animate-fade-up"
          style={{
            padding: "1.75rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "1.5rem",
          }}
        >
          <div>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "1rem",
                background: "rgba(16,185,129,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.625rem",
                marginBottom: "1rem",
              }}
            >
              💬
            </div>
            <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "#0f172a", marginBottom: "0.375rem" }}>
              {t.whatsappChat}
            </h3>
            <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#94a3b8" }}>{s.whatsapp_number || "8801879009680"}</p>
          </div>
          <a
            href={s.whatsapp_link || "https://wa.me/8801879009680"}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ textAlign: "center", fontSize: "0.875rem" }}
          >
            {t.whatsappChat} &rarr;
          </a>
        </div>

        {/* Email */}
        <div
          className="card animate-fade-up delay-100"
          style={{
            padding: "1.75rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "1.5rem",
          }}
        >
          <div>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "1rem",
                background: "rgba(59,130,246,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.625rem",
                marginBottom: "1rem",
              }}
            >
              ✉️
            </div>
            <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "#0f172a", marginBottom: "0.375rem" }}>
              {t.sendEmail}
            </h3>
            <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#94a3b8" }}>{s.support_email || "support@OfficialToolStore.com"}</p>
          </div>
          <a
            href={`mailto:${s.support_email || "support@OfficialToolStore.com"}`}
            className="btn btn-ghost"
            style={{ textAlign: "center", fontSize: "0.875rem" }}
          >
            {t.sendEmail} &rarr;
          </a>
        </div>
      </div>

      {/* Message Form */}
      <form
        onSubmit={handleSubmit}
        className="card animate-fade-up delay-200"
        style={{
          maxWidth: 600,
          margin: "0 auto",
          padding: "clamp(1.5rem, 5vw, 2.5rem)",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <h3 style={{ fontWeight: 700, fontSize: "0.8125rem", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.5rem" }}>
          Send us a message
        </h3>

        {sent && (
          <div
            className="animate-scale-in"
            style={{
              background: "rgba(16,185,129,0.06)",
              border: "1px solid rgba(16,185,129,0.2)",
              color: "#047857",
              fontSize: "0.875rem",
              fontWeight: 700,
              padding: "0.875rem 1rem",
              borderRadius: "0.75rem",
            }}
          >
            ✅ Message sent! We&apos;ll get back to you soon.
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
              {t.name}
            </label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
              {t.email}
            </label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
            {t.subject}
          </label>
          <input type="text" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input" />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
            {t.message}
          </label>
          <textarea
            required
            rows={4}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="input"
            style={{ resize: "vertical", height: "auto", minHeight: 120, paddingTop: "0.75rem", paddingBottom: "0.75rem" }}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-full" style={{ fontSize: "1rem", fontWeight: 700 }}>
          {t.sendMessage}
        </button>
      </form>
    </div>
  );
}

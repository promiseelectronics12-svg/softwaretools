"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { t } = useLang();
  const { setUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        router.push(redirect);
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 108px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem var(--container-px) 7rem",
        position: "relative",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(90vw, 500px)",
          height: 400,
          background: "radial-gradient(ellipse at center, rgba(16,185,129,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="animate-scale-in"
        style={{ width: "100%", maxWidth: 420, position: "relative" }}
      >
        <div
          className="card"
          style={{
            padding: "clamp(1.5rem, 6vw, 2.5rem)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.09)",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          {/* Brand */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                textDecoration: "none",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "0.875rem",
                  background: "linear-gradient(135deg,#00c853,#059669)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(16,185,129,0.25)",
                }}
              >
                <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </Link>
            <h1
              style={{
                fontSize: "1.375rem",
                fontWeight: 800,
                color: "#0f172a",
                letterSpacing: "-0.025em",
              }}
            >
              {isRegister ? t.registerTitle : t.loginTitle}
            </h1>
          </div>

          {/* Error message */}
          {error && (
            <div
              className="animate-scale-in"
              style={{
                background: "rgba(220,38,38,0.05)",
                border: "1px solid rgba(220,38,38,0.15)",
                color: "#dc2626",
                fontSize: "0.875rem",
                fontWeight: 700,
                padding: "0.875rem 1rem",
                borderRadius: "0.75rem",
                marginBottom: "1.25rem",
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {isRegister && (
              <div>
                <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
                  {t.nameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input"
                />
              </div>
            )}
            <div>
              <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
                {t.emailLabel}
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
                {t.passwordLabel}
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full"
              style={{ marginTop: "0.5rem", fontSize: "1rem", fontWeight: 700 }}
            >
              {loading ? "..." : isRegister ? t.signUp : t.signIn}
            </button>
          </form>

          {/* Toggle login / register */}
          <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9375rem", fontWeight: 600, color: "#64748b" }}>
            {isRegister ? t.hasAccount : t.noAccount}{" "}
            <button
              onClick={() => { setIsRegister(!isRegister); setError(""); }}
              style={{
                color: "#059669",
                fontWeight: 700,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "inherit",
              }}
            >
              {isRegister ? t.signIn : t.signUp}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

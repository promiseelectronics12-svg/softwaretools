"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PageShell from "@/components/PageShell";

/* ─── Types ─── */
interface Credential {
  id: number;
  productName: string;
  duration: string;
  orderCode: string;
  startDate: string;
  expiryDate: string;
  daysLeft: number;
  status: "active" | "expiring" | "expired";
  hasTOTP: boolean;
  username?: string;
  password?: string;
  notes?: string;
}

interface TOTPState {
  code: string;
  secondsRemaining: number;
}

const LS_TOKEN_KEY  = "dizi_lookup_token";
const LS_EXPIRY_KEY = "dizi_lookup_expiry";
const DEVICE_COOKIE = "dizi_device_id";

/* ─── Cookie helpers ─── */
function getDeviceId(): string {
  // Try reading the cookie
  const match = document.cookie.match(new RegExp(`(?:^|; )${DEVICE_COOKIE}=([^;]*)`));
  if (match) return decodeURIComponent(match[1]);

  // Generate a new one and set a 30-day cookie
  const id = Array.from(crypto.getRandomValues(new Uint8Array(24)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${DEVICE_COOKIE}=${encodeURIComponent(id)}; expires=${expires}; path=/; SameSite=Strict`;
  return id;
}

/* ─── Web Audio notification (for TOTP warning) ─── */
function playTick() {
  try {
    const ctx  = new AudioContext();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 1000;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch {}
}

/* ─── Copy to clipboard ─── */
async function copyText(text: string, setCopied: (v: boolean) => void) {
  try {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  } catch {}
}

/* ─── TOTP Widget ─── */
function TOTPWidget({ token, credId }: { token: string; credId: number }) {
  const [state, setState]   = useState<TOTPState | null>(null);
  const [error, setError]   = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchCode = useCallback(async () => {
    try {
      const res = await fetch(`/api/lookup/totp?token=${token}&credId=${credId}`);
      if (!res.ok) { setError("Could not load code"); return; }
      const data = await res.json();
      setState(data);
      setError("");
    } catch { setError("Network error"); }
  }, [token, credId]);

  useEffect(() => {
    fetchCode();
    intervalRef.current = setInterval(fetchCode, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchCode]);

  if (error) return null;
  if (!state) return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1rem" }}>
      <div style={{ width: 16, height: 16, borderRadius: "9999px", border: "2px solid #e2e8f0", borderTopColor: "#10b981", animation: "spin 0.7s linear infinite" }} />
      <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Loading authenticator code...</span>
    </div>
  );

  const progress = ((30 - state.secondsRemaining) / 30) * 100;
  const isUrgent = state.secondsRemaining <= 5;

  return (
    <div style={{ marginTop: "1.25rem", padding: "1rem", background: "rgba(16,185,129,0.04)", border: "1.5px solid rgba(16,185,129,0.15)", borderRadius: "1rem" }}>
      <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.75rem" }}>
        🔐 Authenticator Code
      </p>

      {/* Big spaced code */}
      <div style={{ display: "flex", gap: "0.375rem", justifyContent: "center", marginBottom: "0.875rem" }}>
        {state.code.split("").map((digit, i) => (
          <div
            key={i}
            style={{
              width: 38, height: 48,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "#fff",
              border: `2px solid ${isUrgent ? "#ef4444" : "#10b981"}`,
              borderRadius: "0.625rem",
              fontSize: "1.375rem", fontWeight: 800,
              color: isUrgent ? "#ef4444" : "#0f172a",
              fontFamily: "monospace",
              transition: "border-color 0.3s, color 0.3s",
              ...(i === 2 ? { marginRight: "0.5rem" } : {}),
            }}
          >
            {digit}
          </div>
        ))}
      </div>

      {/* Countdown bar */}
      <div style={{ height: 6, background: "#e2e8f0", borderRadius: "9999px", overflow: "hidden", marginBottom: "0.5rem" }}>
        <div
          style={{
            height: "100%",
            width: `${100 - progress}%`,
            background: isUrgent
              ? "linear-gradient(90deg,#ef4444,#f87171)"
              : "linear-gradient(90deg,#10b981,#34d399)",
            borderRadius: "9999px",
            transition: "width 1s linear, background 0.3s",
          }}
        />
      </div>
      <p style={{ fontSize: "0.6875rem", color: isUrgent ? "#ef4444" : "#94a3b8", fontWeight: 700, textAlign: "right" }}>
        {isUrgent ? "⚠️ " : ""}{state.secondsRemaining}s remaining
      </p>
    </div>
  );
}

/* ─── Credential Card ─── */
function CredentialCard({ cred, token }: { cred: Credential; token: string }) {
  const [copiedU, setCopiedU] = useState(false);
  const [copiedP, setCopiedP] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const isExpired  = cred.status === "expired";
  const isExpiring = cred.status === "expiring";

  const borderColor  = isExpired ? "#fecaca" : isExpiring ? "#fde68a" : "#e2e8f0";
  const statusBg     = isExpired ? "#fef2f2" : isExpiring ? "#fffbeb" : "#f0fdf4";
  const statusText   = isExpired ? "#b91c1c" : isExpiring ? "#b45309" : "#15803d";
  const statusLabel  = isExpired ? "Expired" : isExpiring ? `Expiring in ${cred.daysLeft}d` : `${cred.daysLeft}d left`;
  const statusIcon   = isExpired ? "🔴" : isExpiring ? "⚠️" : "🟢";

  return (
    <div style={{ background: "#fff", border: `1.5px solid ${borderColor}`, borderRadius: "1.25rem", padding: "1.25rem 1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <h3 style={{ fontWeight: 800, fontSize: "1.0625rem", color: "#0f172a", margin: 0 }}>{cred.productName}</h3>
          <p style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600, marginTop: "0.2rem" }}>
            {cred.duration} · Order: {cred.orderCode}
          </p>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, background: statusBg, color: statusText, border: `1px solid ${borderColor}`, flexShrink: 0 }}>
          {statusIcon} {statusLabel}
        </span>
      </div>

      {isExpired ? (
        <div style={{ padding: "1rem", background: "#fef2f2", borderRadius: "0.875rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.875rem", color: "#b91c1c", fontWeight: 600 }}>
            This subscription expired on {new Date(cred.expiryDate).toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" })}.
          </p>
          <p style={{ fontSize: "0.8125rem", color: "#94a3b8", marginTop: "0.375rem" }}>
            Please place a new order to renew access.
          </p>
        </div>
      ) : (
        <>
          {/* Credentials */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", marginBottom: cred.hasTOTP ? 0 : "0.25rem" }}>
            {/* Username */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "#f8faf9", borderRadius: "0.75rem", padding: "0.75rem 1rem", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "0.625rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.2rem" }}>Email / Username</p>
                <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#0f172a", wordBreak: "break-all" }}>{cred.username}</p>
              </div>
              <button
                onClick={() => copyText(cred.username!, setCopiedU)}
                style={{ height: 34, padding: "0 0.875rem", borderRadius: "0.625rem", background: copiedU ? "#f0fdf4" : "#fff", border: `1px solid ${copiedU ? "#bbf7d0" : "#e2e8f0"}`, color: copiedU ? "#15803d" : "#64748b", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}
              >
                {copiedU ? "✓ Copied" : "Copy"}
              </button>
            </div>

            {/* Password */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "#f8faf9", borderRadius: "0.75rem", padding: "0.75rem 1rem", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "0.625rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.2rem" }}>Password</p>
                <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#0f172a", wordBreak: "break-all", filter: showPass ? "none" : "blur(5px)", userSelect: showPass ? "text" : "none", transition: "filter 0.2s" }}>
                  {cred.password}
                </p>
              </div>
              <div style={{ display: "flex", gap: "0.375rem", flexShrink: 0 }}>
                <button onClick={() => setShowPass(!showPass)} style={{ height: 34, padding: "0 0.75rem", borderRadius: "0.625rem", background: "#fff", border: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  {showPass ? "Hide" : "Show"}
                </button>
                <button onClick={() => copyText(cred.password!, setCopiedP)} style={{ height: 34, padding: "0 0.875rem", borderRadius: "0.625rem", background: copiedP ? "#f0fdf4" : "#fff", border: `1px solid ${copiedP ? "#bbf7d0" : "#e2e8f0"}`, color: copiedP ? "#15803d" : "#64748b", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  {copiedP ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>

          {/* TOTP */}
          {cred.hasTOTP && <TOTPWidget token={token} credId={cred.id} />}

          {/* Notes */}
          {cred.notes && (
            <p style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, marginTop: "0.875rem", padding: "0.625rem 0.875rem", background: "#f8faf9", borderRadius: "0.625rem" }}>
              📝 {cred.notes}
            </p>
          )}

          {/* Expiry */}
          <p style={{ fontSize: "0.6875rem", color: "#94a3b8", fontWeight: 600, marginTop: "0.875rem" }}>
            Valid: {new Date(cred.startDate).toLocaleDateString()} → {new Date(cred.expiryDate).toLocaleDateString()}
          </p>
        </>
      )}
    </div>
  );
}

/* ─── Support Message Form ─── */
function SupportForm({ token, phone }: { token: string; phone: string }) {
  const [open, setOpen]       = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent]       = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError]     = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true); setError("");
    try {
      const res = await fetch("/api/support", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, message }),
      });
      if (res.ok) { setSent(true); setMessage(""); }
      else { const d = await res.json(); setError(d.error || "Failed to send"); }
    } catch { setError("Network error. Please try again."); }
    setSending(false);
  };

  if (!open) return (
    <button
      onClick={() => setOpen(true)}
      style={{ width: "100%", padding: "0.875rem", borderRadius: "1rem", background: "#fff", border: "1.5px dashed #e2e8f0", color: "#64748b", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
    >
      📩 Report a Problem
    </button>
  );

  return (
    <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: "1.25rem", padding: "1.25rem 1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "#0f172a" }}>📩 Report a Problem</h3>
        <button onClick={() => { setOpen(false); setSent(false); setError(""); }} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.125rem", padding: 0 }}>✕</button>
      </div>

      {sent ? (
        <div style={{ padding: "1rem", background: "#f0fdf4", borderRadius: "0.875rem", textAlign: "center" }}>
          <p style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>✅</p>
          <p style={{ fontWeight: 700, color: "#15803d" }}>Message sent!</p>
          <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.25rem" }}>We will get back to you shortly.</p>
          <button onClick={() => setSent(false)} style={{ marginTop: "0.875rem", height: 34, padding: "0 1rem", borderRadius: "0.625rem", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#059669", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            Send Another
          </button>
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <div>
            <p style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600, marginBottom: "0.5rem" }}>From: 📱 {phone}</p>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your problem... (e.g. cannot log in, wrong password, code not working)"
              maxLength={1000}
              rows={4}
              style={{ width: "100%", padding: "0.75rem", background: "#f8faf9", border: "1.5px solid #e2e8f0", borderRadius: "0.75rem", fontSize: "0.875rem", fontFamily: "inherit", color: "#0f172a", outline: "none", resize: "vertical", boxSizing: "border-box" }}
            />
            <p style={{ fontSize: "0.6875rem", color: "#94a3b8", textAlign: "right", marginTop: "0.25rem" }}>{message.length}/1000</p>
          </div>
          {error && <p style={{ color: "#ef4444", fontSize: "0.8125rem", fontWeight: 600 }}>⚠️ {error}</p>}
          <button
            type="submit" disabled={sending}
            style={{ height: 44, background: sending ? "#94a3b8" : "linear-gradient(135deg,#00c853,#059669)", border: "none", borderRadius: "0.875rem", color: "#fff", fontSize: "0.9375rem", fontWeight: 700, cursor: sending ? "not-allowed" : "pointer", fontFamily: "inherit" }}
          >
            {sending ? "Sending..." : "Send Message"}
          </button>
        </form>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Main Lookup Page
═══════════════════════════════════════════════ */
export default function LookupPage() {
  type Phase = "loading" | "phone" | "verify" | "credentials";

  const [phase, setPhase]               = useState<Phase>("loading");
  const [phone, setPhone]               = useState("");             // full verified phone (01XXXXXXXXX)
  const [digits, setDigits]             = useState("");             // 10 user-typed digits (after the leading 0)
  const [transactionId, setTransactionId] = useState("");
  const [token, setToken]               = useState("");
  const [credentials, setCredentials]  = useState<Credential[]>([]);
  const [loadingCreds, setLoadingCreds] = useState(false);
  const [phoneError, setPhoneError]     = useState("");
  const [txError, setTxError]           = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const deviceIdRef                     = useRef("");

  /* ── On mount: get/generate device ID, check saved session ── */
  useEffect(() => {
    deviceIdRef.current = getDeviceId();
    const savedToken  = localStorage.getItem(LS_TOKEN_KEY);
    const savedExpiry = localStorage.getItem(LS_EXPIRY_KEY);
    if (savedToken && savedExpiry && new Date(savedExpiry) > new Date()) {
      setToken(savedToken);
      setPhase("credentials");
    } else {
      localStorage.removeItem(LS_TOKEN_KEY);
      localStorage.removeItem(LS_EXPIRY_KEY);
      setPhase("phone");
    }
  }, []);

  /* ── Load credentials when token is set ── */
  const loadCredentials = useCallback(async (t: string) => {
    setLoadingCreds(true);
    try {
      const res = await fetch(
        `/api/lookup/credentials?token=${t}&deviceId=${encodeURIComponent(deviceIdRef.current)}`
      );
      if (res.status === 401) {
        localStorage.removeItem(LS_TOKEN_KEY);
        localStorage.removeItem(LS_EXPIRY_KEY);
        setPhase("phone");
        return;
      }
      const data = await res.json();
      setCredentials(data.credentials || []);
      setPhone(data.phone || "");
    } catch {}
    setLoadingCreds(false);
  }, []);

  useEffect(() => {
    if (phase === "credentials" && token) loadCredentials(token);
  }, [phase, token, loadCredentials]);

  /* ── Step 1: Phone submit ── */
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(""); setSubmitting(true);
    const fullPhone = "0" + digits.trim();
    try {
      const res = await fetch("/api/lookup", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone, deviceId: deviceIdRef.current }),
      });
      const data = await res.json();

      if (res.status === 429) {
        setPhoneError(data.error);
      } else if (res.ok && data.needsVerification) {
        // Device not bound yet — show transaction ID form
        setPhone(fullPhone);
        setPhase("verify");
      } else if (res.ok && data.token) {
        // Same device — issue token directly
        localStorage.setItem(LS_TOKEN_KEY, data.token);
        localStorage.setItem(LS_EXPIRY_KEY, data.expiresAt);
        setToken(data.token);
        setPhone(fullPhone);
        setPhase("credentials");
      } else {
        setPhoneError(data.error || "Something went wrong.");
      }
    } catch { setPhoneError("Network error. Please try again."); }
    setSubmitting(false);
  };

  /* ── Step 2: Transaction ID submit (device binding) ── */
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTxError(""); setSubmitting(true);
    try {
      const res = await fetch("/api/lookup", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          transactionId: transactionId.trim(),
          deviceId: deviceIdRef.current,
        }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem(LS_TOKEN_KEY, data.token);
        localStorage.setItem(LS_EXPIRY_KEY, data.expiresAt);
        setToken(data.token);
        setPhase("credentials");
      } else {
        setTxError(data.error || "Verification failed. Please check your Transaction ID.");
      }
    } catch { setTxError("Network error. Please try again."); }
    setSubmitting(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(LS_TOKEN_KEY);
    localStorage.removeItem(LS_EXPIRY_KEY);
    setToken(""); setCredentials([]); setPhone(""); setDigits(""); setTransactionId("");
    setPhase("phone");
  };

  /* ── Input styles ── */
  const inputBase: React.CSSProperties = {
    width: "100%", height: 50, padding: "0 1rem",
    background: "#fff", border: "1.5px solid #e2e8f0",
    borderRadius: "0.875rem", fontSize: "1rem",
    fontFamily: "inherit", color: "#0f172a",
    outline: "none", boxSizing: "border-box",
  };

  /* ── Loading screen ── */
  if (phase === "loading") {
    return (
      <PageShell>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <div style={{ width: 40, height: 40, borderRadius: "9999px", border: "3px solid #e2e8f0", borderTopColor: "#10b981", animation: "spin 0.7s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </PageShell>
    );
  }

  /* ── Shared hero ── */
  const Hero = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div style={{ textAlign: "center", marginBottom: "2rem" }}>
      <div style={{ width: 64, height: 64, borderRadius: "1.5rem", background: "linear-gradient(135deg,#00c853,#059669)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", boxShadow: "0 8px 24px rgba(16,185,129,0.25)" }}>
        <span style={{ fontSize: "1.75rem" }}>🔑</span>
      </div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>{title}</h1>
      <p style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: 500, marginTop: "0.5rem" }}>{subtitle}</p>
    </div>
  );

  /* ── Step 1: Phone Entry Screen ── */
  if (phase === "phone") {
    return (
      <PageShell>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
          <div style={{ width: "100%", maxWidth: 420 }}>
            <Hero title="Access My Subscription" subtitle="Enter the phone number you used when placing your order." />

            <form onSubmit={handlePhoneSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: "0.5rem" }}>
                  Phone Number
                </label>

                {/* Split input: locked "0" prefix + 10-digit typed field */}
                <div style={{
                  display: "flex", alignItems: "center",
                  border: `1.5px solid ${phoneError ? "#ef4444" : "#e2e8f0"}`,
                  borderRadius: "0.875rem", overflow: "hidden",
                  background: "#fff", height: 50,
                }}>
                  {/* Static prefix */}
                  <div style={{
                    padding: "0 0.875rem 0 1rem",
                    fontSize: "1rem", fontWeight: 700,
                    color: "#10b981",
                    borderRight: "1.5px solid #e2e8f0",
                    height: "100%", display: "flex", alignItems: "center",
                    background: "#f8fdf9", userSelect: "none", flexShrink: 0,
                  }}>
                    0
                  </div>

                  {/* Digit input — 10 digits max */}
                  <input
                    id="phone-digits"
                    type="tel"
                    required
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="1XXXXXXXXX"
                    value={digits}
                    onChange={(e) => {
                      // Strip anything non-digit; also strip leading zeros user might type
                      let val = e.target.value.replace(/\D/g, "");
                      if (val.startsWith("0")) val = val.replace(/^0+/, "");
                      if (val.length > 10) val = val.slice(0, 10);
                      setDigits(val);
                    }}
                    style={{
                      flex: 1, height: "100%", padding: "0 1rem",
                      border: "none", outline: "none",
                      fontSize: "1rem", fontFamily: "inherit", color: "#0f172a",
                      background: "transparent", letterSpacing: "0.05em",
                    }}
                  />

                  {/* Character counter */}
                  <div style={{
                    padding: "0 0.875rem",
                    fontSize: "0.6875rem", fontWeight: 700,
                    color: digits.length === 10 ? "#10b981" : "#cbd5e1",
                    flexShrink: 0,
                  }}>
                    {digits.length}/10
                  </div>
                </div>

                {phoneError && <p style={{ color: "#ef4444", fontSize: "0.8125rem", fontWeight: 600, marginTop: "0.375rem" }}>⚠️ {phoneError}</p>}
              </div>

              <button
                type="submit" disabled={submitting || digits.length < 10}
                style={{ height: 50, background: submitting || digits.length < 10 ? "#cbd5e1" : "linear-gradient(135deg,#00c853,#059669)", border: "none", borderRadius: "0.875rem", color: "#fff", fontSize: "1rem", fontWeight: 700, cursor: submitting || digits.length < 10 ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: submitting || digits.length < 10 ? "none" : "0 4px 16px rgba(16,185,129,0.3)", transition: "background 0.2s" }}
              >
                {submitting ? "Checking..." : "Continue →"}
              </button>
            </form>

            <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.75rem", color: "#94a3b8", lineHeight: 1.6 }}>
              🔒 Your phone number is verified securely. We never share your data.
            </p>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </PageShell>
    );
  }

  /* ── Step 2: Transaction ID Verification (new device) ── */
  if (phase === "verify") {
    return (
      <PageShell>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
          <div style={{ width: "100%", maxWidth: 420 }}>
            <Hero
              title="Verify Your Identity"
              subtitle="This device hasn't been linked before. Enter your Transaction ID to confirm ownership."
            />

            {/* Info box */}
            <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: "1rem", padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "0.8125rem", color: "#92400e", fontWeight: 600, lineHeight: 1.6 }}>
                📋 Your Transaction ID was given to you at the time of purchase. It looks like <strong>ORD-XXXX</strong> or your bKash/Nagad transaction reference.<br /><br />
                💡 <strong>Keep it saved</strong> — you will need it if you ever change your device.
              </p>
            </div>

            <form onSubmit={handleVerifySubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: "0.5rem" }}>
                  Phone Number
                </label>
                <div style={{ height: 50, padding: "0 1rem", background: "#f8faf9", border: "1.5px solid #e2e8f0", borderRadius: "0.875rem", fontSize: "1rem", fontFamily: "inherit", color: "#64748b", display: "flex", alignItems: "center", fontWeight: 600 }}>
                  📱 {phone}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: "0.5rem" }}>
                  Transaction ID
                </label>
                <input
                  id="transaction-id"
                  type="text"
                  required
                  placeholder="e.g. ORD-1234 or 8TG6XXXX"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  style={{ ...inputBase, border: `1.5px solid ${txError ? "#ef4444" : "#e2e8f0"}` }}
                  autoComplete="off"
                  autoCapitalize="characters"
                />
                {txError && <p style={{ color: "#ef4444", fontSize: "0.8125rem", fontWeight: 600, marginTop: "0.375rem" }}>⚠️ {txError}</p>}
              </div>

              <button
                type="submit" disabled={submitting || !transactionId.trim()}
                style={{ height: 50, background: submitting || !transactionId.trim() ? "#cbd5e1" : "linear-gradient(135deg,#00c853,#059669)", border: "none", borderRadius: "0.875rem", color: "#fff", fontSize: "1rem", fontWeight: 700, cursor: submitting || !transactionId.trim() ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(16,185,129,0.3)", transition: "background 0.2s" }}
              >
                {submitting ? "Verifying..." : "Verify & Unlock →"}
              </button>

              <button
                type="button"
                onClick={() => { setPhase("phone"); setPhone(""); setDigits(""); }}
                style={{ height: 44, background: "none", border: "1.5px solid #e2e8f0", borderRadius: "0.875rem", color: "#64748b", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
              >
                ← Change Phone Number
              </button>
            </form>

            <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.75rem", color: "#94a3b8", lineHeight: 1.6 }}>
              Lost your Transaction ID? Contact us on WhatsApp for help.
            </p>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </PageShell>
    );
  }

  /* ── Credentials View ── */
  const activeCount = credentials.filter((c) => c.status !== "expired").length;

  return (
    <PageShell>
      <div style={{ maxWidth: 680, margin: "0 auto", width: "100%", padding: "2rem clamp(1rem,4vw,1.5rem) 4rem" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em", margin: 0 }}>
              My Subscriptions
            </h1>
            <p style={{ fontSize: "0.8125rem", color: "#64748b", fontWeight: 600, marginTop: "0.25rem" }}>
              📱 {phone} · {activeCount} active
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{ height: 36, padding: "0 0.875rem", borderRadius: "0.75rem", background: "#f8faf9", border: "1.5px solid #e2e8f0", color: "#64748b", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
          >
            Switch Number
          </button>
        </div>

        {loadingCreds ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[1, 2].map((i) => <div key={i} style={{ height: 160, background: "#e2e8f0", borderRadius: "1.25rem", animation: "pulse 1.5s ease-in-out infinite" }} />)}
          </div>
        ) : credentials.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 0", color: "#94a3b8" }}>
            <p style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📭</p>
            <p style={{ fontWeight: 700, fontSize: "1rem" }}>No subscriptions found</p>
            <p style={{ fontSize: "0.875rem", marginTop: "0.375rem" }}>Contact support if you believe this is an error.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {credentials.map((c) => (
              <CredentialCard key={c.id} cred={c} token={token} />
            ))}
          </div>
        )}

        {/* Support form */}
        {!loadingCreds && credentials.length > 0 && (
          <div style={{ marginTop: "2rem" }}>
            <SupportForm token={token} phone={phone} />
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
      `}</style>
    </PageShell>
  );
}

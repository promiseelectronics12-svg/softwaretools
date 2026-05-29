"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useLang } from "@/lib/language-context";
import { useSettings } from "@/lib/use-settings";

export default function CheckoutPage() {
  const { items, totalBdt, totalUsdt, clearCart } = useCart();
  const { t } = useLang();
  const s = useSettings();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("bkash");
  const [trxId, setTrxId] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneTrimmed = phone.trim();
    if (!phoneTrimmed) { setError("Phone number is required"); return; }
    if (!/^01[3-9]\d{8}$/.test(phoneTrimmed)) { setError("Enter a valid Bangladeshi phone number (e.g. 01XXXXXXXXX)"); return; }
    if (!trxId.trim()) { setError("Transaction ID is required"); return; }
    if (trxId.trim().length < 6) { setError("Transaction ID looks too short — please double-check"); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            nameEn: i.nameEn, nameBn: i.nameBn, duration: i.duration,
            icon: i.icon, iconBg: i.iconBg, priceBdt: i.priceBdt,
            priceUsdt: i.priceUsdt, quantity: 1,
          })),
          totalBdt, totalUsdt, paymentMethod, trxId: trxId.trim(), phone: phoneTrimmed,
          note: note.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.order) {
        clearCart();
        router.push(`/orders?success=${data.order.orderCode}`);
      } else {
        setError(data.error || "Failed to place order");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  if (items.length === 0) {
    return (
      <div className="animate-fade-up" style={{ textAlign: "center", padding: "6rem clamp(1rem,4vw,1.5rem)" }}>
        <div style={{ width: 80, height: 80, borderRadius: "1.5rem", background: "#f8faf9", border: "2px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", margin: "0 auto 1.25rem" }}>🛒</div>
        <p style={{ color: "#64748b", fontWeight: 600 }}>Your cart is empty</p>
      </div>
    );
  }

  const payMethods = [
    { key: "bkash", label: "bKash", icon: "৳", accent: { bg: "rgba(236,72,153,0.08)", border: "#f9a8d4", text: "#be185d" } },
    { key: "nagad", label: "Nagad", icon: "৳", accent: { bg: "rgba(249,115,22,0.08)", border: "#fdba74", text: "#c2410c" } },
  ];

  return (
    <div className="container-sm" style={{ paddingTop: "2rem", paddingBottom: "7rem" }}>
      <h1 className="animate-fade-up" style={{ fontSize: "clamp(1.25rem, 4vw, 2rem)", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.025em", marginBottom: "2rem" }}>
        {t.checkout}
      </h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

        {/* Order Summary */}
        <div className="card animate-fade-up" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontWeight: 700, fontSize: "0.8125rem", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "1rem" }}>
            Order Summary
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {items.map((item) => (
              <div key={`${item.id}-${item.duration}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.nameEn} <span style={{ color: "#94a3b8" }}>({item.duration})</span>
                </span>
                <span style={{ fontSize: "0.9375rem", color: "#0f172a", fontWeight: 700, flexShrink: 0 }}>৳{item.priceBdt}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(0,0,0,0.07)", marginTop: "1rem", paddingTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#64748b" }}>{t.totalBdt}</span>
            <span style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a" }}>৳{totalBdt}</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="card animate-fade-up delay-100" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontWeight: 700, fontSize: "0.8125rem", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "1rem" }}>
            {t.paymentMethod}
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
            {payMethods.map((m) => {
              const active = paymentMethod === m.key;
              return (
                <button key={m.key} type="button" onClick={() => setPaymentMethod(m.key)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.625rem", padding: "0.875rem", borderRadius: "0.875rem", border: `2px solid ${active ? "#10b981" : "#e2e8f0"}`, background: active ? "rgba(16,185,129,0.06)" : "#f8faf9", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s ease" }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: "0.625rem", background: m.accent.bg, border: `1px solid ${m.accent.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.125rem", fontWeight: 800, color: m.accent.text, flexShrink: 0 }}>
                    {m.icon}
                  </div>
                  <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: active ? "#047857" : "#475569" }}>{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Payment instructions */}
          <div style={{ padding: "1.125rem", borderRadius: "0.875rem", background: "linear-gradient(135deg, rgba(16,185,129,0.06), rgba(240,253,244,0.8))", border: "1px solid rgba(16,185,129,0.15)" }}>
            <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>{t.paymentInstructions}:</p>
            <p style={{ fontSize: "1.375rem", fontWeight: 800, color: "#047857", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              📱 {s.payment_phone || "01879-009680"}
            </p>
            <p style={{ fontSize: "0.8125rem", color: "#475569", lineHeight: 1.6, fontWeight: 500 }}>
              Send <strong style={{ color: "#0f172a" }}>৳{totalBdt}</strong> as <strong>Send Money</strong> via{" "}
              <strong style={{ color: "#0f172a" }}>{paymentMethod === "bkash" ? "bKash" : "Nagad"}</strong> to the number above, then enter the details below.
            </p>
          </div>
        </div>

        {/* Contact & Transaction Details */}
        <div className="card animate-fade-up delay-200" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h2 style={{ fontWeight: 700, fontSize: "0.8125rem", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Your Details
          </h2>
          <div>
            <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
              {t.phoneNumber} <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" className="input" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
              {t.enterTrxId} <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input type="text" required value={trxId} onChange={(e) => setTrxId(e.target.value)} placeholder="e.g. 9A3B7C2D4E5F" className="input" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
              Note to seller <span style={{ color: "#94a3b8" }}>(optional)</span>
            </label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any special instructions or message..." className="input" maxLength={200} />
          </div>
        </div>

        {error && (
          <p className="animate-fade-in" style={{ color: "#dc2626", fontSize: "0.875rem", fontWeight: 700, background: "rgba(220,38,38,0.05)", border: "1px solid rgba(220,38,38,0.15)", borderRadius: "0.75rem", padding: "0.875rem 1rem" }}>
            ⚠️ {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className="btn btn-primary btn-full animate-fade-up delay-300" style={{ fontSize: "1rem", fontWeight: 700, boxShadow: "0 8px 24px rgba(16,185,129,0.25)" }}>
          {submitting ? "Placing Order..." : t.placeOrder}
        </button>

        <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#94a3b8", fontWeight: 500 }}>
          🔒 Your order is secured. You will receive an order code to track your delivery.
        </p>
      </form>
    </div>
  );
}

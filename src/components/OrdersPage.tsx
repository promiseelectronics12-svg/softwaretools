"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLang } from "@/lib/language-context";

interface OrderItem {
  nameEn: string;
  nameBn: string;
  quantity: number;
  duration: string;
  icon: string;
  iconBg: string;
  priceBdt: number;
  priceUsdt: number;
}

interface Order {
  id: number;
  orderCode: string;
  totalBdt: number;
  totalUsdt: number;
  paymentMethod: string;
  trxId: string;
  phone: string;
  status: string;
  items: OrderItem[];
  createdAt: string;
}

const statusStyles: Record<string, { bg: string; text: string; border: string; label: string }> = {
  pending:   { bg: "#fffbeb", text: "#b45309", border: "#fde68a", label: "Pending" },
  verified:  { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe", label: "Verified" },
  completed: { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0", label: "Completed" },
  failed:    { bg: "#fef2f2", text: "#b91c1c", border: "#fecaca", label: "Failed" },
};

export default function OrdersPage() {
  const { t, lang } = useLang();
  const searchParams = useSearchParams();
  const successCode = searchParams.get("success");

  const [lookupCode, setLookupCode] = useState(successCode || "");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Auto-search if redirected from checkout with a success code
  useEffect(() => {
    if (successCode) {
      handleLookup(successCode);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successCode]);

  const handleLookup = async (code?: string) => {
    const searchCode = (code || lookupCode).trim().toUpperCase();
    if (!searchCode) return;
    setLoading(true);
    setNotFound(false);
    setSearched(false);
    try {
      const res = await fetch(`/api/orders?code=${encodeURIComponent(searchCode)}`);
      const data = await res.json();
      if (data.orders && data.orders.length > 0) {
        setOrders(data.orders);
        setNotFound(false);
      } else {
        setOrders([]);
        setNotFound(true);
      }
    } catch {
      setOrders([]);
      setNotFound(true);
    }
    setLoading(false);
    setSearched(true);
  };

  return (
    <div className="container-sm" style={{ paddingTop: "2rem", paddingBottom: "7rem" }}>

      {/* Success banner */}
      {successCode && (
        <div
          className="card animate-scale-in"
          style={{ padding: "1.25rem 1.5rem", marginBottom: "1.5rem", background: "rgba(16,185,129,0.06)", border: "1.5px solid rgba(16,185,129,0.25)" }}
        >
          <p style={{ color: "#047857", fontWeight: 700, fontSize: "0.9375rem" }}>
            ✅ Order <strong>{successCode}</strong> placed successfully!
          </p>
          <p style={{ color: "#059669", fontWeight: 500, fontSize: "0.8125rem", marginTop: "0.25rem" }}>
            We will verify your payment and deliver within 60 minutes. Save your order code!
          </p>
        </div>
      )}

      {/* Page title */}
      <h1 className="animate-fade-up" style={{ fontSize: "clamp(1.25rem, 4vw, 2rem)", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.025em", marginBottom: "0.5rem" }}>
        {t.orderHistory}
      </h1>
      <p style={{ color: "#64748b", fontWeight: 500, fontSize: "0.9375rem", marginBottom: "2rem" }}>
        Enter your order code to track your delivery status.
      </p>

      {/* Order Code Lookup */}
      <div className="card animate-fade-up" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.625rem" }}>
          Order Code
        </label>
        <div style={{ display: "flex", gap: "0.625rem" }}>
          <input
            type="text"
            value={lookupCode}
            onChange={(e) => setLookupCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            placeholder="OTS-XXXXXX"
            className="input"
            style={{ flex: 1, letterSpacing: "0.05em", fontWeight: 700 }}
          />
          <button
            onClick={() => handleLookup()}
            disabled={loading}
            className="btn btn-primary"
            style={{ flexShrink: 0, padding: "0 1.25rem", fontWeight: 700 }}
          >
            {loading ? "..." : "Track"}
          </button>
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {[1, 2].map((i) => (
            <div key={i} className="skeleton" style={{ height: 140, borderRadius: "1.25rem" }} />
          ))}
        </div>
      )}

      {!loading && notFound && searched && (
        <div className="animate-fade-up" style={{ textAlign: "center", padding: "3rem 0" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🔍</div>
          <p style={{ fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>Order not found</p>
          <p style={{ color: "#64748b", fontSize: "0.875rem", fontWeight: 500 }}>
            Check the order code and try again. Codes look like: <code style={{ background: "#f1f5f9", padding: "0.15rem 0.4rem", borderRadius: "0.375rem" }}>OTS-ABC123</code>
          </p>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {orders.map((order, i) => {
            const st = statusStyles[order.status] || statusStyles.pending;
            return (
              <div
                key={order.id}
                className="card animate-fade-up"
                style={{ padding: "1.25rem 1.5rem", animationDelay: `${i * 60}ms` }}
              >
                {/* Header row */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem", gap: "0.75rem" }}>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: "1rem", color: "#0f172a", letterSpacing: "0.02em" }}>
                      {order.orderCode}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600, marginTop: "0.2rem" }}>
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span style={{ display: "inline-flex", alignItems: "center", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, background: st.bg, color: st.text, border: `1px solid ${st.border}`, flexShrink: 0 }}>
                    {st.label}
                  </span>
                </div>

                {/* Items */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", paddingBottom: "1rem", borderBottom: "1px solid rgba(0,0,0,0.06)", marginBottom: "1rem" }}>
                  {order.items.map((item, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ width: 36, height: 36, borderRadius: "0.625rem", background: item.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.125rem", flexShrink: 0, border: "1px solid rgba(0,0,0,0.06)" }}>
                        {item.icon}
                      </div>
                      <span style={{ flex: 1, fontSize: "0.875rem", fontWeight: 600, color: "#334155" }}>
                        {lang === "bn" ? item.nameBn : item.nameEn}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        {item.duration}
                      </span>
                      <span style={{ fontSize: "0.9375rem", fontWeight: 800, color: "#0f172a", flexShrink: 0 }}>
                        ৳{item.priceBdt}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      💳 {order.paymentMethod}
                    </span>
                    {order.trxId && (
                      <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        TxID: {order.trxId}
                      </span>
                    )}
                    {order.phone && (
                      <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        📱 {order.phone}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>৳{order.totalBdt}</span>
                </div>

                {/* Status explanation */}
                {order.status === "pending" && (
                  <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", borderRadius: "0.75rem", background: "#fffbeb", border: "1px solid #fde68a" }}>
                    <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#b45309" }}>
                      ⏳ Payment verification in progress. Usually takes 30–60 minutes.
                    </p>
                  </div>
                )}
                {order.status === "completed" && (
                  <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", borderRadius: "0.75rem", background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                    <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#15803d" }}>
                      ✅ Delivered! Check your Telegram or email for account credentials.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Help section */}
      {!successCode && !searched && (
        <div className="animate-fade-up delay-200" style={{ marginTop: "1.5rem", padding: "1.25rem 1.5rem", borderRadius: "1rem", background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.12)" }}>
          <p style={{ fontWeight: 700, fontSize: "0.875rem", color: "#047857", marginBottom: "0.5rem" }}>
            💡 Where to find your order code?
          </p>
          <p style={{ fontSize: "0.8125rem", color: "#475569", fontWeight: 500, lineHeight: 1.6 }}>
            After placing an order, you receive a code like <code style={{ background: "#f1f5f9", padding: "0.1rem 0.35rem", borderRadius: "0.25rem", fontWeight: 700 }}>OTS-ABC123</code>. Enter it above to track your order.
          </p>
        </div>
      )}
    </div>
  );
}

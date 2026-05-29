"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useLang } from "@/lib/language-context";

export default function CartPage() {
  const { items, removeFromCart, totalBdt, totalUsdt } = useCart();
  const { t, lang } = useLang();

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
        {t.yourCart}
      </h1>

      {items.length === 0 ? (
        <div
          className="animate-fade-up"
          style={{ textAlign: "center", padding: "5rem 0" }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "1.5rem",
              background: "#f8faf9",
              border: "2px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.5rem",
              margin: "0 auto 1.25rem",
            }}
          >
            🛒
          </div>
          <p style={{ color: "#64748b", fontWeight: 600, marginBottom: "1.5rem" }}>{t.cartEmpty}</p>
          <Link href="/shop" className="btn btn-primary">
            {t.shop}
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "1.25rem",
            alignItems: "start",
          }}
          className="cart-layout"
        >
          {/* Cart Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {items.map((item, i) => (
              <div
                key={`${item.id}-${item.duration}`}
                className="card animate-fade-up"
                style={{
                  padding: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.875rem",
                  animationDelay: `${i * 60}ms`,
                }}
              >
                {/* Product image / icon */}
                {item.image ? (
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "0.75rem",
                      overflow: "hidden",
                      flexShrink: 0,
                      border: "1px solid rgba(0,0,0,0.07)",
                      background: item.iconBg || "#f1f5f9",
                    }}
                  >
                    <img
                      src={item.image}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "0.75rem",
                      background: item.iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                      flexShrink: 0,
                      border: "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    {item.icon}
                  </div>
                )}

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontWeight: 700,
                      fontSize: "0.9375rem",
                      color: "#0f172a",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {lang === "bn" ? item.nameBn : item.nameEn}
                  </p>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "#94a3b8",
                      fontWeight: 700,
                      marginTop: "0.2rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {item.duration}
                  </p>
                </div>

                {/* Price */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontWeight: 800, fontSize: "1.0625rem", color: "#0f172a" }}>৳{item.priceBdt}</p>
                  <p style={{ fontSize: "0.6875rem", color: "#94a3b8", fontWeight: 700, marginTop: "0.15rem" }}>
                    {item.priceUsdt} USDT
                  </p>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  title="Remove from cart"
                  style={{
                    minWidth: 44,
                    minHeight: 44,
                    padding: "0.5rem",
                    borderRadius: "0.875rem",
                    background: "#f8faf9",
                    border: "1.5px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#dc2626",
                    cursor: "pointer",
                    flexShrink: 0,
                    fontSize: "1.125rem",
                    transition: "all 0.15s ease",
                    fontFamily: "inherit",
                    fontWeight: 600,
                  }}
                  className="remove-btn"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="order-summary-panel">
            <div
              className="card animate-slide-right"
              style={{ padding: "1.5rem" }}
            >
              <h3
                style={{
                  fontWeight: 700,
                  fontSize: "0.8125rem",
                  color: "#0f172a",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginBottom: "1.25rem",
                }}
              >
                {lang === "bn" ? "অর্ডারের বিবরণ" : "Order Summary"}
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", marginBottom: "1.25rem" }}>
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.duration}`}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}
                  >
                    <span style={{ fontSize: "0.8125rem", color: "#64748b", fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.nameEn}
                    </span>
                    <span style={{ fontSize: "0.875rem", color: "#0f172a", fontWeight: 700, flexShrink: 0 }}>
                      ৳{item.priceBdt}
                    </span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  borderTop: "1px solid rgba(0,0,0,0.07)",
                  paddingTop: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#64748b" }}>{t.totalBdt}</span>
                  <span style={{ fontSize: "1.625rem", fontWeight: 800, color: "#0f172a" }}>৳{totalBdt}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8" }}>{t.totalUsdt}</span>
                  <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#64748b" }}>{totalUsdt} USDT</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="btn btn-primary btn-full"
                style={{ marginTop: "1.25rem", textAlign: "center" }}
              >
                {t.checkoutNow} &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .remove-btn:hover {
          color: #dc2626 !important;
          border-color: rgba(220,38,38,0.25) !important;
          background: rgba(220,38,38,0.05) !important;
        }
        @media (min-width: 768px) {
          .cart-layout {
            grid-template-columns: 1fr 340px !important;
          }
          .order-summary-panel .card {
            position: sticky !important;
            top: 88px !important;
          }
        }
      `}</style>
    </div>
  );
}

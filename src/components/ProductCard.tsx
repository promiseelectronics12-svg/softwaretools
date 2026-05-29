"use client";

import Link from "next/link";
import { useState } from "react";
import { useLang } from "@/lib/language-context";
import { useCart, type CartItem } from "@/lib/cart-context";

interface Product {
  id: number;
  nameEn: string;
  nameBn: string;
  shortDescEn: string;
  shortDescBn: string;
  fullDescEn: string;
  fullDescBn: string;
  image: string;
  icon: string;
  iconBg: string;
  category: string;
  tags: string[];
  stock: number;
  sold: number;
  packages: { duration: string; usdt: number; bdt: number }[];
  options: { guarantee: string; share: string; duration: string; accountType: string };
  isTop: boolean;
}

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { lang, t } = useLang();
  const { addToCart, items } = useCart();
  const [selectedPkg, setSelectedPkg] = useState(0);
  const [added, setAdded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const isInCart = items.some((i) => i.id === product.id);
  const pkg = product.packages[selectedPkg] || product.packages[0];
  const name = lang === "bn" ? product.nameBn : product.nameEn;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const item: CartItem = {
      id: product.id,
      nameEn: product.nameEn,
      nameBn: product.nameBn,
      icon: product.icon,
      iconBg: product.iconBg,
      image: product.image,
      duration: pkg.duration,
      priceBdt: pkg.bdt,
      priceUsdt: pkg.usdt,
    };
    addToCart(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 4000);
  };

  return (
    <Link href={`/product/${product.id}`} style={{ textDecoration: "none", display: "block" }}>
      <div
        className="card animate-fade-up"
        style={{
          animationDelay: `${index * 55}ms`,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          cursor: "pointer",
        }}
      >
        {/* Product Image */}
        <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden", backgroundColor: "#f8faf9", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {!imageLoaded && !imageError && (
            <div className="skeleton" style={{ position: "absolute", inset: 0, borderRadius: 0, zIndex: 5 }} />
          )}
          {imageError ? (
            <div style={{ textAlign: "center", color: "#94a3b8" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>🖼️</div>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, margin: 0 }}>Image unavailable</p>
            </div>
          ) : (
            <img
              src={product.image}
              alt={name}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "opacity 0.4s ease, transform 0.6s ease",
                display: "block",
                opacity: imageLoaded ? 1 : 0,
              }}
              className="card-img"
            />
          )}
          {/* Subtle gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.08) 0%, transparent 50%)",
            }}
          />
          {/* Tags */}
          {product.tags.length > 0 && (
            <div style={{ position: "absolute", top: 8, left: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
              {product.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="badge badge-green">{tag}</span>
              ))}
            </div>
          )}
          {/* Stock indicator */}
          <div style={{ position: "absolute", bottom: 8, right: 8 }}>
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                color: "#475569",
                background: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(8px)",
                padding: "0.2rem 0.5rem",
                borderRadius: "0.5rem",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              {product.stock} {t.inStock}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div
          className="card-mobile-body"
          style={{
            padding: "0.875rem",
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "space-between",
            gap: "0.625rem",
          }}
        >
          <div>
            {/* Category */}
            <p
              style={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                color: "#059669",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "0.25rem",
              }}
            >
              {product.category}
            </p>

            {/* Product Name */}
            <h3
              className="truncate-1"
              style={{
                fontWeight: 700,
                fontSize: "0.875rem",
                color: "#0f172a",
                letterSpacing: "-0.01em",
                lineHeight: 1.35,
              }}
            >
              {name}
            </h3>

            {/* Stars & sales */}
            <div style={{ display: "flex", alignItems: "center", gap: 2, marginTop: "0.375rem" }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <svg key={s} width="12" height="12" viewBox="0 0 20 20" fill="#f59e0b">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
              <span style={{ fontSize: "0.6875rem", color: "#94a3b8", fontWeight: 700, marginLeft: "0.25rem" }}>
                {product.sold} sold
              </span>
            </div>

            {/* Duration chips */}
            {product.packages.length > 1 && (
              <div 
                className="no-scrollbar card-chips-row"
                style={{ 
                  display: "flex", 
                  gap: "0.375rem", 
                  marginTop: "0.625rem",
                  overflowX: "auto",
                  width: "100%",
                  paddingBottom: "2px",
                }}
              >
                {product.packages.map((p, i) => (
                  <button
                    key={p.duration}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedPkg(i); }}
                    style={{
                      fontSize: "0.6875rem",
                      padding: "0.3rem 0.625rem",
                      borderRadius: "0.5rem",
                      fontWeight: 700,
                      border: "1px solid",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.2s ease",
                      minHeight: 32,
                      flexShrink: 0,
                      background: selectedPkg === i ? "rgba(16,185,129,0.08)" : "#f8faf9",
                      color: selectedPkg === i ? "#059669" : "#64748b",
                      borderColor: selectedPkg === i ? "rgba(16,185,129,0.3)" : "rgba(0,0,0,0.06)",
                    }}
                  >
                    {p.duration}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Price + CTA — always pinned at bottom */}
          <div
            className="card-cta-row"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: "0.75rem",
              borderTop: "1px solid rgba(0, 0, 0, 0.05)",
              marginTop: "auto",
              gap: "0.5rem",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "0.125rem", minWidth: 0, flex: 1 }}>
              <span className="card-price-main" style={{ fontSize: "1.125rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>৳{pkg.bdt}</span>
              <span style={{ fontSize: "0.6875rem", color: "#94a3b8", fontWeight: 700 }}>
                {pkg.usdt} USDT
              </span>
            </div>
            <button
              className="card-cta-btn"
              onClick={handleAdd}
              disabled={isInCart && !added}
              style={{
                flexShrink: 0,
                padding: "0.5rem 1rem",
                borderRadius: "0.625rem",
                fontSize: "0.75rem",
                fontWeight: 700,
                border: "1px solid",
                cursor: isInCart && !added ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                transition: "all 0.2s ease",
                minHeight: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: added
                  ? "rgba(16,185,129,0.1)"
                  : isInCart
                  ? "rgba(16,185,129,0.06)"
                  : "#059669",
                color: added
                  ? "#059669"
                  : isInCart
                  ? "#059669"
                  : "#ffffff",
                borderColor: added
                  ? "rgba(16,185,129,0.3)"
                  : isInCart
                  ? "rgba(16,185,129,0.2)"
                  : "#047857",
                boxShadow: (!isInCart && !added)
                  ? "0 4px 12px rgba(16,185,129,0.15)"
                  : "none",
              }}
            >
              {added ? "✓ Added" : isInCart ? "In Cart" : t.select}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        .card:hover .card-img { transform: scale(1.06); }
      `}</style>
    </Link>
  );
}

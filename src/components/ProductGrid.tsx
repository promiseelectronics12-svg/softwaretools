"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLang } from "@/lib/language-context";
import ProductCard from "./ProductCard";

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

function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className="animate-fade-up"
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: "1.5rem",
        gap: "1rem",
      }}
    >
      <div>
        <h2
          style={{
            fontSize: "clamp(1.125rem, 3vw, 1.75rem)",
            fontWeight: 800,
            color: "#0f172a",
            letterSpacing: "-0.025em",
            lineHeight: 1.2,
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#94a3b8",
              marginTop: "0.25rem",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export default function ProductGrid({ isShopPage = false }: { isShopPage?: boolean }) {
  const { t } = useLang();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const query = searchParams.get("q") || "";
  const category = searchParams.get("cat") || "";

  useEffect(() => {
    setLoading(true);
    setError(false);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category) params.set("cat", category);

    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setProducts(data.products || []))
      .catch(() => { setProducts([]); setError(true); })
      .finally(() => setLoading(false));
  }, [query, category]);

  const featured = products.filter((p) => p.isTop).slice(0, 10);
  const bestSelling = [...products].sort((a, b) => b.sold - a.sold).slice(0, 10);

  /* ─── Loading Skeleton ─── */
  if (loading) {
    return (
      <div className="container" style={{ paddingTop: "2.5rem", paddingBottom: "2.5rem" }}>
        <div className="product-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} style={{ borderRadius: "1.25rem", overflow: "hidden", background: "#fff", border: "1px solid rgba(0,0,0,0.06)", display: "flex", flexDirection: "column" }}>
              <div className="skeleton" style={{ aspectRatio: "4/3", borderRadius: 0 }} />
              <div style={{ padding: "0.875rem", display: "flex", flexDirection: "column", gap: "0.625rem", flex: 1 }}>
                <div>
                  <div className="skeleton" style={{ height: 10, width: "30%", borderRadius: "0.375rem", marginBottom: "0.25rem" }} />
                  <div className="skeleton" style={{ height: 14, width: "70%", borderRadius: "0.375rem", marginBottom: "0.375rem" }} />
                  <div className="skeleton" style={{ height: 10, width: "50%", borderRadius: "0.375rem", marginBottom: "0.625rem" }} />
                  <div style={{ display: "flex", gap: "0.375rem" }}>
                    <div className="skeleton" style={{ height: 32, width: 60, borderRadius: "0.5rem" }} />
                    <div className="skeleton" style={{ height: 32, width: 60, borderRadius: "0.5rem" }} />
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.75rem", borderTop: "1px solid rgba(0, 0, 0, 0.05)", marginTop: "auto", gap: "0.5rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.125rem", flex: 1 }}>
                    <div className="skeleton" style={{ height: 16, width: "60%", borderRadius: "0.375rem" }} />
                    <div className="skeleton" style={{ height: 10, width: "40%", borderRadius: "0.375rem" }} />
                  </div>
                  <div className="skeleton" style={{ height: 40, width: 65, borderRadius: "0.625rem", flexShrink: 0 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ─── Shop Page (full grid with banner) ─── */
  if (isShopPage) {
    return (
      <div
        className="container"
        style={{ paddingTop: "2rem", paddingBottom: "6rem" }}
      >
        {/* Shop banner */}
        <div
          className="card animate-fade-up"
          style={{
            padding: "clamp(1.5rem,5vw,3rem)",
            textAlign: "center",
            marginBottom: "2rem",
            background: "linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(255,255,255,0.9) 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 500,
              height: 280,
              background: "radial-gradient(ellipse, rgba(16,185,129,0.06) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <h2
            style={{
              fontSize: "clamp(1.375rem, 4vw, 2.25rem)",
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.025em",
              position: "relative",
            }}
          >
            {t.allProducts}
          </h2>
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginTop: "0.5rem",
              position: "relative",
            }}
          >
            {products.length} products available
          </p>
        </div>

        {error ? (
          <div style={{ textAlign: "center", padding: "5rem 0" }}>
            <p style={{ fontSize: "4rem", marginBottom: "1rem" }}>⚠️</p>
            <p style={{ color: "#94a3b8", fontWeight: 600, marginBottom: "1rem" }}>Failed to load products</p>
            <button onClick={() => window.location.reload()} style={{ padding: "0.5rem 1rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0", background: "#f8faf9", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem", fontFamily: "inherit" }}>
              Try again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 0" }}>
            <p style={{ fontSize: "4rem", marginBottom: "1rem" }}>📦</p>
            <p style={{ color: "#94a3b8", fontWeight: 600 }}>No products found</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ─── Home Page (Featured + Best Selling) ─── */
  return (
    <div
      className="container"
      style={{ paddingTop: "2.5rem", paddingBottom: "6rem" }}
    >
      {/* Featured */}
      <section style={{ marginBottom: "3.5rem" }}>
        <SectionHeader
          title={t.featuredProducts}
          subtitle={t.featuredSubtitle}
          action={
            <a
              href="/shop"
              className="btn btn-ghost"
              style={{
                fontSize: "0.8125rem",
                padding: "0 1rem",
                minHeight: 38,
                height: 38,
                flexShrink: 0,
                display: "none",
              }}
              id="see-more-link"
            >
              {t.seeMore} &rarr;
            </a>
          }
        />
        <div className="product-grid">
          {featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/* Divider */}
      <div className="divider" style={{ margin: "3rem 0" }}>
        <div
          style={{
            width: 10,
            height: 10,
            transform: "rotate(45deg)",
            background: "rgba(16,185,129,0.15)",
            border: "1.5px solid rgba(16,185,129,0.25)",
            flexShrink: 0,
          }}
        />
      </div>

      {/* Best Selling */}
      <section>
        <SectionHeader
          title={t.bestSelling}
          subtitle={t.bestSellingSubtitle}
        />
        <div className="product-grid">
          {bestSelling.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      <style>{`
        @media (min-width: 640px) {
          #see-more-link { display: inline-flex !important; }
        }
      `}</style>
    </div>
  );
}

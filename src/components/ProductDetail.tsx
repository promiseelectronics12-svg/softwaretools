"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
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

export default function ProductDetail() {
  const params = useParams();
  const { lang, t } = useLang();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState(0);
  const [added, setAdded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const loadProduct = () => {
    setLoading(true);
    setFetchError(false);
    fetch(`/api/products/${params.id}`)
      .then((r) => r.json())
      .then((data) => setProduct(data.product))
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div style={{ maxWidth: "1200px", width: "100%", margin: "0 auto", padding: "3rem 1.5rem" }}>
        <div className="product-detail-grid">
          <div className="skeleton" style={{ aspectRatio: "16/9", borderRadius: "1.25rem", width: "100%" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", width: "100%" }}>
            <div className="skeleton" style={{ height: "1.25rem", width: "30%" }} />
            <div className="skeleton" style={{ height: "2.5rem", width: "85%" }} />
            <div className="skeleton" style={{ height: "4.5rem", borderRadius: "1.25rem" }} />
            <div className="skeleton" style={{ height: "3.5rem", borderRadius: "1.25rem" }} />
            <div className="skeleton" style={{ height: "5rem", borderRadius: "1.25rem" }} />
          </div>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          .product-detail-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          @media (min-width: 768px) {
            .product-detail-grid {
              grid-template-columns: 3fr 2fr;
            }
          }
        `}} />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "6rem 1.5rem", textAlign: "center" }}>
        <p style={{ fontSize: "3.5rem", margin: "0 0 1rem 0" }}>{fetchError ? "⚠️" : "😢"}</p>
        <p style={{ fontSize: "1.5rem", fontWeight: "800", color: "#334155", margin: "0 0 1.5rem 0" }}>
          {fetchError ? "Failed to load product" : "Product not found"}
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          {fetchError && (
            <button onClick={loadProduct} className="btn btn-primary" style={{ borderRadius: "1.25rem", padding: "0.75rem 2rem", textDecoration: "none", border: "none", fontFamily: "inherit", cursor: "pointer" }}>
              Try again
            </button>
          )}
          <Link href="/shop" className="btn btn-primary" style={{ borderRadius: "1.25rem", padding: "0.75rem 2rem", textDecoration: "none" }}>
            ← Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const name = lang === "bn" ? product.nameBn : product.nameEn;
  const desc = lang === "bn" ? product.fullDescBn : product.fullDescEn;
  const pkg = product.packages[selectedPkg] || product.packages[0];

  const handleAdd = () => {
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
    <div style={{ maxWidth: "1200px", width: "100%", margin: "0 auto", padding: "1.5rem 1.5rem 6rem 1.5rem" }}>
      {/* Breadcrumbs - Responsive horizontal scroll support */}
      <nav 
        className="animate-fade-up no-scrollbar"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.75rem",
          fontWeight: "700",
          color: "#94a3b8",
          marginBottom: "1.5rem",
          overflowX: "auto",
          whiteSpace: "nowrap"
        }}
      >
        <Link href="/" style={{ color: "#94a3b8", textDecoration: "none", transition: "color 0.2s" }} className="hover-green">
          {t.home}
        </Link>
        <span style={{ color: "#cbd5e1", fontWeight: "normal" }}>/</span>
        <Link href="/shop" style={{ color: "#94a3b8", textDecoration: "none", transition: "color 0.2s" }} className="hover-green">
          {product.category}
        </Link>
        <span style={{ color: "#cbd5e1", fontWeight: "normal" }}>/</span>
        <span style={{ color: "#64748b" }}>{name}</span>
      </nav>

      {/* Main Grid Content */}
      <div className="product-detail-grid">
        {/* Left Side: Product Image Card */}
        <div className="animate-fade-in" style={{ width: "100%" }}>
          <div
            style={{
              borderRadius: "1.25rem",
              overflow: "hidden",
              border: "1px solid rgba(0, 0, 0, 0.06)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
              backgroundColor: "#ffffff",
              aspectRatio: "16/10",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {!imageLoaded && !imageError && (
              <div className="skeleton" style={{ position: "absolute", inset: 0, borderRadius: "1.25rem", zIndex: 5 }} />
            )}
            {imageError ? (
              <div style={{ textAlign: "center", color: "#94a3b8" }}>
                <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🖼️</div>
                <p style={{ fontSize: "0.875rem", fontWeight: 600 }}>Image unavailable</p>
              </div>
            ) : (
              <img
                src={product.image}
                alt={name}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  transition: "opacity 0.4s ease",
                  opacity: imageLoaded ? 1 : 0
                }}
              />
            )}
          </div>
        </div>

        {/* Right Side: Product Details & Purchase Options */}
        <div className="animate-slide-right" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", width: "100%" }}>
          {/* Tags List */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
            {product.tags.map((tag) => (
              <span key={tag} className="badge badge-green">
                {tag}
              </span>
            ))}
          </div>

          {/* Product Title */}
          <h1 
            style={{ 
              fontSize: "clamp(1.5rem, 4vw, 2rem)", 
              fontWeight: "800", 
              color: "#0f172a", 
              lineHeight: "1.25", 
              letterSpacing: "-0.02em",
              margin: 0 
            }}
          >
            {name}
          </h1>

          {/* Pricing Panel */}
          <div 
            style={{ 
              background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(241, 245, 241, 0.5) 100%)", 
              borderRadius: "1.25rem", 
              padding: "1.25rem", 
              border: "1px solid rgba(16, 185, 129, 0.15)",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)"
            }}
          >
            <span style={{ fontSize: "2rem", fontWeight: "800", color: "#0f172a" }}>৳{pkg.bdt}</span>
            <span style={{ fontSize: "0.875rem", fontWeight: "700", color: "#64748b", marginLeft: "0.5rem" }}>
              ({pkg.usdt} USDT)
            </span>
          </div>

          {/* Guarantee Banner */}
          {product.options.guarantee && (
            <div 
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "0.75rem", 
                fontSize: "0.875rem", 
                color: "#047857", 
                backgroundColor: "rgba(16, 185, 129, 0.1)", 
                border: "1px solid rgba(16, 185, 129, 0.2)", 
                borderRadius: "1.25rem", 
                padding: "0.875rem 1.25rem", 
                fontWeight: "700" 
              }}
            >
              <span style={{ fontSize: "1.25rem" }}>🛡️</span>
              <span>{product.options.guarantee}</span>
            </div>
          )}

          {/* Subscription Duration Selector */}
          {product.packages.length > 1 && (
            <div>
              <p 
                style={{ 
                  fontSize: "0.75rem", 
                  fontWeight: "700", 
                  color: "#94a3b8", 
                  textTransform: "uppercase", 
                  letterSpacing: "0.05em", 
                  marginBottom: "0.625rem" 
                }}
              >
                {t.duration}
              </p>
              <div className="duration-grid">
                {product.packages.map((p, i) => {
                  const isSelected = selectedPkg === i;
                  return (
                    <button
                      key={p.duration}
                      onClick={() => setSelectedPkg(i)}
                      style={{
                        padding: "0.875rem",
                        borderRadius: "1.25rem",
                        fontSize: "0.875rem",
                        fontWeight: "700",
                        border: isSelected ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(0, 0, 0, 0.08)",
                        backgroundColor: isSelected ? "rgba(16, 185, 129, 0.08)" : "#ffffff",
                        color: isSelected ? "#059669" : "#475569",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: isSelected ? "0 4px 12px rgba(16, 185, 129, 0.08)" : "none",
                        outline: "none"
                      }}
                    >
                      <span style={{ fontWeight: "800" }}>{p.duration}</span>
                      <span style={{ fontSize: "0.75rem", color: isSelected ? "#047857" : "#94a3b8", marginTop: "0.125rem" }}>
                        ৳{p.bdt}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Account Type details */}
          {product.options.share && (
            <div 
              style={{ 
                backgroundColor: "rgba(255, 255, 255, 0.6)", 
                border: "1px solid rgba(0, 0, 0, 0.05)", 
                borderRadius: "1.25rem", 
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem"
              }}
            >
              <p 
                style={{ 
                  fontSize: "0.75rem", 
                  fontWeight: "700", 
                  color: "#94a3b8", 
                  textTransform: "uppercase", 
                  letterSpacing: "0.05em" 
                }}
              >
                {t.accountType}
              </p>
              <p 
                style={{ 
                  fontSize: "0.875rem", 
                  fontWeight: "700", 
                  color: "#334155", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.5rem", 
                  margin: 0 
                }}
              >
                <span style={{ fontSize: "1rem" }}>🔑</span>
                <span>{product.options.share === "Private Account" ? t.privateAccount : t.sharedAccount}</span>
              </p>
            </div>
          )}

          {/* Stock & Sales stats */}
          <div 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "1.25rem", 
              fontSize: "0.75rem", 
              fontWeight: "700", 
              color: "#94a3b8", 
              textTransform: "uppercase", 
              letterSpacing: "0.05em" 
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              📦 {t.stock}: <strong style={{ color: "#475569" }}>{product.stock}</strong>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              🛒 {product.sold} <strong style={{ color: "#475569" }}>{t.sold}</strong>
            </span>
          </div>

          {/* Interactive CTAs */}
          <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem" }}>
            <button
              onClick={handleAdd}
              className={added ? "" : "btn btn-primary"}
              style={added ? {
                flex: 1,
                minHeight: "3.25rem",
                borderRadius: "1.25rem",
                fontSize: "0.875rem",
                fontWeight: "700",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                color: "#059669",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "default"
              } : {
                flex: 1,
                minHeight: "3.25rem",
                borderRadius: "1.25rem",
                fontSize: "0.875rem",
                fontWeight: "700"
              }}
            >
              {added ? "✓ Added to Cart!" : t.addToCart}
            </button>
            <a
              href={`https://wa.me/8801879009680?text=Hi, I'm interested in buying ${name} (${pkg.duration})`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
              style={{
                flex: 1,
                minHeight: "3.25rem",
                borderRadius: "1.25rem",
                fontSize: "0.875rem",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                textDecoration: "none"
              }}
            >
              <span>💬</span>
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Metadata Specifications */}
          <div 
            style={{ 
              borderTop: "1px solid rgba(0, 0, 0, 0.06)", 
              paddingTop: "1rem", 
              display: "flex", 
              flexDirection: "column", 
              gap: "0.375rem", 
              fontSize: "0.75rem", 
              fontWeight: "700", 
              color: "#94a3b8" 
            }}
          >
            <div>
              SKU: <span style={{ color: "#64748b", marginLeft: "0.25rem" }}>OTS-{product.id.toString().padStart(4, "0")}</span>
            </div>
            <div>
              {t.category}: <span style={{ color: "#64748b", marginLeft: "0.25rem" }}>{product.category}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description Panel */}
      <div className="animate-fade-up" style={{ marginTop: "3.5rem" }}>
        <h2 
          style={{ 
            fontSize: "1.125rem", 
            fontWeight: "800", 
            color: "#0f172a", 
            marginBottom: "1rem", 
            letterSpacing: "-0.01em" 
          }}
        >
          {t.description}
        </h2>
        <div 
          style={{ 
            backgroundColor: "#ffffff", 
            border: "1px solid rgba(0, 0, 0, 0.06)", 
            borderRadius: "1.25rem", 
            padding: "1.5rem 1.75rem", 
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.03)" 
          }}
        >
          <div style={{ borderLeft: "3px solid rgba(16, 185, 129, 0.5)", paddingLeft: "1.25rem" }}>
            <p 
              style={{ 
                color: "#475569", 
                fontSize: "0.875rem", 
                whiteSpace: "pre-wrap", 
                lineHeight: "1.6", 
                fontWeight: "500", 
                margin: 0 
              }}
            >
              {desc}
            </p>
          </div>
        </div>
      </div>

      {/* Embedded CSS Style rules for breakpoints */}
      <style dangerouslySetInnerHTML={{ __html: `
        .product-detail-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          width: 100%;
        }
        .duration-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
          width: 100%;
        }
        .hover-green:hover {
          color: #059669 !important;
        }
        @media (min-width: 480px) {
          .duration-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (min-width: 768px) {
          .product-detail-grid {
            grid-template-columns: 3fr 2fr;
          }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .duration-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}} />
    </div>
  );
}

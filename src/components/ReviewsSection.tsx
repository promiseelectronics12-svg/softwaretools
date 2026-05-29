"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/language-context";

interface Review {
  id: number;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ReviewsSection() {
  const { t } = useLang();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ author: "", rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((data) => setReviews(data.reviews || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.review) {
        setReviews([data.review, ...reviews]);
        setForm({ author: "", rating: 5, comment: "" });
        setShowForm(false);
      }
    } catch {}
    setSubmitting(false);
  };

  return (
    <section
      id="reviews"
      style={{
        position: "relative",
        padding: "clamp(2rem,6vw,4rem) 0",
        overflow: "hidden",
      }}
    >
      <div className="container" style={{ position: "relative" }}>
        {/* Header section with clean left heading and right CTA */}
        <div
          className="animate-fade-up"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1.25rem",
            marginBottom: "clamp(1.5rem, 4vw, 2.5rem)",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "clamp(1.375rem, 3.5vw, 2.25rem)",
                fontWeight: 800,
                color: "#0f172a",
                letterSpacing: "-0.025em",
                margin: 0,
              }}
            >
              {t.customerReviews}
            </h2>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
            style={{
              borderRadius: "9999px",
              minHeight: "40px",
              height: "40px",
              padding: "0 1.5rem",
              fontSize: "0.8125rem",
              fontWeight: 700,
              boxShadow: "0 4px 12px rgba(16,185,129,0.15)",
            }}
          >
            {showForm ? "Close Form" : t.writeReview}
          </button>
        </div>

        {/* Review Form - styled premium and responsive */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="card animate-scale-in"
            style={{
              padding: "1.5rem",
              marginBottom: "2.5rem",
              maxWidth: "480px",
              marginInline: "auto",
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(16, 185, 129, 0.15)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div style={{ marginBottom: "1.25rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.6875rem",
                  fontWeight: 800,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "0.5rem",
                }}
              >
                {t.name}
              </label>
              <input
                type="text"
                required
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="input"
                style={{
                  width: "100%",
                  padding: "0.625rem 0.875rem",
                  minHeight: "42px",
                }}
                placeholder="Enter your name"
              />
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.6875rem",
                  fontWeight: 800,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "0.5rem",
                }}
              >
                {t.yourRating}
              </label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm({ ...form, rating: s })}
                    style={{
                      fontSize: "1.75rem",
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      cursor: "pointer",
                      padding: 0,
                      transition: "transform 0.2s ease",
                      color: s <= form.rating ? "#f59e0b" : "#e2e8f0",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.6875rem",
                  fontWeight: 800,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "0.5rem",
                }}
              >
                {t.yourComment}
              </label>
              <textarea
                required
                rows={3}
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                className="input"
                style={{
                  width: "100%",
                  padding: "0.625rem 0.875rem",
                  resize: "none",
                  lineHeight: 1.5,
                }}
                placeholder="Write your review here..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-full"
              style={{
                minHeight: "44px",
                borderRadius: "var(--radius-md)",
                fontSize: "0.875rem",
                fontWeight: 700,
              }}
            >
              {submitting ? "Submitting..." : t.submitReview}
            </button>
          </form>
        )}

        {/* Reviews Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
            gap: "1.25rem",
          }}
        >
          {reviews.map((r, i) => (
            <div
              key={r.id}
              className="card animate-fade-up"
              style={{
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                animationDelay: `${i * 60}ms`,
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(0, 0, 0, 0.04)",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "0.75rem",
                      background: "rgba(16, 185, 129, 0.1)",
                      border: "1px solid rgba(16, 185, 129, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#059669",
                      fontWeight: 800,
                      fontSize: "0.875rem",
                    }}
                  >
                    {r.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "0.875rem", color: "#0f172a" }}>
                      {r.author}
                    </p>
                    <div style={{ display: "flex", gap: "2px", marginTop: "0.25rem" }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <svg
                          key={s}
                          style={{
                            width: 14,
                            height: 14,
                            color: s <= r.rating ? "#f59e0b" : "#e2e8f0",
                            fill: "currentColor",
                          }}
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.875rem",
                    color: "#475569",
                    lineHeight: 1.6,
                    fontWeight: 500,
                  }}
                >
                  {r.comment}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {reviews.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
            <p style={{ fontSize: "2.5rem", margin: "0 0 1rem 0" }}>💬</p>
            <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#94a3b8", margin: 0 }}>
              No reviews yet. Be the first to leave one!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

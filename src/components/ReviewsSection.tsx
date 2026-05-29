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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 animate-fade-up">
        <div>
          <h2
            style={{ fontSize: "clamp(1.25rem, 3.5vw, 1.85rem)" }}
            className="font-extrabold text-slate-800 tracking-tight"
          >
            {t.customerReviews}
          </h2>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary !text-xs !py-2.5 !px-5 !min-height-[40px] shadow-sm cursor-pointer">
          {t.writeReview}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mb-8 max-w-lg mx-auto animate-scale-in">
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">{t.name}</label>
            <input type="text" required value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="input-dark" />
          </div>
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">{t.yourRating}</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, rating: s })}
                  className={`text-3xl transition-transform duration-200 hover:scale-125 w-11 h-11 flex items-center justify-center p-1 rounded-xl cursor-pointer ${s <= form.rating ? "text-amber-400 bg-amber-50" : "text-slate-200 hover:bg-slate-50"}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">{t.yourComment}</label>
            <textarea required rows={3} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} className="input-dark resize-none" />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-50 cursor-pointer shadow-md shadow-green-500/10">
            {submitting ? "..." : t.submitReview}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {reviews.map((r, i) => (
          <div key={r.id} className="card p-5 flex flex-col justify-between animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-600 font-extrabold text-sm">
                  {r.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-800 leading-none">{r.author}</p>
                  <div className="flex gap-0.5 mt-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? "text-amber-400" : "text-slate-200"} fill-current`} viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">{r.comment}</p>
            </div>
          </div>
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">💬</p>
          <p className="text-sm font-bold text-slate-400">No reviews yet. Be the first to leave one!</p>
        </div>
      )}
    </section>
  );
}

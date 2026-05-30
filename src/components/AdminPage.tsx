"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import GuidesTab from "./GuidesTab";
Chart.register(...registerables);

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */
interface SessionUser { id: number; name: string; email: string; role: string; }

interface Product {
  id: number; nameEn: string; nameBn: string;
  shortDescEn: string; shortDescBn: string;
  fullDescEn: string; fullDescBn: string;
  image: string; icon: string; iconBg: string;
  category: string; tags: string[];
  stock: number; sold: number; isTop: boolean;
  packages: { duration: string; usdt: number; bdt: number }[];
  options: { guarantee: string; share: string; duration: string; accountType: string };
}

interface Order {
  id: number; orderCode: string; totalBdt: number; totalUsdt: number;
  status: string; paymentMethod: string; trxId: string;
  phone: string; note?: string | null; createdAt: string;
  items: { nameEn: string; priceBdt: number; priceUsdt: number; duration: string; icon: string; iconBg: string }[];
}

interface Review {
  id: number; author: string; rating: number; comment: string; createdAt: string;
}

interface Credential {
  id: number; orderId: number | null; orderCode: string; phone: string;
  productName: string; duration: string; username: string; password: string;
  notes: string; totpSecret: string | null; startDate: string; expiryDate: string;
  isReclaimed: boolean; createdAt: string;
}

interface SupportMessage {
  id: number; phone: string; token: string | null;
  message: string; isResolved: boolean; adminNote: string; createdAt: string;
}

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */
const STATUS_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  pending:   { bg: "#fffbeb", text: "#b45309", border: "#fde68a", dot: "#f59e0b" },
  verified:  { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe", dot: "#3b82f6" },
  completed: { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0", dot: "#10b981" },
  failed:    { bg: "#fef2f2", text: "#b91c1c", border: "#fecaca", dot: "#ef4444" },
};

const CATEGORIES = ["AI Tools", "Streaming", "Educational", "Microsoft Office", "Design Tools", "VPN & Security", "SEO Tools"];

const DURATION_DAYS: Record<string, number> = {
  "1 Month": 30, "3 Months": 90, "6 Months": 180,
  "1 Year": 365, "2 Years": 730, "Lifetime": 3650,
};

function parseDurationDays(duration: string): number {
  for (const [key, val] of Object.entries(DURATION_DAYS)) {
    if (duration.toLowerCase().includes(key.toLowerCase().split(" ")[0]) &&
        duration.toLowerCase().includes(key.toLowerCase().split(" ")[1] || "")) return val;
  }
  const match = duration.match(/(\d+)\s*(month|year|day)/i);
  if (match) {
    const n = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    if (unit.startsWith("month")) return n * 30;
    if (unit.startsWith("year")) return n * 365;
    return n;
  }
  return 30;
}

/* ─────────────────────────────────────────
   SHARED STYLES
───────────────────────────────────────── */
const INP: React.CSSProperties = {
  width: "100%", height: 42, padding: "0 0.875rem",
  background: "#f8fafc", border: "1.5px solid #e2e8f0",
  borderRadius: "0.75rem", fontSize: "0.875rem",
  fontFamily: "inherit", color: "#0f172a",
  outline: "none", boxSizing: "border-box",
};

const LABEL: React.CSSProperties = {
  display: "block", fontSize: "0.6875rem", fontWeight: 700,
  color: "#64748b", textTransform: "uppercase",
  letterSpacing: "0.06em", marginBottom: "0.4rem",
};

const BTN = (variant: "green" | "blue" | "red" | "ghost" | "yellow"): React.CSSProperties => {
  const map = {
    green:  { bg: "linear-gradient(135deg,#00c853,#059669)", color: "#fff",     border: "transparent" },
    blue:   { bg: "#eff6ff",                                 color: "#1d4ed8",  border: "#bfdbfe" },
    red:    { bg: "#fef2f2",                                 color: "#b91c1c",  border: "#fecaca" },
    ghost:  { bg: "#f8fafc",                                 color: "#475569",  border: "#e2e8f0" },
    yellow: { bg: "#fffbeb",                                 color: "#b45309",  border: "#fde68a" },
  }[variant];
  return {
    height: 34, padding: "0 0.875rem", borderRadius: "0.625rem",
    background: map.bg, color: map.color, border: `1px solid ${map.border}`,
    fontSize: "0.75rem", fontWeight: 700, cursor: "pointer",
    fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0,
  };
};

/* ─────────────────────────────────────────
   CSV EXPORT
───────────────────────────────────────── */
function exportOrdersCSV(orders: Order[]) {
  const header = "orderCode,createdAt,phone,paymentMethod,trxId,status,totalBdt,totalUsdt,items";
  const rows = orders.map((o) => {
    const items = o.items.map((it) => `${it.nameEn} (${it.duration})`).join("; ");
    return [o.orderCode, new Date(o.createdAt).toISOString(), o.phone || "", o.paymentMethod, o.trxId || "", o.status, o.totalBdt, o.totalUsdt, `"${items}"`].join(",");
  });
  const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/* ─────────────────────────────────────────
   TOAST
───────────────────────────────────────── */
function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "warn" } | null>(null);
  const show = useCallback((msg: string, type: "success" | "error" | "warn" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);
  return { toast, show };
}

/* ─────────────────────────────────────────
   CREDENTIAL HELPERS
───────────────────────────────────────── */
function getCredStatus(cred: Credential): "reclaimed" | "expired" | "expiring" | "active" {
  if (cred.isReclaimed) return "reclaimed";
  const diff = new Date(cred.expiryDate).getTime() - Date.now();
  if (diff < 0) return "expired";
  if (diff < 7 * 86400000) return "expiring";
  return "active";
}

function getCredCountdown(cred: Credential): string {
  const diff = new Date(cred.expiryDate).getTime() - Date.now();
  const days = Math.abs(Math.floor(diff / 86400000));
  if (diff < 0) return `Expired ${days}d ago`;
  if (days === 0) return "Expires today!";
  return `${days}d left`;
}

/* ─────────────────────────────────────────
   ADMIN LOGIN
───────────────────────────────────────── */
function AdminLoginForm({ onLogin }: { onLogin: (user: SessionUser) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (data.user) onLogin(data.user);
      else setError(data.error || "Invalid credentials");
    } catch { setError("Connection error. Please try again."); }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = { width: "100%", height: 46, padding: "0 1rem", background: "rgba(255,255,255,0.07)", border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: "0.875rem", color: "#f1f5f9", fontSize: "0.9375rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f2217 100%)", padding: "1.5rem", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: "radial-gradient(ellipse,rgba(16,185,129,0.08) 0%,transparent 70%)", pointerEvents: "none" }} />
      <div style={{ width: "100%", maxWidth: 400, position: "relative" }}>
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ width: 60, height: 60, borderRadius: "1.375rem", background: "linear-gradient(135deg,#00c853,#059669)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.125rem", boxShadow: "0 8px 32px rgba(16,185,129,0.3)" }}>
            <svg width="28" height="28" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h1 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em", margin: 0 }}>Official Tool Store Admin</h1>
          <p style={{ fontSize: "0.8125rem", color: "#475569", fontWeight: 500, marginTop: "0.375rem" }}>Sign in to the control panel</p>
        </div>

        {/* Card */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "1.5rem", padding: "2rem 2rem 1.75rem", backdropFilter: "blur(20px)", boxShadow: "0 24px 64px rgba(0,0,0,0.4)" }}>
          {error && (
            <div style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: "0.875rem", padding: "0.875rem 1rem", marginBottom: "1.375rem", color: "#fca5a5", fontSize: "0.875rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              ⚠️ {error}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: "0.5rem" }}>Email</label>
              <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: "0.5rem" }}>Password</label>
              <div style={{ position: "relative" }}>
                <input type={showPass ? "text" : "password"} required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ ...inputStyle, paddingRight: "3rem" }} />
                <button type="button" onClick={() => setShowPass((v) => !v)} style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: "1rem", padding: 0, lineHeight: 1 }}>
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ height: 50, background: loading ? "rgba(16,185,129,0.45)" : "linear-gradient(135deg,#00c853,#059669)", border: "none", borderRadius: "0.9375rem", color: "#fff", fontSize: "1rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", marginTop: "0.25rem", boxShadow: loading ? "none" : "0 6px 20px rgba(16,185,129,0.3)", transition: "all 0.15s", letterSpacing: "0.01em" }}>
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>
        </div>
        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.75rem", color: "#334155", fontWeight: 500 }}>🔒 Authorized personnel only</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ─────────────────────────────────────────
   AUDIO / NOTIFICATIONS
───────────────────────────────────────── */
function playNotificationSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.6);
  } catch {}
}

function showDesktopNotification(phone: string, message: string) {
  if (typeof window === "undefined" || Notification.permission !== "granted") return;
  new Notification("📩 New Support Message", {
    body: `From ${phone}: ${message.slice(0, 80)}${message.length > 80 ? "..." : ""}`,
    icon: "/favicon.ico",
  });
}

function showOrderNotification(orderCode: string, phone: string, totalBdt: number) {
  if (typeof window === "undefined" || Notification.permission !== "granted") return;
  new Notification("🛒 New Order Received", {
    body: `${orderCode} — ৳${totalBdt.toLocaleString()}${phone ? ` from ${phone}` : ""}`,
    icon: "/favicon.ico",
  });
}

/* ─────────────────────────────────────────
   CONFIRM MODAL
───────────────────────────────────────── */
interface ConfirmDialogState {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onYes: () => void;
}

function ConfirmModal({ dialog, onClose }: { dialog: ConfirmDialogState; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)", padding: "1rem" }}>
      <div style={{ background: "#fff", borderRadius: "1.25rem", padding: "2rem", maxWidth: 420, width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.18)", animation: "modalIn 0.18s ease" }}>
        <div style={{ width: 48, height: 48, borderRadius: "0.875rem", background: dialog.danger ? "#fef2f2" : "#f0fdf4", border: `1.5px solid ${dialog.danger ? "#fecaca" : "#bbf7d0"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.375rem", marginBottom: "1.25rem" }}>
          {dialog.danger ? "⚠️" : "💡"}
        </div>
        <h2 style={{ fontWeight: 800, fontSize: "1.0625rem", color: "#0f172a", marginBottom: "0.5rem" }}>{dialog.title}</h2>
        <p style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.6, marginBottom: "1.75rem" }}>{dialog.message}</p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ height: 40, padding: "0 1.25rem", borderRadius: "0.75rem", background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#475569", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={() => { dialog.onYes(); onClose(); }} style={{ height: 40, padding: "0 1.25rem", borderRadius: "0.75rem", background: dialog.danger ? "#dc2626" : "linear-gradient(135deg,#00c853,#059669)", border: "none", color: "#fff", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            {dialog.confirmLabel || (dialog.danger ? "Delete" : "Confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   SLIDE-IN DRAWER
───────────────────────────────────────── */
function Drawer({ open, onClose, title, width = 560, children }: { open: boolean; onClose: () => void; title: string; width?: number; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 8000, display: "flex", justifyContent: "flex-end" }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(2px)" }} />
      {/* Panel */}
      <div style={{ position: "relative", width: Math.min(width, window.innerWidth), background: "#fff", height: "100%", overflowY: "auto", boxShadow: "-8px 0 40px rgba(0,0,0,0.14)", display: "flex", flexDirection: "column", animation: "drawerIn 0.22s ease" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.375rem 1.5rem", borderBottom: "1px solid #f1f5f9", background: "#fff", position: "sticky", top: 0, zIndex: 1 }}>
          <h2 style={{ fontWeight: 800, fontSize: "1.0625rem", color: "#0f172a", margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: "0.625rem", background: "#f8fafc", border: "1px solid #e2e8f0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "1.125rem", fontFamily: "inherit" }}>✕</button>
        </div>
        {/* Content */}
        <div style={{ padding: "1.5rem", flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   COPY HELPER
───────────────────────────────────────── */
async function copyToClipboard(text: string) {
  try { await navigator.clipboard.writeText(text); } catch {}
}

/* ─────────────────────────────────────────
   ADMIN DASHBOARD
───────────────────────────────────────── */
type TabType = "orders" | "products" | "analytics" | "credentials" | "reviews" | "support" | "staff" | "links" | "settings" | "guides";

/** Super User has full control; legacy "admin" role is treated as Super User. */
function roleIsSuper(role: string): boolean {
  return role === "superuser" || role === "admin";
}

const ROLE_LABEL: Record<string, string> = {
  superuser: "Super User",
  admin: "Super User",
  moderator: "Moderator",
};

interface StaffMember { id: number; name: string; email: string; role: string; createdAt: string; }

function AdminDashboard({ admin, onLogout }: { admin: SessionUser; onLogout: () => void }) {
  const { toast, show: showToast } = useToast();
  const isSuper = roleIsSuper(admin.role);
  const [tab, setTab] = useState<TabType>("orders");
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  /* ── Data ── */
  const [products, setProducts]         = useState<Product[]>([]);
  const [orders, setOrders]             = useState<Order[]>([]);
  const [reviews, setReviews]           = useState<Review[]>([]);
  const [credentials, setCredentials]   = useState<Credential[]>([]);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading]           = useState(true);

  /* ── Orders state ── */
  const [orderSearch, setOrderSearch]       = useState("");
  const [filterStatus, setFilterStatus]     = useState("all");
  const [selectedOrders, setSelectedOrders] = useState<Set<number>>(new Set());
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  const [ordersPage, setOrdersPage]         = useState(1);

  /* ── Single-Item Delivery Modal ── */
  const [deliverTarget, setDeliverTarget] = useState<{ order: Order; itemIdx: number } | null>(null);
  const [deliverForm, setDeliverForm] = useState({ username: "", password: "", totpSecret: "", notes: "", expiryDate: "", showTotp: false, showNotes: false, showPass: false });
  const [quickDelivering, setQuickDelivering] = useState(false);
  const [copiedCredId, setCopiedCredId]       = useState<number | null>(null);

  /* ── Products state ── */
  const [productSearch, setProductSearch]   = useState("");
  const [filterCat, setFilterCat]           = useState("all");
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editProduct, setEditProduct]       = useState<Product | null>(null);
  const [saving, setSaving]                 = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [formErrors, setFormErrors]         = useState<Record<string, string>>({});
  const [stockEdits, setStockEdits]         = useState<Record<number, string>>({});
  const [productForm, setProductForm]       = useState({
    nameEn: "", nameBn: "", shortDescEn: "", shortDescBn: "",
    fullDescEn: "", fullDescBn: "", image: "", icon: "📦",
    iconBg: "#e8f5e9", category: "AI Tools", stock: 100, tags: "",
    packages: [{ duration: "1 Month", usdt: 0, bdt: 0 }],
    guarantee: "100% Replacement Warranty", share: "Private Account", isTop: false,
  });

  /* ── Credentials state ── */
  const [credSearch, setCredSearch]         = useState("");
  const [credFilter, setCredFilter]         = useState<"all" | "active" | "expiring" | "expired" | "reclaimed">("all");
  const [showAddCred, setShowAddCred]       = useState(false);
  const [assignOrderId, setAssignOrderId]   = useState<Order | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Set<number>>(new Set());
  const [credsPage, setCredsPage]           = useState(1);
  const [credForm, setCredForm]             = useState({ orderCode: "", phone: "", productName: "", duration: "1 Month", username: "", password: "", notes: "", totpSecret: "", expiryDate: "" });
  const [totpTest, setTotpTest]             = useState<{ code: string; loading: boolean }>({ code: "", loading: false });

  /* ── Support state ── */
  const [supportNotes, setSupportNotes]     = useState<Record<number, string>>({});
  const [supportSearch, setSupportSearch]   = useState("");

  /* ── Staff state (Super User only) ── */
  const [staff, setStaff]                   = useState<StaffMember[]>([]);
  const [showAddStaff, setShowAddStaff]     = useState(false);
  const [staffSaving, setStaffSaving]       = useState(false);
  const [staffForm, setStaffForm]           = useState({ name: "", email: "", password: "", role: "moderator" });

  /* ── Confirm dialog ── */
  const [dialog, setDialog] = useState<ConfirmDialogState | null>(null);
  const showConfirm = useCallback((title: string, message: string, onYes: () => void, opts?: { confirmLabel?: string; danger?: boolean }) => {
    setDialog({ title, message, onYes, confirmLabel: opts?.confirmLabel, danger: opts?.danger ?? true });
  }, []);

  /* ── Refs ── */
  const pollingRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const chartRef      = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const stockChartRef      = useRef<HTMLCanvasElement | null>(null);
  const stockChartInstance = useRef<Chart | null>(null);
  // Highest IDs already seen — used to detect genuinely new orders/messages
  // when polling, so we notify once (and dedupe against SSE pushes).
  const lastOrderId   = useRef<number>(0);
  const lastMsgId     = useRef<number>(0);
  const primed        = useRef<boolean>(false);

  const PAGE_SIZE = 20;

  /* ── adminFetch ── */
  const adminFetch = useCallback(async (url: string, opts?: RequestInit) => {
    const res = await fetch(url, opts);
    if (res.status === 401) {
      showToast("Session expired. Please log in again.", "error");
      setTimeout(() => window.location.reload(), 2000);
    }
    return res;
  }, [showToast]);

  /* ── Load data ── */
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [proRes, ordRes, revRes, credRes, supRes] = await Promise.all([
        adminFetch("/api/products"), adminFetch("/api/orders"),
        adminFetch("/api/reviews"), adminFetch("/api/credentials"), adminFetch("/api/support"),
      ]);
      const [proData, ordData, revData, credData, supData] = await Promise.all([
        proRes.json(), ordRes.json(), revRes.json(), credRes.json(), supRes.json(),
      ]);
      setProducts(proData.products || []);
      const loadedOrders: Order[] = ordData.orders || [];
      setOrders(loadedOrders);
      // Prime the "highest seen" markers from existing data so we only
      // notify for things that arrive AFTER the panel is open.
      lastOrderId.current = loadedOrders.reduce((m, o) => Math.max(m, o.id), 0);
      lastMsgId.current = (supData.messages || []).reduce((m: number, x: SupportMessage) => Math.max(m, x.id), 0);
      primed.current = true;
      setReviews((revData.reviews || []).sort((a: Review, b: Review) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setCredentials(credData.credentials || []);
      setSupportMessages((supData.messages || []) as SupportMessage[]);
      if (isSuper) {
        const staffRes = await adminFetch("/api/users");
        const staffData = await staffRes.json();
        setStaff((staffData.users || []) as StaffMember[]);
      }
    } catch {}
    setLoading(false);
  }, [adminFetch, isSuper]);

  useEffect(() => { loadData(); }, [loadData]);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.metaKey || e.ctrlKey) return;
      if (e.key === "r" || e.key === "R") { e.preventDefault(); loadData(); showToast("Refreshed"); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [loadData, showToast]);

  /* ── SSE for real-time (single-process / VPS only) ── */
  useEffect(() => {
    if (typeof window !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
    const es = new EventSource("/api/support/stream");
    es.addEventListener("new_message", (e) => {
      try {
        const msg: SupportMessage = JSON.parse(e.data);
        if (msg.id <= lastMsgId.current) return; // already seen via poll
        lastMsgId.current = msg.id;
        setSupportMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [msg, ...prev]);
        playNotificationSound();
        showDesktopNotification(msg.phone, msg.message);
      } catch {}
    });
    es.addEventListener("new_order", (e) => {
      try {
        const o = JSON.parse(e.data) as { id: number; orderCode: string; phone: string; totalBdt: number };
        if (o.id <= lastOrderId.current) return;
        lastOrderId.current = o.id;
        playNotificationSound();
        showOrderNotification(o.orderCode, o.phone, o.totalBdt);
        showToast(`🛒 New order ${o.orderCode}`);
        loadData(); // pull the full order record
      } catch {}
    });
    es.onerror = () => {};
    return () => es.close();
  }, [showToast, loadData]);

  /* ── Polling (authoritative real-time on serverless) ──
     Runs globally regardless of the active tab so new orders and support
     messages surface — with sound + desktop notification — without a reload. */
  useEffect(() => {
    const poll = async () => {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const [ordRes, supRes] = await Promise.all([
          adminFetch("/api/orders"),
          adminFetch("/api/support"),
        ]);
        const ordData = await ordRes.json();
        const supData = await supRes.json();

        if (Array.isArray(ordData.orders)) {
          const newOrders: Order[] = ordData.orders;
          if (primed.current) {
            const fresh = newOrders.filter((o) => o.id > lastOrderId.current);
            if (fresh.length) {
              playNotificationSound();
              const top = fresh.reduce((a, b) => (a.id > b.id ? a : b));
              showOrderNotification(top.orderCode, top.phone || "", top.totalBdt);
              showToast(fresh.length === 1 ? `🛒 New order ${top.orderCode}` : `🛒 ${fresh.length} new orders`);
            }
          }
          lastOrderId.current = newOrders.reduce((m, o) => Math.max(m, o.id), lastOrderId.current);
          setOrders(newOrders);
        }

        if (Array.isArray(supData.messages)) {
          const newMsgs: SupportMessage[] = supData.messages;
          if (primed.current) {
            const fresh = newMsgs.filter((m) => m.id > lastMsgId.current);
            if (fresh.length) {
              playNotificationSound();
              const top = fresh.reduce((a, b) => (a.id > b.id ? a : b));
              showDesktopNotification(top.phone, top.message);
            }
          }
          lastMsgId.current = newMsgs.reduce((m, x) => Math.max(m, x.id), lastMsgId.current);
          setSupportMessages(newMsgs);
        }
      } catch {}
    };
    pollingRef.current = setInterval(poll, 12000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [adminFetch, showToast]);

  /* ── Analytics chart ── */
  useEffect(() => {
    if (tab !== "analytics" || !chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();
    const completedOrders = orders.filter((o) => o.status === "completed");
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });
    chartInstance.current = new Chart(chartRef.current, {
      type: "bar",
      data: {
        labels: last7.map((d) => new Date(d).toLocaleDateString("en", { month: "short", day: "numeric" })),
        datasets: [{ label: "Revenue (BDT)", data: last7.map((day) => completedOrders.filter((o) => o.createdAt.startsWith(day)).reduce((s, o) => s + o.totalBdt, 0)), backgroundColor: "rgba(16,185,129,0.15)", borderColor: "#10b981", borderWidth: 2, borderRadius: 8 }],
      },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.04)" }, ticks: { color: "#94a3b8" } }, x: { grid: { display: false }, ticks: { color: "#94a3b8" } } } },
    });
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [tab, orders]);

  /* ── Stock alert chart ── */
  useEffect(() => {
    if (tab !== "analytics" || !stockChartRef.current || products.length === 0) return;
    if (stockChartInstance.current) stockChartInstance.current.destroy();
    const sorted = [...products].sort((a, b) => a.stock - b.stock).slice(0, 15);
    const colors = sorted.map((p) =>
      p.stock < 5  ? "rgba(239,68,68,0.75)"  :
      p.stock < 10 ? "rgba(245,158,11,0.75)" :
      p.stock < 20 ? "rgba(251,191,36,0.5)"  :
                     "rgba(16,185,129,0.45)"
    );
    const borders = sorted.map((p) =>
      p.stock < 5  ? "#ef4444" :
      p.stock < 10 ? "#f59e0b" :
      p.stock < 20 ? "#fbbf24" :
                     "#10b981"
    );
    stockChartInstance.current = new Chart(stockChartRef.current, {
      type: "bar",
      data: {
        labels: sorted.map((p) => p.nameEn.length > 22 ? p.nameEn.slice(0, 20) + "…" : p.nameEn),
        datasets: [{
          label: "Stock",
          data: sorted.map((p) => p.stock),
          backgroundColor: colors,
          borderColor: borders,
          borderWidth: 1.5,
          borderRadius: 6,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => ` Stock: ${ctx.parsed.x}` } },
        },
        scales: {
          x: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.04)" }, ticks: { color: "#94a3b8", stepSize: 5 } },
          y: { grid: { display: false }, ticks: { color: "#475569", font: { size: 11, weight: 600 } } },
        },
      },
    });
    return () => { if (stockChartInstance.current) stockChartInstance.current.destroy(); };
  }, [tab, products]);

  /* ── Derived ── */
  const deliveredOrderCodes = new Set(credentials.map((c) => c.orderCode));

  const filteredOrders = orders
    .filter((o) => filterStatus === "all" || o.status === filterStatus)
    .filter((o) => {
      if (!orderSearch) return true;
      const q = orderSearch.toLowerCase();
      return o.orderCode.toLowerCase().includes(q) || (o.phone || "").includes(q) || (o.trxId || "").toLowerCase().includes(q);
    });

  const paginatedOrders  = filteredOrders.slice(0, ordersPage * PAGE_SIZE);
  const hasMoreOrders    = filteredOrders.length > ordersPage * PAGE_SIZE;
  const pendingCount     = orders.filter((o) => o.status === "pending").length;
  const lowStockProducts = products.filter((p) => p.stock < 10 && p.stock >= 0);

  const filteredCreds = credentials
    .filter((c) => credFilter === "all" || getCredStatus(c) === credFilter)
    .filter((c) => {
      if (!credSearch) return true;
      const q = credSearch.toLowerCase();
      return c.orderCode.toLowerCase().includes(q) || c.phone.includes(q) || c.productName.toLowerCase().includes(q);
    });
  const paginatedCreds = filteredCreds.slice(0, credsPage * PAGE_SIZE);
  const hasMoreCreds   = filteredCreds.length > credsPage * PAGE_SIZE;
  const urgentCreds    = credentials.filter((c) => { const s = getCredStatus(c); return s === "expired" || s === "expiring"; }).length;
  const unresolvedCount = supportMessages.filter((m) => !m.isResolved).length;

  const completedOrders = orders.filter((o) => o.status === "completed");
  const totalRevBdt     = completedOrders.reduce((s, o) => s + o.totalBdt, 0);
  const totalRevUsdt    = completedOrders.reduce((s, o) => s + o.totalUsdt, 0);
  const avgOrderBdt     = completedOrders.length ? Math.round(totalRevBdt / completedOrders.length) : 0;
  const topProducts     = [...products].sort((a, b) => b.sold - a.sold).slice(0, 5);

  /* ── Order actions ── */
  const updateOrderStatus = async (orderId: number, status: string) => {
    const res = await adminFetch(`/api/orders/${orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    const data = await res.json();
    if (data.order) { setOrders((prev) => prev.map((o) => o.id === orderId ? data.order : o)); showToast(`Order marked ${status}`); }
  };

  const handleBulkAction = async (status: string) => {
    await Promise.all([...selectedOrders].map((id) => updateOrderStatus(id, status)));
    setSelectedOrders(new Set());
    showToast(`${selectedOrders.size} orders marked ${status}`);
  };

  const toggleSelectOrder = (id: number) => setSelectedOrders((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const toggleSelectAll   = () => selectedOrders.size === filteredOrders.length ? setSelectedOrders(new Set()) : setSelectedOrders(new Set(filteredOrders.map((o) => o.id)));
  const toggleExpandOrder = (id: number) => setExpandedOrders((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  /* ── Quick Deliver ── */
  const openDeliverModal = (order: Order, itemIdx: number) => {
    const item = order.items[itemIdx];
    const days = parseDurationDays(item?.duration || "1 Month");
    const expiry = new Date(Date.now() + days * 86400000).toISOString().split("T")[0];
    setDeliverForm({ username: "", password: "", totpSecret: "", notes: "", expiryDate: expiry, showTotp: false, showNotes: false, showPass: false });
    setDeliverTarget({ order, itemIdx });
  };

  const handleSingleDeliver = async () => {
    if (!deliverTarget) return;
    const { order, itemIdx } = deliverTarget;
    const item = order.items[itemIdx];
    if (!deliverForm.username.trim() || !deliverForm.password.trim()) {
      showToast("Username and password are required", "error"); return;
    }
    setQuickDelivering(true);
    try {
      const credRes = await adminFetch("/api/credentials", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id, orderCode: order.orderCode,
          phone: order.phone || "",
          productName: item.nameEn, duration: item.duration,
          username: deliverForm.username.trim(), password: deliverForm.password.trim(),
          notes: deliverForm.notes.trim(),
          totpSecret: deliverForm.totpSecret.trim() || null,
          startDate: new Date().toISOString(),
          expiryDate: new Date(deliverForm.expiryDate).toISOString(),
        }),
      });
      const credData = await credRes.json();
      if (!credData.credential) { showToast(`Failed to save credential`, "error"); setQuickDelivering(false); return; }

      const allCreds = [...credentials, credData.credential];
      setCredentials(allCreds);

      // Check if all items now delivered → complete the order
      const deliveredNames = new Set(allCreds.filter((c) => c.orderCode === order.orderCode).map((c) => c.productName));
      const allDone = order.items.every((it) => deliveredNames.has(it.nameEn));
      const newStatus = allDone ? "completed" : "verified";
      const ordRes = await adminFetch(`/api/orders/${order.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
      const ordData = await ordRes.json();
      if (ordData.order) setOrders((prev) => prev.map((o) => o.id === order.id ? ordData.order : o));

      setDeliverTarget(null);
      if (allDone) showToast(`✓ All credentials delivered — order complete!`);
      else {
        const remaining = order.items.length - deliveredNames.size;
        showToast(`✓ ${item.nameEn} delivered — ${remaining} item${remaining !== 1 ? "s" : ""} remaining`, "warn");
      }
    } catch { showToast("Delivery failed", "error"); }
    setQuickDelivering(false);
  };

  /* ── Product actions ── */
  const resetForm = () => setProductForm({ nameEn: "", nameBn: "", shortDescEn: "", shortDescBn: "", fullDescEn: "", fullDescBn: "", image: "", icon: "📦", iconBg: "#e8f5e9", category: "AI Tools", stock: 100, tags: "", packages: [{ duration: "1 Month", usdt: 0, bdt: 0 }], guarantee: "100% Replacement Warranty", share: "Private Account", isTop: false });

  const startEdit = (p: Product) => {
    setEditProduct(p);
    setProductForm({ nameEn: p.nameEn, nameBn: p.nameBn, shortDescEn: p.shortDescEn || "", shortDescBn: p.shortDescBn || "", fullDescEn: p.fullDescEn || "", fullDescBn: p.fullDescBn || "", image: p.image, icon: p.icon, iconBg: p.iconBg, category: p.category, stock: p.stock, tags: (p.tags || []).join(", "), packages: p.packages?.length ? p.packages : [{ duration: "1 Month", usdt: 0, bdt: 0 }], guarantee: p.options?.guarantee || "", share: p.options?.share || "Private Account", isTop: p.isTop });
    setShowAddProduct(true); setFormErrors({});
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!productForm.nameEn.trim()) errs.nameEn = "Required";
    if (!productForm.nameBn.trim()) errs.nameBn = "Required";
    setFormErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      const method = editProduct ? "PUT" : "POST";
      const url    = editProduct ? `/api/products/${editProduct.id}` : "/api/products";
      const tags   = productForm.tags.split(",").map((t) => t.trim()).filter(Boolean);
      const res    = await adminFetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...productForm, tags, options: { guarantee: productForm.guarantee, share: productForm.share, duration: productForm.packages[0]?.duration || "1 Month", accountType: "Premium Activated" } }) });
      const data   = await res.json();
      if (data.product) {
        if (editProduct) setProducts((prev) => prev.map((p) => p.id === editProduct.id ? data.product : p));
        else setProducts((prev) => [...prev, data.product]);
        setShowAddProduct(false); setEditProduct(null); resetForm();
        showToast(editProduct ? "Product updated!" : "Product added!");
      }
    } catch { showToast("Save failed", "error"); }
    setSaving(false);
  };

  const deleteProduct = (id: number) => {
    showConfirm("Delete Product", "This product will be permanently removed. This cannot be undone.", async () => {
      await adminFetch(`/api/products/${id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast("Product deleted", "warn");
    }, { confirmLabel: "Delete Product" });
  };

  const toggleIsTop = async (p: Product) => {
    const res = await adminFetch(`/api/products/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isTop: !p.isTop }) });
    if (res.ok) {
      setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, isTop: !x.isTop } : x));
      showToast(p.isTop ? `${p.nameEn} removed from Top` : `${p.nameEn} pinned to Top 🔥`);
    }
  };

  const updateStock = async (p: Product) => {
    const val = parseInt(stockEdits[p.id] ?? String(p.stock));
    if (isNaN(val) || val < 0) { showToast("Invalid stock value", "error"); return; }
    const res = await adminFetch(`/api/products/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stock: val }) });
    const data = await res.json();
    if (data.product) { setProducts((prev) => prev.map((pr) => pr.id === p.id ? data.product : pr)); showToast(`Stock updated`); }
  };

  const addPackage    = () => setProductForm((f) => ({ ...f, packages: [...f.packages, { duration: "1 Month", usdt: 0, bdt: 0 }] }));
  const removePackage = (i: number) => setProductForm((f) => ({ ...f, packages: f.packages.filter((_, idx) => idx !== i) }));
  const updatePkg     = (i: number, field: string, val: string | number) => setProductForm((f) => { const pkgs = [...f.packages]; pkgs[i] = { ...pkgs[i], [field]: val }; return { ...f, packages: pkgs }; });

  /* ── Review actions ── */
  const deleteReview = (id: number) => {
    showConfirm("Delete Review", "This review will be permanently removed.", async () => {
      await adminFetch(`/api/reviews/${id}`, { method: "DELETE" });
      setReviews((prev) => prev.filter((r) => r.id !== id));
      showToast("Review deleted", "warn");
    }, { confirmLabel: "Delete Review" });
  };

  /* ── Credential actions ── */
  const openAddCred = (order?: Order) => {
    if (order) {
      const firstItem = order.items[0];
      const dur  = firstItem?.duration || "1 Month";
      const expiry = new Date(Date.now() + parseDurationDays(dur) * 86400000).toISOString().split("T")[0];
      setCredForm({ orderCode: order.orderCode, phone: order.phone || "", productName: firstItem?.nameEn || "", duration: dur, username: "", password: "", notes: "", totpSecret: "", expiryDate: expiry });
      setAssignOrderId(order);
    } else {
      const expiry = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
      setCredForm({ orderCode: "", phone: "", productName: "", duration: "1 Month", username: "", password: "", notes: "", totpSecret: "", expiryDate: expiry });
      setAssignOrderId(null);
    }
    setShowAddCred(true);
  };

  const saveCred = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await adminFetch("/api/credentials", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: assignOrderId?.id || null, orderCode: credForm.orderCode, phone: credForm.phone, productName: credForm.productName, duration: credForm.duration, username: credForm.username, password: credForm.password, notes: credForm.notes, totpSecret: credForm.totpSecret.trim() || null, startDate: new Date().toISOString(), expiryDate: new Date(credForm.expiryDate).toISOString() }) });
    const data = await res.json();
    if (data.credential) { setCredentials((prev) => [...prev, data.credential]); setShowAddCred(false); showToast("Credential saved!"); }
    else showToast("Failed to save credential", "error");
  };

  const reclaimCred = (id: number) => {
    showConfirm("Reclaim Credential", "This will mark the credential as reclaimed and remove customer access.", async () => {
      const res  = await adminFetch(`/api/credentials/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isReclaimed: true }) });
      const data = await res.json();
      if (data.credential) { setCredentials((prev) => prev.map((c) => c.id === id ? data.credential : c)); showToast("Credential reclaimed ✓"); }
    }, { confirmLabel: "Reclaim" });
  };

  const deleteCred = (id: number) => {
    showConfirm("Delete Credential", "This credential record will be permanently deleted.", async () => {
      await adminFetch(`/api/credentials/${id}`, { method: "DELETE" });
      setCredentials((prev) => prev.filter((c) => c.id !== id));
      showToast("Credential deleted", "warn");
    }, { confirmLabel: "Delete" });
  };

  const resetDeviceBinding = (phone: string) => {
    showConfirm("Reset Device Binding", `This will log out ${phone} and force them to re-verify their device.`, async () => {
      const res = await adminFetch(`/api/lookup/device/${encodeURIComponent(phone)}`, { method: "DELETE" });
      if (res.ok) showToast(`Device reset for ${phone} ✓`);
      else showToast("Reset failed", "warn");
    }, { confirmLabel: "Reset Device", danger: false });
  };

  /* ── Support actions ── */
  const resolveMessage = async (id: number) => {
    const res  = await adminFetch(`/api/support/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isResolved: true, adminNote: supportNotes[id] || "" }) });
    const data = await res.json();
    if (data.message) { setSupportMessages((prev) => prev.map((m) => m.id === id ? data.message : m)); showToast("Message resolved ✓"); }
  };

  const deleteMessage = (id: number) => {
    showConfirm("Delete Message", "This support message will be permanently removed.", async () => {
      await adminFetch(`/api/support/${id}`, { method: "DELETE" });
      setSupportMessages((prev) => prev.filter((m) => m.id !== id));
      showToast("Message deleted", "warn");
    }, { confirmLabel: "Delete" });
  };

  /* ── Staff actions (Super User only) ── */
  const createStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name.trim() || !staffForm.email.trim() || !staffForm.password) {
      showToast("Name, email and password are required", "error"); return;
    }
    if (staffForm.password.length < 6) { showToast("Password must be at least 6 characters", "error"); return; }
    setStaffSaving(true);
    try {
      const res = await adminFetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(staffForm) });
      const data = await res.json();
      if (res.ok && data.user) {
        setStaff((prev) => [...prev, data.user]);
        setShowAddStaff(false);
        setStaffForm({ name: "", email: "", password: "", role: "moderator" });
        showToast(`${ROLE_LABEL[data.user.role]} "${data.user.name}" created ✓`);
      } else showToast(data.error || "Failed to create staff", "error");
    } catch { showToast("Network error", "error"); }
    setStaffSaving(false);
  };

  const changeStaffRole = (m: StaffMember, role: string) => {
    if (m.role === role) return;
    const verb = role === "superuser" ? "Promote to Super User" : "Demote to Moderator";
    const msg  = role === "superuser"
      ? `${m.name} will gain full admin control including staff management.`
      : `${m.name} will lose staff management and analytics access.`;
    showConfirm(verb, msg, async () => {
      const res = await adminFetch(`/api/users/${m.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) });
      const data = await res.json();
      if (res.ok && data.user) { setStaff((prev) => prev.map((s) => s.id === m.id ? data.user : s)); showToast(`${m.name} → ${ROLE_LABEL[role]} ✓`); }
      else showToast(data.error || "Failed to change role", "error");
    }, { confirmLabel: verb, danger: role !== "superuser" });
  };

  const deleteStaff = (m: StaffMember) => {
    showConfirm("Delete Staff Account", `"${m.name}" (${m.email}) will lose all access. This cannot be undone.`, async () => {
      const res = await adminFetch(`/api/users/${m.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) { setStaff((prev) => prev.filter((s) => s.id !== m.id)); showToast("Staff account deleted", "warn"); }
      else showToast(data.error || "Failed to delete", "error");
    }, { confirmLabel: "Delete Account" });
  };

  const testTOTPSecret = async (secret: string) => {
    if (!secret.trim()) { showToast("Enter a TOTP secret first", "warn"); return; }
    setTotpTest((t) => ({ ...t, loading: true, code: "" }));
    try {
      const res  = await fetch(`/api/lookup/totp/test?secret=${encodeURIComponent(secret.trim())}`);
      const data = await res.json();
      if (data.code) setTotpTest({ code: data.code, loading: false });
      else { showToast(data.error || "Invalid secret", "error"); setTotpTest({ code: "", loading: false }); }
    } catch { showToast("Network error", "error"); setTotpTest({ code: "", loading: false }); }
  };

  /* ── Tab config (role-gated) ──
     Moderator: operations only. Super User: everything + Analytics + Staff. */
  const tabs: { key: TabType; label: string; icon: string; badge?: number }[] = [
    { key: "orders",      label: "Orders",      icon: "🛒", badge: pendingCount || undefined },
    { key: "products",    label: "Products",    icon: "📦", badge: lowStockProducts.length || undefined },
    ...(isSuper ? [{ key: "analytics" as TabType, label: "Analytics", icon: "📊" }] : []),
    { key: "credentials", label: "Credentials", icon: "🔑", badge: urgentCreds || undefined },
    { key: "reviews",    label: "Reviews",     icon: "⭐" },
    { key: "support",    label: "Support",     icon: "📩", badge: unresolvedCount || undefined },
    ...(isSuper ? [{ key: "staff" as TabType, label: "Staff", icon: "👥" }] : []),
    { key: "links" as TabType, label: "Links", icon: "🔗" },
    ...(isSuper ? [{ key: "settings" as TabType, label: "Settings", icon: "⚙️" }] : []),
    { key: "guides" as TabType, label: "Guides", icon: "📖" },
  ];

  /* ── Filtered products ── */
  const filteredProducts = products
    .filter((p) => filterCat === "all" || p.category === filterCat)
    .filter((p) => !filterLowStock || p.stock < 10)
    .filter((p) => !productSearch || p.nameEn.toLowerCase().includes(productSearch.toLowerCase()) || p.category.toLowerCase().includes(productSearch.toLowerCase()))
    .sort((a, b) => filterLowStock ? a.stock - b.stock : 0);

  /* ──────────────────────────────────────────────
     RENDER
  ────────────────────────────────────────────── */
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(135deg, #eef7f2 0%, #f4faf7 50%, #f7fbf9 100%)", fontFamily: "inherit" }}>

      {/* ══ SIDEBAR (desktop) ══ */}
      <aside className="admin-sidebar" style={{ width: 220, background: "rgba(240, 247, 244, 0.65)", backdropFilter: "blur(20px)", borderRight: "1px solid rgba(16, 185, 129, 0.12)", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 100, overflowY: "auto" }}>
        {/* Brand */}
        <div style={{ padding: "1.25rem 1rem 1rem", borderBottom: "1px solid rgba(16, 185, 129, 0.12)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div style={{ width: 34, height: 34, borderRadius: "0.625rem", background: "linear-gradient(135deg,#00c853,#059669)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: "0.9375rem", color: "#064e3b", lineHeight: 1 }}>Official Tool Store</p>
              <p style={{ fontSize: "0.6875rem", color: "#2e7d32", fontWeight: 700, marginTop: "0.2rem" }}>Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "0.75rem 0.625rem", display: "flex", flexDirection: "column", gap: "0.125rem" }}>
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6875rem 0.875rem", borderRadius: "0.75rem", background: tab === t.key ? "rgba(16, 185, 129, 0.15)" : "transparent", border: tab === t.key ? "1px solid rgba(16, 185, 129, 0.25)" : "1px solid transparent", cursor: "pointer", fontFamily: "inherit", color: tab === t.key ? "#059669" : "#475569", fontWeight: 700, fontSize: "0.875rem", textAlign: "left", width: "100%", transition: "all 0.15s ease", position: "relative" as const }}>
              <span style={{ fontSize: "1.0625rem", flexShrink: 0 }}>{t.icon}</span>
              <span style={{ flex: 1 }}>{t.label}</span>
              {t.badge ? <span style={{ background: "#ef4444", color: "#fff", fontSize: "0.625rem", fontWeight: 800, padding: "0.1rem 0.4rem", borderRadius: "9999px", minWidth: 18, textAlign: "center" }}>{t.badge > 99 ? "99+" : t.badge}</span> : null}
            </button>
          ))}
        </nav>

        {/* Admin info */}
        <div style={{ padding: "1rem", borderTop: "1px solid rgba(16, 185, 129, 0.12)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.75rem" }}>
            <div style={{ width: 34, height: 34, borderRadius: "9999px", background: "rgba(16, 185, 129, 0.2)", border: "1.5px solid rgba(16, 185, 129, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669", fontWeight: 800, fontSize: "0.9375rem", flexShrink: 0 }}>
              {admin.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#064e3b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{admin.name}</p>
              <p style={{ fontSize: "0.6875rem", color: isSuper ? "#059669" : "#2e7d32", fontWeight: 700 }}>{ROLE_LABEL[admin.role] || "Staff"}</p>
            </div>
          </div>
          <button onClick={onLogout} style={{ width: "100%", height: 34, background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.18)", borderRadius: "0.625rem", color: "#b91c1c", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            Logout
          </button>
        </div>
      </aside>

      {/* ══ MAIN CONTENT ══ */}
      <div className="admin-main" style={{ marginLeft: 220, flex: 1, minWidth: 0, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* Top bar */}
        <header className="admin-topbar" style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(16, 185, 129, 0.12)", padding: "0 clamp(0.75rem,3vw,1.5rem)", height: 52, display: "flex", alignItems: "center", gap: "0.75rem", boxShadow: "0 1px 4px rgba(16, 185, 129, 0.03)" }}>
          <h1 style={{ fontSize: "1rem", fontWeight: 800, color: "#064e3b", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {tabs.find((t) => t.key === tab)?.icon} {tabs.find((t) => t.key === tab)?.label}
          </h1>

          {/* Alert chips */}
          <div className="admin-chips" style={{ display: "flex", gap: "0.5rem", flexWrap: "nowrap", overflow: "hidden" }}>
            {pendingCount > 0 && (
              <button onClick={() => { setTab("orders"); setFilterStatus("pending"); }} style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.2rem 0.625rem", borderRadius: "9999px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#b45309", fontSize: "0.6875rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                ⏳ {pendingCount} pending
              </button>
            )}
            {urgentCreds > 0 && (
              <button onClick={() => { setTab("credentials"); setCredFilter("expiring"); }} style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.2rem 0.625rem", borderRadius: "9999px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#b91c1c", fontSize: "0.6875rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                🔑 {urgentCreds} expiring
              </button>
            )}
            {unresolvedCount > 0 && (
              <button onClick={() => setTab("support")} style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.2rem 0.625rem", borderRadius: "9999px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#b91c1c", fontSize: "0.6875rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", animation: "pulse-badge 1.5s ease-in-out infinite" }}>
                📩 {unresolvedCount} messages
              </button>
            )}
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button onClick={loadData} style={{ height: 32, padding: "0 0.875rem", borderRadius: "0.625rem", background: "rgba(255, 255, 255, 0.8)", border: "1.5px solid rgba(16, 185, 129, 0.2)", color: "#059669", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              ↻ Refresh
            </button>
            {/* Hamburger — mobile only */}
            <button className="admin-hamburger" onClick={() => setMobileMoreOpen(true)}
              style={{ display: "none", height: 32, width: 32, borderRadius: "0.625rem", background: "rgba(255,255,255,0.8)", border: "1.5px solid rgba(16,185,129,0.2)", color: "#059669", cursor: "pointer", alignItems: "center", justifyContent: "center", fontSize: "1.125rem", fontFamily: "inherit" }}>
              ☰
            </button>
          </div>
        </header>

        {/* Metric cards */}
        <div style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: "1rem 1.5rem", display: "grid", gridTemplateColumns: `repeat(${isSuper ? 5 : 4}, minmax(0, 1fr))`, gap: "0.75rem" }} className="stats-grid stats-grid-desktop">
          {[
            ...(isSuper ? [{ icon: "💰", label: "Revenue", value: `৳${totalRevBdt.toLocaleString()}`, sub: `$${totalRevUsdt} USDT`, color: "#059669", bg: "#f0fdf4", border: "#bbf7d0" }] : []),
            { icon: "🛒", label: "Orders", value: String(orders.length), sub: pendingCount > 0 ? `${pendingCount} pending` : "all up to date", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
            { icon: "📦", label: "Products", value: String(products.length), sub: lowStockProducts.length > 0 ? `${lowStockProducts.length} low stock` : "stock ok", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
            { icon: "🔑", label: "Credentials", value: String(credentials.filter((c) => !c.isReclaimed).length), sub: urgentCreds > 0 ? `${urgentCreds} need attention` : "all active", color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc" },
            { icon: "📩", label: "Support", value: String(unresolvedCount), sub: unresolvedCount > 0 ? "awaiting reply" : "all resolved", color: unresolvedCount > 0 ? "#b91c1c" : "#15803d", bg: unresolvedCount > 0 ? "#fef2f2" : "#f0fdf4", border: unresolvedCount > 0 ? "#fecaca" : "#bbf7d0" },
          ].map((s) => (
            <div key={s.label}
              style={{ display: "flex", flexDirection: "column", gap: "0.5rem", background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: "1rem", padding: "0.875rem 1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <span style={{ fontSize: "1.125rem", lineHeight: 1 }}>{s.icon}</span>
              <div>
                <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", lineHeight: 1, margin: 0 }}>{s.value}</p>
                <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0.2rem 0 0" }}>{s.label}</p>
                <p style={{ fontSize: "0.6875rem", color: s.color, fontWeight: 600, margin: "0.15rem 0 0" }}>{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tab content */}
        <main style={{ flex: 1, padding: "1.5rem" }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[1, 2, 3].map((i) => <div key={i} style={{ height: 72, background: "#e2e8f0", borderRadius: "1rem", animation: "pulse 1.5s ease-in-out infinite" }} />)}
            </div>
          ) : (
            <>
              {/* ════════════ ORDERS TAB ════════════ */}
              {tab === "orders" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {/* Toolbar */}
                  <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap", alignItems: "center" }}>
                    <input value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} placeholder="Search order code, phone, TrxID..." style={{ ...INP, flex: 1, minWidth: 200 }} />
                    <button onClick={() => exportOrdersCSV(filteredOrders)} style={{ ...BTN("ghost"), height: 42, padding: "0 1rem" }}>⬇ CSV</button>
                  </div>

                  {/* Status filters */}
                  <div className="no-scrollbar" style={{ display: "flex", gap: "0.5rem", flexWrap: "nowrap", alignItems: "center", overflowX: "auto", paddingBottom: 2 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8125rem", fontWeight: 700, color: "#64748b", cursor: "pointer" }}>
                      <input type="checkbox" checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0} onChange={toggleSelectAll} style={{ width: 15, height: 15 }} />
                      All
                    </label>
                    {["all", "pending", "verified", "completed", "failed"].map((s) => (
                      <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: "0.3rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, border: `1px solid ${filterStatus === s ? "#10b981" : "#e2e8f0"}`, background: filterStatus === s ? "rgba(16,185,129,0.08)" : "#fff", color: filterStatus === s ? "#047857" : "#64748b", cursor: "pointer", fontFamily: "inherit" }}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                        {s !== "all" && <span style={{ marginLeft: "0.3rem", opacity: 0.6 }}>({orders.filter((o) => o.status === s).length})</span>}
                      </button>
                    ))}
                  </div>

                  {/* Bulk bar */}
                  {selectedOrders.size > 0 && (
                    <div style={{ background: "#0f172a", borderRadius: "1rem", padding: "0.625rem 1.25rem", display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#f1f5f9" }}>{selectedOrders.size} selected</span>
                      {["verified", "completed", "failed"].map((s) => (
                        <button key={s} onClick={() => handleBulkAction(s)} style={{ height: 30, padding: "0 0.875rem", borderRadius: "0.5rem", fontSize: "0.75rem", fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit", background: s === "completed" ? "rgba(16,185,129,0.2)" : s === "verified" ? "rgba(59,130,246,0.2)" : "rgba(220,38,38,0.2)", color: s === "completed" ? "#10b981" : s === "verified" ? "#60a5fa" : "#f87171" }}>
                          Mark {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                      <button onClick={() => setSelectedOrders(new Set())} style={{ marginLeft: "auto", height: 30, padding: "0 0.75rem", borderRadius: "0.5rem", fontSize: "0.75rem", fontWeight: 700, background: "rgba(255,255,255,0.06)", border: "none", color: "#94a3b8", cursor: "pointer", fontFamily: "inherit" }}>Clear</button>
                    </div>
                  )}

                  {/* Order rows */}
                  {filteredOrders.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "4rem 0", color: "#94a3b8" }}>
                      <div style={{ fontSize: "3rem", marginBottom: "0.875rem" }}>🛒</div>
                      <p style={{ fontWeight: 700, color: "#64748b", marginBottom: "0.25rem" }}>No orders found</p>
                      <p style={{ fontSize: "0.8125rem", fontWeight: 500 }}>Try a different filter or search term</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", minWidth: 0 }}>
                      {paginatedOrders.map((o) => {
                        const st         = STATUS_COLORS[o.status] || STATUS_COLORS.pending;
                        const isSelected = selectedOrders.has(o.id);
                        const isExpanded = expandedOrders.has(o.id);
                        const isDelivered = deliveredOrderCodes.has(o.orderCode);

                        return (
                          <div key={o.id} style={{ background: "#fff", border: `1.5px solid ${isSelected ? "#10b981" : o.status === "pending" ? "rgba(245,158,11,0.3)" : "#e8edf3"}`, borderTop: `3px solid ${isSelected ? "#10b981" : STATUS_COLORS[o.status]?.dot || "#e2e8f0"}`, borderRadius: "0.875rem", overflow: "hidden", minWidth: 0, boxShadow: isExpanded ? "0 6px 20px rgba(0,0,0,0.08)" : "0 1px 4px rgba(0,0,0,0.05)", transition: "all 0.2s ease" }}>
                            {/* Compact row */}
                            <div className="order-row" style={{ padding: "0.875rem 1.25rem", display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "nowrap", minWidth: 0, cursor: "pointer" }} onClick={() => toggleExpandOrder(o.id)}>
                              <input type="checkbox" checked={isSelected} onChange={() => toggleSelectOrder(o.id)} onClick={(e) => e.stopPropagation()} style={{ width: 16, height: 16, flexShrink: 0 }} />

                              {/* Status dot */}
                              <div style={{ width: 8, height: 8, borderRadius: "9999px", background: st.dot, flexShrink: 0 }} />

                              {/* Order code */}
                              <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: "0.875rem", color: "#0f172a", flexShrink: 0, minWidth: 110 }}>{o.orderCode}</span>

                              {/* Items — full list desktop, count on mobile */}
                              <span className="order-items-full" style={{ fontSize: "0.8125rem", color: "#64748b", fontWeight: 600, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {o.items.map((it) => `${it.nameEn} (${it.duration})`).join(", ")}
                              </span>
                              <span className="order-items-short" style={{ display: "none", fontSize: "0.8125rem", color: "#64748b", fontWeight: 600, flexShrink: 0, whiteSpace: "nowrap" }}>
                                {o.items.length === 1 ? o.items[0].nameEn.slice(0, 18) + (o.items[0].nameEn.length > 18 ? "…" : "") : `${o.items.length} items`}
                              </span>

                              {/* Phone */}
                              <span className="order-col-phone" style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, flexShrink: 0, minWidth: 110, display: "flex", alignItems: "center", gap: "0.25rem" }}>📱 {o.phone || "—"}</span>

                              {/* Amount */}
                              <span style={{ fontWeight: 800, fontSize: "0.9375rem", color: "#0f172a", flexShrink: 0 }}>৳{o.totalBdt}</span>

                              {/* Status pill */}
                              <span style={{ display: "inline-flex", alignItems: "center", padding: "0.2rem 0.625rem", borderRadius: "9999px", fontSize: "0.6875rem", fontWeight: 700, background: st.bg, color: st.text, border: `1px solid ${st.border}`, flexShrink: 0 }}>
                                {o.status}
                              </span>

                              {/* Delivered badge */}
                              {isDelivered && (
                                <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#15803d", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "0.15rem 0.5rem", borderRadius: "9999px", flexShrink: 0 }}>✓ Delivered</span>
                              )}

                              {/* Time */}
                              <span className="order-col-time" style={{ fontSize: "0.6875rem", color: "#94a3b8", fontWeight: 600, flexShrink: 0 }}>{timeAgo(o.createdAt)}</span>

                              {/* Quick actions — stop propagation */}
                              <div style={{ display: "flex", gap: "0.375rem", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                                {o.status === "pending" && <>
                                  <button onClick={() => updateOrderStatus(o.id, "verified")} style={{ ...BTN("blue"), height: 30, padding: "0 0.625rem", fontSize: "0.6875rem" }}>✓ Verify</button>
                                  <button onClick={() => updateOrderStatus(o.id, "failed")}   style={{ ...BTN("red"),  height: 30, padding: "0 0.625rem", fontSize: "0.6875rem" }}>✗</button>
                                </>}
                              </div>

                              {/* Expand chevron */}
                              <span style={{ color: "#94a3b8", fontSize: "0.75rem", flexShrink: 0, transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "none" }}>▾</span>
                            </div>

                            {/* Expanded details */}
                            {isExpanded && (
                              <div style={{ borderTop: "1px solid #f1f5f9", padding: "1.25rem", background: "#fafbfc" }}>
                                {/* Order details */}
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "0.875rem", marginBottom: "1.25rem" }}>
                                  {[
                                    { label: "Payment", value: o.paymentMethod || "—" },
                                    { label: "Transaction ID", value: o.trxId || "—" },
                                    { label: "Phone", value: o.phone || "—" },
                                    { label: "Date", value: new Date(o.createdAt).toLocaleString() },
                                    ...(o.note ? [{ label: "Note", value: o.note }] : []),
                                  ].map((d) => (
                                    <div key={d.label} style={{ background: "#fff", borderRadius: "0.75rem", padding: "0.75rem 1rem", border: "1px solid #e8edf3" }}>
                                      <p style={{ fontSize: "0.6125rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem" }}>{d.label}</p>
                                      <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", fontFamily: d.label === "Transaction ID" ? "monospace" : "inherit", wordBreak: "break-all" }}>{d.value}</p>
                                    </div>
                                  ))}
                                </div>

                                {/* Items — per-item Deliver button */}
                                <div style={{ marginBottom: "0.75rem" }}>
                                  <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
                                    Items · {o.items.filter((it) => credentials.some((c) => c.orderCode === o.orderCode && c.productName === it.nameEn)).length}/{o.items.length} delivered
                                  </p>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                                    {o.items.map((it, idx) => {
                                      const itemDelivered = credentials.some((c) => c.orderCode === o.orderCode && c.productName === it.nameEn);
                                      return (
                                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: itemDelivered ? "#f0fdf4" : "#fff", borderRadius: "0.75rem", padding: "0.625rem 0.875rem", border: `1px solid ${itemDelivered ? "#bbf7d0" : "#e8edf3"}` }}>
                                          <span style={{ width: 20, height: 20, borderRadius: "9999px", background: itemDelivered ? "rgba(16,185,129,0.15)" : "rgba(100,116,139,0.08)", fontSize: "0.6rem", fontWeight: 800, color: itemDelivered ? "#059669" : "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{idx + 1}</span>
                                          <span style={{ fontSize: "0.875rem", fontWeight: 700, color: itemDelivered ? "#15803d" : "#0f172a", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.nameEn}</span>
                                          <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600, flexShrink: 0 }}>{it.duration}</span>
                                          <span style={{ fontSize: "0.875rem", fontWeight: 800, color: "#059669", flexShrink: 0 }}>৳{it.priceBdt}</span>
                                          {itemDelivered ? (
                                            <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#059669", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "0.2rem 0.625rem", borderRadius: "9999px", flexShrink: 0 }}>✓ Delivered</span>
                                          ) : (
                                            <button
                                              onClick={(e) => { e.stopPropagation(); openDeliverModal(o, idx); }}
                                              style={{ height: 30, padding: "0 0.75rem", borderRadius: "0.5rem", background: "linear-gradient(135deg,#00c853,#059669)", border: "none", color: "#fff", fontSize: "0.6875rem", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
                                              ⚡ Deliver
                                            </button>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Order actions */}
                                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                  {o.status === "pending" && <button onClick={() => updateOrderStatus(o.id, "verified")} style={{ ...BTN("blue"), height: 34 }}>✓ Verify Payment</button>}
                                  {o.status !== "failed" && <button onClick={() => updateOrderStatus(o.id, "failed")} style={{ ...BTN("red"), height: 34 }}>✗ Fail Order</button>}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {hasMoreOrders && (
                    <button onClick={() => setOrdersPage((p) => p + 1)} style={{ height: 42, background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: "0.875rem", color: "#475569", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                      Load more ({filteredOrders.length - ordersPage * PAGE_SIZE} remaining)
                    </button>
                  )}
                </div>
              )}

              {/* ════════════ PRODUCTS TAB ════════════ */}
              {tab === "products" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap", alignItems: "center" }}>
                    <input value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder="Search products..." style={{ ...INP, flex: 1, minWidth: 200 }} />
                    <button onClick={() => { setShowAddProduct(true); setEditProduct(null); resetForm(); setFormErrors({}); }} style={{ height: 42, padding: "0 1.25rem", background: "linear-gradient(135deg,#00c853,#059669)", border: "none", borderRadius: "0.75rem", color: "#fff", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
                      + Add Product
                    </button>
                  </div>

                  <div className="no-scrollbar" style={{ display: "flex", gap: "0.375rem", overflowX: "auto", paddingBottom: 2 }}>
                    {["all", ...CATEGORIES].map((cat) => (
                      <button key={cat} onClick={() => { setFilterCat(cat); setFilterLowStock(false); }} style={{ padding: "0.3rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, border: `1px solid ${filterCat === cat && !filterLowStock ? "#10b981" : "#e2e8f0"}`, background: filterCat === cat && !filterLowStock ? "rgba(16,185,129,0.08)" : "#fff", color: filterCat === cat && !filterLowStock ? "#047857" : "#64748b", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
                        {cat === "all" ? "All" : cat}
                      </button>
                    ))}
                    <button onClick={() => { setFilterLowStock(!filterLowStock); setFilterCat("all"); }} style={{ padding: "0.3rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, border: `1px solid ${filterLowStock ? "#d97706" : "#e2e8f0"}`, background: filterLowStock ? "rgba(245,158,11,0.1)" : "#fff", color: filterLowStock ? "#b45309" : "#64748b", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
                      ⚠️ Low Stock ({lowStockProducts.length})
                    </button>
                  </div>

                  {/* Add/Edit form */}
                  <p style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600 }}>Showing {filteredProducts.length} of {products.length} products</p>

                  {filteredProducts.map((p) => {
                    const isLow = p.stock < 10;
                    return (
                      <div key={p.id} style={{ background: "#fff", border: `1.5px solid ${isLow ? "#fde68a" : "#e8edf3"}`, borderRadius: "1.125rem", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "0.875rem", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", flexWrap: "wrap" }}>
                        {p.image && (
                          <img src={p.image} alt={p.nameEn} style={{ width: 44, height: 44, borderRadius: "0.875rem", objectFit: "cover", flexShrink: 0, border: "1px solid rgba(0,0,0,0.08)" }} />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 700, fontSize: "0.9375rem", color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.nameEn}</p>
                          <p style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600, marginTop: "0.2rem" }}>{p.category} · Sold: {p.sold}</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexShrink: 0 }}>
                          <label style={{ fontSize: "0.6875rem", fontWeight: 700, color: isLow ? "#b45309" : "#64748b", textTransform: "uppercase" }}>Stock</label>
                          <input type="number" min={0} value={stockEdits[p.id] ?? p.stock} onChange={(e) => setStockEdits((prev) => ({ ...prev, [p.id]: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") updateStock(p); }} onBlur={() => updateStock(p)} style={{ ...INP, width: 70, height: 34, padding: "0 0.5rem", textAlign: "center", borderColor: isLow ? "#fde68a" : "#e2e8f0" }} />
                        </div>
                        <button onClick={() => toggleIsTop(p)} title={p.isTop ? "Remove from Top" : "Pin to Top"} style={{ fontSize: "0.6875rem", fontWeight: 700, color: p.isTop ? "#047857" : "#94a3b8", background: p.isTop ? "#f0fdf4" : "#f8fafc", border: `1px solid ${p.isTop ? "#bbf7d0" : "#e2e8f0"}`, padding: "0.15rem 0.5rem", borderRadius: "9999px", cursor: "pointer", fontFamily: "inherit" }}>{p.isTop ? "🔥 TOP" : "☆ Top"}</button>
                        {isLow && <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#b45309", background: "#fffbeb", border: "1px solid #fde68a", padding: "0.15rem 0.5rem", borderRadius: "9999px" }}>LOW</span>}
                        <div style={{ display: "flex", gap: "0.375rem" }}>
                          <button onClick={() => startEdit(p)} style={{ ...BTN("blue"), height: 34 }}>Edit</button>
                          {isSuper && <button onClick={() => deleteProduct(p.id)} style={{ ...BTN("red"), height: 34 }}>Del</button>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ════════════ ANALYTICS TAB ════════════ */}
              {tab === "analytics" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,180px),1fr))", gap: "1rem" }}>
                    {[
                      { label: "Total Revenue (BDT)", value: `৳${totalRevBdt.toLocaleString()}`, color: "#059669", icon: "💰" },
                      { label: "Total Revenue (USDT)", value: `$${totalRevUsdt.toLocaleString()}`, color: "#2563eb", icon: "💵" },
                      { label: "Avg Order Value", value: `৳${avgOrderBdt.toLocaleString()}`, color: "#7c3aed", icon: "📈" },
                      { label: "Completed Orders", value: completedOrders.length, color: "#059669", icon: "✅" },
                    ].map((s) => (
                      <div key={s.label} style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: "1.25rem", padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}><span style={{ fontSize: "1.25rem" }}>{s.icon}</span></div>
                        <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a" }}>{s.value}</p>
                        <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "0.25rem" }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: "1.25rem", padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                    <h3 style={{ fontWeight: 700, fontSize: "0.875rem", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1.25rem" }}>Revenue — Last 7 Days (BDT)</h3>
                    <canvas ref={chartRef} style={{ maxHeight: 280 }} />
                  </div>
                  {/* Stock Alert Chart */}
                  <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: "1.25rem", padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
                      <h3 style={{ fontWeight: 700, fontSize: "0.875rem", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>Stock Alert — Bottom 15 Products</h3>
                      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                        {[{ color: "#ef4444", label: "Critical (<5)" }, { color: "#f59e0b", label: "Low (<10)" }, { color: "#fbbf24", label: "Watch (<20)" }, { color: "#10b981", label: "OK (20+)" }].map((l) => (
                          <span key={l.label} style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.6875rem", fontWeight: 700, color: "#64748b" }}>
                            <span style={{ width: 10, height: 10, borderRadius: 2, background: l.color, display: "inline-block" }} />{l.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <canvas ref={stockChartRef} style={{ maxHeight: 340 }} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: "1rem" }}>
                    <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: "1.25rem", padding: "1.25rem" }}>
                      <h3 style={{ fontWeight: 700, fontSize: "0.875rem", color: "#0f172a", marginBottom: "1rem" }}>Order Status</h3>
                      {["pending", "verified", "completed", "failed"].map((s) => {
                        const cnt = orders.filter((o) => o.status === s).length;
                        const st  = STATUS_COLORS[s];
                        return (
                          <div key={s} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.625rem" }}>
                            <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: st.text, background: st.bg, border: `1px solid ${st.border}`, padding: "0.2rem 0.625rem", borderRadius: "9999px" }}>{s}</span>
                            <span style={{ fontWeight: 800, fontSize: "1rem", color: "#0f172a" }}>{cnt}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: "1.25rem", padding: "1.25rem" }}>
                      <h3 style={{ fontWeight: 700, fontSize: "0.875rem", color: "#0f172a", marginBottom: "1rem" }}>Top 5 Products</h3>
                      {topProducts.map((p, i) => (
                        <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.625rem" }}>
                          <span style={{ width: 24, height: 24, borderRadius: "9999px", background: i === 0 ? "#fef9c3" : "#f1f5f9", color: i === 0 ? "#b45309" : "#64748b", fontSize: "0.75rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                          <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.nameEn}</span>
                          <span style={{ fontSize: "0.8125rem", fontWeight: 800, color: "#059669" }}>{p.sold}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ════════════ CREDENTIALS TAB ════════════ */}
              {tab === "credentials" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                  <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap", alignItems: "center" }}>
                    <input value={credSearch} onChange={(e) => setCredSearch(e.target.value)} placeholder="Search by order code, phone, product..." style={{ ...INP, flex: 1, minWidth: 200 }} />
                    <button onClick={() => openAddCred()} style={{ height: 42, padding: "0 1.25rem", background: "linear-gradient(135deg,#00c853,#059669)", border: "none", borderRadius: "0.75rem", color: "#fff", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
                      + Add Credential
                    </button>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {(["all", "active", "expiring", "expired", "reclaimed"] as const).map((f) => {
                      const counts = { all: credentials.length, active: credentials.filter((c) => getCredStatus(c) === "active").length, expiring: credentials.filter((c) => getCredStatus(c) === "expiring").length, expired: credentials.filter((c) => getCredStatus(c) === "expired").length, reclaimed: credentials.filter((c) => getCredStatus(c) === "reclaimed").length };
                      const colors = { all: "#64748b", active: "#059669", expiring: "#d97706", expired: "#b91c1c", reclaimed: "#94a3b8" };
                      return (
                        <button key={f} onClick={() => setCredFilter(f)} style={{ padding: "0.3rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, border: `1px solid ${credFilter === f ? colors[f] : "#e2e8f0"}`, background: credFilter === f ? "rgba(0,0,0,0.04)" : "#fff", color: credFilter === f ? colors[f] : "#64748b", cursor: "pointer", fontFamily: "inherit" }}>
                          {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
                        </button>
                      );
                    })}
                  </div>

                  {/* Add/Assign form */}
                  {filteredCreds.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "4rem 0", color: "#94a3b8" }}>
                      <div style={{ fontSize: "3rem", marginBottom: "0.875rem" }}>🔑</div>
                      <p style={{ fontWeight: 700, color: "#64748b", marginBottom: "0.25rem" }}>No credentials found</p>
                      <p style={{ fontSize: "0.8125rem", fontWeight: 500 }}>Try a different filter or add a new credential</p>
                    </div>
                  ) : paginatedCreds.map((c) => {
                    const status   = getCredStatus(c);
                    const countdown = getCredCountdown(c);
                    const borderColor = { active: "#e8edf3", expiring: "#fde68a", expired: "#fecaca", reclaimed: "#e2e8f0" }[status];
                    const cardBg     = { active: "#fff", expiring: "#fffbeb", expired: "#fef2f2", reclaimed: "#f8fafc" }[status];
                    const isRevealed = revealedPasswords.has(c.id);

                    return (
                      <div key={c.id} style={{ background: cardBg, border: `1.5px solid ${borderColor}`, borderRadius: "1.25rem", padding: "1.25rem 1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                        {/* Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1rem" }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexWrap: "wrap" }}>
                              <p style={{ fontWeight: 800, fontSize: "0.9375rem", color: "#0f172a" }}>{c.productName}</p>
                              <span style={{ fontSize: "0.6875rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "9999px", background: { active: "#f0fdf4", expiring: "#fffbeb", expired: "#fef2f2", reclaimed: "#f1f5f9" }[status], color: { active: "#15803d", expiring: "#b45309", expired: "#b91c1c", reclaimed: "#64748b" }[status], border: `1px solid ${borderColor}` }}>
                                {status === "expiring" ? "⚠️ " : status === "expired" ? "🔴 " : status === "active" ? "🟢 " : "✓ "}{status}
                              </span>
                              {c.totpSecret && <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#7c3aed", background: "#f5f3ff", border: "1px solid #e9d5ff", padding: "0.15rem 0.5rem", borderRadius: "9999px" }}>🔐 2FA</span>}
                            </div>
                            <p style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600, marginTop: "0.25rem", fontFamily: "monospace" }}>
                              {c.orderCode} · 📱 {c.phone} · {c.duration}
                            </p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: "0.9375rem", fontWeight: 800, color: status === "expired" ? "#b91c1c" : status === "expiring" ? "#b45309" : "#0f172a" }}>{countdown}</p>
                            <p style={{ fontSize: "0.6875rem", color: "#94a3b8", fontWeight: 600 }}>{new Date(c.startDate).toLocaleDateString()} → {new Date(c.expiryDate).toLocaleDateString()}</p>
                          </div>
                        </div>

                        {/* Credentials */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem", marginBottom: "0.875rem" }}>
                          {/* Username */}
                          <div style={{ background: "rgba(0,0,0,0.03)", borderRadius: "0.75rem", padding: "0.75rem 0.875rem" }}>
                            <p style={{ fontSize: "0.6125rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: "0.25rem" }}>Username</p>
                            <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", wordBreak: "break-all" }}>{c.username}</p>
                          </div>
                          {/* Password */}
                          <div style={{ background: "rgba(0,0,0,0.03)", borderRadius: "0.75rem", padding: "0.75rem 0.875rem" }}>
                            <p style={{ fontSize: "0.6125rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: "0.25rem" }}>Password</p>
                            <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", wordBreak: "break-all", filter: isRevealed ? "none" : "blur(4px)", userSelect: isRevealed ? "text" : "none", transition: "filter 0.2s" }}>{c.password}</p>
                          </div>
                        </div>

                        {c.notes && <p style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, marginBottom: "0.75rem", padding: "0.5rem 0.75rem", background: "rgba(0,0,0,0.03)", borderRadius: "0.625rem" }}>📝 {c.notes}</p>}

                        {/* Actions */}
                        <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                          <button onClick={() => setRevealedPasswords((prev) => { const next = new Set(prev); isRevealed ? next.delete(c.id) : next.add(c.id); return next; })} style={{ ...BTN("ghost"), height: 34 }}>
                            {isRevealed ? "🙈 Hide" : "👁 Reveal"}
                          </button>
                          <button
                            onClick={async () => {
                              await copyToClipboard(`Email: ${c.username}\nPassword: ${c.password}`);
                              setCopiedCredId(c.id);
                              setTimeout(() => setCopiedCredId(null), 2000);
                            }}
                            style={{ ...BTN(copiedCredId === c.id ? "ghost" : "ghost"), height: 34, color: copiedCredId === c.id ? "#15803d" : "#475569" }}
                          >
                            {copiedCredId === c.id ? "✓ Copied!" : "📋 Copy All"}
                          </button>
                          {!c.isReclaimed && <button onClick={() => reclaimCred(c.id)} style={{ ...BTN("blue"), height: 34 }}>✓ Reclaim</button>}
                          <button onClick={() => resetDeviceBinding(c.phone)} title="Reset device — forces re-verification" style={{ ...BTN("yellow"), height: 34 }}>📱 Reset Device</button>
                          {isSuper && <button onClick={() => deleteCred(c.id)} style={{ ...BTN("red"), height: 34 }}>Delete</button>}
                        </div>
                      </div>
                    );
                  })}

                  {hasMoreCreds && (
                    <button onClick={() => setCredsPage((p) => p + 1)} style={{ height: 42, background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: "0.875rem", color: "#475569", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                      Load more ({filteredCreds.length - credsPage * PAGE_SIZE} remaining)
                    </button>
                  )}
                </div>
              )}

              {/* ════════════ REVIEWS TAB ════════════ */}
              {tab === "reviews" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <p style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600 }}>{reviews.length} reviews — newest first</p>
                  {reviews.map((r) => (
                    <div key={r.id} style={{ background: "#fff", border: "1.5px solid #e8edf3", borderRadius: "1.125rem", padding: "1.125rem 1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div style={{ width: 40, height: 40, borderRadius: "9999px", background: "rgba(16,185,129,0.1)", border: "1.5px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669", fontWeight: 800, fontSize: "1rem" }}>{r.author.charAt(0).toUpperCase()}</div>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: "0.9375rem", color: "#0f172a" }}>{r.author}</p>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginTop: "0.1rem" }}>
                              <p style={{ color: "#f59e0b", fontSize: "0.875rem" }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
                              {r.createdAt && <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600 }}>· {new Date(r.createdAt).toLocaleDateString()}</span>}
                            </div>
                          </div>
                        </div>
                        <button onClick={() => deleteReview(r.id)} style={{ ...BTN("red"), height: 32 }}>Delete</button>
                      </div>
                      <p style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.6, fontWeight: 500 }}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* ════════════ SUPPORT TAB ════════════ */}
              {tab === "support" && (() => {
                const filtered   = supportMessages.filter((m) => !supportSearch || m.phone.includes(supportSearch) || m.message.toLowerCase().includes(supportSearch.toLowerCase()));
                const unresolved = filtered.filter((m) => !m.isResolved);
                const resolved   = filtered.filter((m) => m.isResolved);

                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ padding: "0.3rem 0.875rem", borderRadius: "9999px", background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: "0.75rem", fontWeight: 700 }}>📩 {unresolvedCount} unresolved</span>
                      <span style={{ padding: "0.3rem 0.875rem", borderRadius: "9999px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", fontSize: "0.75rem", fontWeight: 700 }}>✅ {supportMessages.filter((m) => m.isResolved).length} resolved</span>
                      <input type="text" value={supportSearch} onChange={(e) => setSupportSearch(e.target.value)} placeholder="Search by phone or message..." style={{ ...INP, height: 36, flex: 1, minWidth: 180, fontSize: "0.8125rem" }} />
                    </div>

                    {filtered.length === 0 && (
                      <div style={{ textAlign: "center", padding: "3rem 0", color: "#94a3b8" }}>
                        <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📭</p>
                        <p style={{ fontWeight: 700 }}>No support messages</p>
                      </div>
                    )}

                    {/* Unresolved */}
                    {unresolved.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                        <h3 style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#b91c1c", textTransform: "uppercase", letterSpacing: "0.07em" }}>Unresolved ({unresolved.length})</h3>
                        {unresolved.map((m) => {
                          // Inline credential context
                          const relatedCreds = credentials.filter((c) => c.phone === m.phone && !c.isReclaimed);
                          return (
                            <div key={m.id} style={{ background: "#fff", border: "1.5px solid #fecaca", borderLeft: "4px solid #ef4444", borderRadius: "1.25rem", padding: "1.25rem 1.5rem", boxShadow: "0 2px 8px rgba(239,68,68,0.07)" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.875rem", flexWrap: "wrap", gap: "0.5rem" }}>
                                <div>
                                  <p style={{ fontWeight: 800, fontSize: "0.9375rem", color: "#0f172a" }}>📱 {m.phone}</p>
                                  <p style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600, marginTop: "0.2rem" }}>{new Date(m.createdAt).toLocaleString()}</p>
                                </div>
                                <button onClick={() => deleteMessage(m.id)} style={{ ...BTN("red"), height: 32 }}>Delete</button>
                              </div>

                              {/* Related credentials */}
                              {relatedCreds.length > 0 && (
                                <div style={{ marginBottom: "1rem", padding: "0.75rem", background: "#f0fdf4", borderRadius: "0.75rem", border: "1px solid #bbf7d0" }}>
                                  <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#15803d", textTransform: "uppercase", marginBottom: "0.5rem" }}>Customer Subscriptions</p>
                                  {relatedCreds.slice(0, 3).map((c) => (
                                    <p key={c.id} style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#0f172a" }}>
                                      {c.productName} · {getCredCountdown(c)} · <span style={{ color: getCredStatus(c) === "active" ? "#059669" : "#b91c1c", fontWeight: 700 }}>{getCredStatus(c)}</span>
                                    </p>
                                  ))}
                                </div>
                              )}

                              <p style={{ fontSize: "0.9375rem", color: "#0f172a", lineHeight: 1.6, fontWeight: 500, background: "#fef2f2", padding: "0.875rem", borderRadius: "0.875rem", marginBottom: "1rem" }}>{m.message}</p>
                              <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
                                <input type="text" value={supportNotes[m.id] ?? ""} onChange={(e) => setSupportNotes((n) => ({ ...n, [m.id]: e.target.value }))} placeholder="Admin note (optional)..." style={{ ...INP, height: 36, flex: 1, minWidth: 200, fontSize: "0.8125rem" }} />
                                <button onClick={() => resolveMessage(m.id)} style={{ height: 36, padding: "0 1rem", borderRadius: "0.75rem", background: "linear-gradient(135deg,#00c853,#059669)", border: "none", color: "#fff", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>✓ Resolve</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Resolved */}
                    {resolved.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                        <h3 style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#15803d", textTransform: "uppercase", letterSpacing: "0.07em" }}>Resolved ({resolved.length})</h3>
                        {resolved.map((m) => (
                          <div key={m.id} style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderLeft: "4px solid #10b981", borderRadius: "1.125rem", padding: "1rem 1.5rem", opacity: 0.8 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <p style={{ fontWeight: 700, fontSize: "0.875rem", color: "#0f172a" }}>📱 {m.phone}</p>
                                <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#15803d", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "0.1rem 0.5rem", borderRadius: "9999px" }}>✓ Resolved</span>
                              </div>
                              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600 }}>{new Date(m.createdAt).toLocaleDateString()}</span>
                                <button onClick={() => deleteMessage(m.id)} style={{ ...BTN("red"), height: 30 }}>Delete</button>
                              </div>
                            </div>
                            <p style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.5 }}>{m.message}</p>
                            {m.adminNote && <p style={{ fontSize: "0.8125rem", color: "#059669", fontWeight: 600, marginTop: "0.5rem" }}>Admin: {m.adminNote}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ════════════ STAFF TAB (Super User only) ════════════ */}
              {tab === "staff" && isSuper && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                    <p style={{ fontSize: "0.8125rem", color: "#64748b", fontWeight: 600, margin: 0 }}>
                      Moderators handle daily operations. Super Users have full control, including staff management.
                    </p>
                    <button onClick={() => setShowAddStaff(true)} style={{ ...BTN("green"), height: 38, padding: "0 1rem" }}>+ Add Staff</button>
                  </div>

                  {showAddStaff && (
                    <form onSubmit={createStaff} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "1rem", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                      <p style={{ fontSize: "0.9375rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>New Staff Account</p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.875rem" }}>
                        <div>
                          <label style={LABEL}>Name</label>
                          <input value={staffForm.name} onChange={(e) => setStaffForm((f) => ({ ...f, name: e.target.value }))} style={INP} placeholder="Full name" />
                        </div>
                        <div>
                          <label style={LABEL}>Email</label>
                          <input type="email" value={staffForm.email} onChange={(e) => setStaffForm((f) => ({ ...f, email: e.target.value }))} style={INP} placeholder="staff@example.com" />
                        </div>
                        <div>
                          <label style={LABEL}>Password</label>
                          <input type="text" value={staffForm.password} onChange={(e) => setStaffForm((f) => ({ ...f, password: e.target.value }))} style={INP} placeholder="Min 6 characters" />
                        </div>
                        <div>
                          <label style={LABEL}>Role</label>
                          <select value={staffForm.role} onChange={(e) => setStaffForm((f) => ({ ...f, role: e.target.value }))} style={{ ...INP, cursor: "pointer" }}>
                            <option value="moderator">Moderator — operations only</option>
                            <option value="superuser">Super User — full control</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "0.625rem" }}>
                        <button type="submit" disabled={staffSaving} style={{ ...BTN("green"), height: 40, padding: "0 1.25rem", opacity: staffSaving ? 0.6 : 1 }}>{staffSaving ? "Saving..." : "Create Account"}</button>
                        <button type="button" onClick={() => { setShowAddStaff(false); setStaffForm({ name: "", email: "", password: "", role: "moderator" }); }} style={{ ...BTN("ghost"), height: 40, padding: "0 1.25rem" }}>Cancel</button>
                      </div>
                    </form>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {staff.length === 0 && <p style={{ color: "#94a3b8", fontWeight: 600, padding: "1rem" }}>No staff accounts yet.</p>}
                    {staff.map((m) => {
                      const sup = roleIsSuper(m.role);
                      const self = m.id === admin.id;
                      return (
                        <div key={m.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "1rem", padding: "0.875rem 1rem", display: "flex", alignItems: "center", gap: "0.875rem", flexWrap: "wrap" }}>
                          <div style={{ width: 40, height: 40, borderRadius: "9999px", background: sup ? "rgba(16,185,129,0.12)" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: sup ? "#059669" : "#64748b", flexShrink: 0 }}>
                            {m.name.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <p style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.9375rem", margin: 0 }}>{m.name} {self && <span style={{ fontSize: "0.6875rem", color: "#94a3b8", fontWeight: 600 }}>(you)</span>}</p>
                            <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: 0 }}>{m.email}</p>
                          </div>
                          <span style={{ padding: "0.25rem 0.625rem", borderRadius: "9999px", fontSize: "0.6875rem", fontWeight: 800, background: sup ? "rgba(16,185,129,0.12)" : "#f1f5f9", color: sup ? "#059669" : "#64748b", border: `1px solid ${sup ? "rgba(16,185,129,0.25)" : "#e2e8f0"}` }}>{ROLE_LABEL[m.role] || m.role}</span>
                          {!self && (
                            <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                              <button onClick={() => changeStaffRole(m, sup ? "moderator" : "superuser")} style={{ ...BTN(sup ? "ghost" : "blue"), height: 34 }}>{sup ? "↓ Demote" : "↑ Promote"}</button>
                              <button onClick={() => deleteStaff(m)} style={{ ...BTN("red"), height: 34 }}>Delete</button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ══ LINKS TAB ══ */}
              {tab === "links" && (
                <LinksTab products={products} adminFetch={adminFetch} showToast={showToast} />
              )}

              {/* ══ SETTINGS TAB ══ */}
              {tab === "settings" && isSuper && (
                <SettingsTab adminFetch={adminFetch} showToast={showToast} />
              )}

              {/* ══ GUIDES TAB ══ */}
              {tab === "guides" && (
                <GuidesTab setTab={(t: string) => setTab(t as TabType)} isSuper={isSuper} />
              )}
            </>
          )}
        </main>
      </div>

      {/* ══ MOBILE BOTTOM NAV — 5 primary + More ══ */}
      {(() => {
        const PRIMARY: TabType[] = ["orders", "products", "credentials", "support"];
        const NAV_LABEL: Partial<Record<TabType, string>> = { credentials: "Creds" };
        const primaryTabs = tabs.filter((t) => PRIMARY.includes(t.key));
        const moreTabs    = tabs.filter((t) => !PRIMARY.includes(t.key));
        const moreActive  = moreTabs.some((t) => t.key === tab);

        const navBtnStyle = (active: boolean): React.CSSProperties => ({
          display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem",
          background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
          color: active ? "#10b981" : "#94a3b8",
          padding: "0.375rem 0", flex: 1, position: "relative",
        });

        return (
          <>
            <nav className="admin-mobile-nav" style={{ display: "none", position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: "#fff", borderTop: "1px solid #e2e8f0", boxShadow: "0 -4px 20px rgba(0,0,0,0.06)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
              <div style={{ display: "flex", alignItems: "stretch", height: 58, width: "100%" }}>
                {primaryTabs.map((t) => (
                  <button key={t.key} onClick={() => { setTab(t.key); setMobileMoreOpen(false); }} style={navBtnStyle(tab === t.key)}>
                    <span style={{ fontSize: "1.25rem", lineHeight: 1 }}>{t.icon}</span>
                    <span style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.02em" }}>{NAV_LABEL[t.key] || t.label}</span>
                    {t.badge ? <span style={{ position: "absolute", top: 4, right: "calc(50% - 18px)", background: "#ef4444", color: "#fff", fontSize: "0.5rem", fontWeight: 800, padding: "0.05rem 0.3rem", borderRadius: "9999px", minWidth: 14, textAlign: "center" }}>{t.badge > 99 ? "99+" : t.badge}</span> : null}
                    {tab === t.key && <span style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 28, height: 3, background: "#10b981", borderRadius: "9999px 9999px 0 0" }} />}
                  </button>
                ))}
                {/* More button */}
                <button onClick={() => setMobileMoreOpen(true)} style={navBtnStyle(moreActive)}>
                  <span style={{ fontSize: "1.25rem", lineHeight: 1 }}>⋯</span>
                  <span style={{ fontSize: "0.625rem", fontWeight: 700 }}>More</span>
                  {moreTabs.some((t) => t.badge) && <span style={{ position: "absolute", top: 4, right: "calc(50% - 18px)", width: 8, height: 8, background: "#ef4444", borderRadius: "9999px" }} />}
                  {moreActive && <span style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 28, height: 3, background: "#10b981", borderRadius: "9999px 9999px 0 0" }} />}
                </button>
              </div>
            </nav>

            {/* ── More slide-up sheet ── */}
            {mobileMoreOpen && (
              <div className="admin-more-sheet" style={{ display: "none", position: "fixed", inset: 0, zIndex: 200 }}>
                {/* Backdrop */}
                <div onClick={() => setMobileMoreOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(3px)" }} />
                {/* Sheet */}
                <div className="animate-fade-up" style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "#fff", borderRadius: "1.25rem 1.25rem 0 0", padding: "0.875rem 1rem calc(1rem + env(safe-area-inset-bottom, 0px))", boxShadow: "0 -12px 40px rgba(0,0,0,0.12)" }}>
                  {/* Handle */}
                  <div style={{ width: 36, height: 4, background: "#e2e8f0", borderRadius: "9999px", margin: "0 auto 1rem" }} />
                  {/* Admin info row */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1rem", padding: "0.625rem 0.5rem", background: "#f8fafc", borderRadius: "0.875rem", border: "1px solid #e2e8f0" }}>
                    <div style={{ width: 34, height: 34, borderRadius: "9999px", background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#059669", fontSize: "0.9375rem", flexShrink: 0 }}>
                      {admin.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: "0.875rem", color: "#0f172a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{admin.name}</p>
                      <p style={{ fontSize: "0.6875rem", color: "#059669", fontWeight: 700, margin: 0 }}>{ROLE_LABEL[admin.role] || "Staff"}</p>
                    </div>
                    <button onClick={onLogout} style={{ height: 30, padding: "0 0.75rem", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.18)", borderRadius: "0.5rem", color: "#b91c1c", fontSize: "0.6875rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Logout</button>
                  </div>
                  {/* More tabs grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                    {moreTabs.map((t) => (
                      <button key={t.key} onClick={() => { setTab(t.key); setMobileMoreOpen(false); }}
                        style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.75rem 0.875rem", borderRadius: "0.875rem", background: tab === t.key ? "rgba(16,185,129,0.08)" : "#f8fafc", border: `1px solid ${tab === t.key ? "rgba(16,185,129,0.25)" : "#e2e8f0"}`, cursor: "pointer", fontFamily: "inherit", position: "relative" }}>
                        <span style={{ fontSize: "1.25rem", flexShrink: 0 }}>{t.icon}</span>
                        <span style={{ fontWeight: 700, fontSize: "0.875rem", color: tab === t.key ? "#059669" : "#0f172a" }}>{t.label}</span>
                        {t.badge ? <span style={{ marginLeft: "auto", background: "#ef4444", color: "#fff", fontSize: "0.5625rem", fontWeight: 800, padding: "0.05rem 0.375rem", borderRadius: "9999px" }}>{t.badge}</span> : null}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        );
      })()}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 88, left: "50%", transform: "translateX(-50%)", zIndex: 9998, background: toast.type === "error" ? "#dc2626" : toast.type === "warn" ? "#d97706" : "#059669", color: "#fff", padding: "0.75rem 1.5rem", borderRadius: "1rem", fontWeight: 700, fontSize: "0.875rem", boxShadow: "0 8px 24px rgba(0,0,0,0.2)", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {toast.type === "success" ? "✓" : toast.type === "warn" ? "⚠️" : "✗"} {toast.msg}
        </div>
      )}

      {/* Product Drawer */}
      <Drawer
        open={showAddProduct}
        onClose={() => { setShowAddProduct(false); setEditProduct(null); setFormErrors({}); }}
        title={editProduct ? "Edit Product" : "Add New Product"}
        width={600}
      >
        <form onSubmit={saveProduct} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))", gap: "1rem" }}>
            {[{ label: "Name (English) *", key: "nameEn" }, { label: "Name (Bengali) *", key: "nameBn" }].map((f) => (
              <div key={f.key}>
                <label style={LABEL}>{f.label}</label>
                <input type="text" value={(productForm as Record<string, unknown>)[f.key] as string} onChange={(e) => setProductForm({ ...productForm, [f.key]: e.target.value })} style={{ ...INP, borderColor: formErrors[f.key] ? "#ef4444" : "#e2e8f0" }} />
                {formErrors[f.key] && <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.2rem" }}>{formErrors[f.key]}</p>}
              </div>
            ))}
            {/* Image upload */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={LABEL}>Product Image</label>
              <div style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                {productForm.image && (
                  <img src={productForm.image} alt="" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: "0.75rem", border: "1.5px solid #e2e8f0", flexShrink: 0 }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                )}
                <div style={{ flex: 1, minWidth: 180, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", height: 42, padding: "0 1rem", borderRadius: "0.75rem", border: "1.5px dashed #cbd5e1", background: "#f8fafc", cursor: imageUploading ? "not-allowed" : "pointer", fontSize: "0.8125rem", fontWeight: 700, color: "#64748b" }}>
                    {imageUploading ? "⏳ Uploading..." : "📁 Upload image"}
                    <input type="file" accept="image/*" disabled={imageUploading} style={{ display: "none" }} onChange={async (e) => {
                      const file = e.target.files?.[0]; if (!file) return;
                      setImageUploading(true);
                      try {
                        const fd = new FormData(); fd.append("image", file);
                        const res = await adminFetch("/api/upload", { method: "POST", body: fd });
                        const data = await res.json();
                        if (data.url) { setProductForm((f) => ({ ...f, image: data.url })); showToast("Image uploaded ✓"); }
                        else showToast(data.error || "Upload failed", "error");
                      } catch { showToast("Upload failed", "error"); }
                      setImageUploading(false);
                      e.target.value = "";
                    }} />
                  </label>
                  <input type="text" value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} placeholder="Or paste image URL..." style={{ ...INP, fontSize: "0.8125rem" }} />
                </div>
              </div>
            </div>
            {[{ label: "Icon Emoji", key: "icon" }, { label: "Icon BG Color", key: "iconBg" }, { label: "Tags (comma separated)", key: "tags" }].map((f) => (
              <div key={f.key}>
                <label style={LABEL}>{f.label}</label>
                <input type="text" value={(productForm as Record<string, unknown>)[f.key] as string} onChange={(e) => setProductForm({ ...productForm, [f.key]: e.target.value })} style={INP} />
              </div>
            ))}
            <div><label style={LABEL}>Category</label><select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} style={{ ...INP, cursor: "pointer" }}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
            <div><label style={LABEL}>Account Type</label><select value={productForm.share} onChange={(e) => setProductForm({ ...productForm, share: e.target.value })} style={{ ...INP, cursor: "pointer" }}><option>Private Account</option><option>Shared Account</option></select></div>
            <div><label style={LABEL}>Stock</label><input type="number" min={0} value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })} style={INP} /></div>
            <div><label style={LABEL}>Guarantee Text</label><input type="text" value={productForm.guarantee} onChange={(e) => setProductForm({ ...productForm, guarantee: e.target.value })} style={INP} /></div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingTop: "1.5rem" }}>
              <input type="checkbox" id="isTopDrawer" checked={productForm.isTop} onChange={(e) => setProductForm({ ...productForm, isTop: e.target.checked })} style={{ width: 18, height: 18, cursor: "pointer" }} />
              <label htmlFor="isTopDrawer" style={{ fontSize: "0.875rem", fontWeight: 700, color: "#475569", cursor: "pointer" }}>Pin as Featured</label>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: "1rem" }}>
            {[{ label: "Short Desc (EN)", key: "shortDescEn" }, { label: "Short Desc (BN)", key: "shortDescBn" }].map((f) => (
              <div key={f.key}><label style={LABEL}>{f.label}</label><input type="text" value={(productForm as Record<string, unknown>)[f.key] as string} onChange={(e) => setProductForm({ ...productForm, [f.key]: e.target.value })} style={INP} /></div>
            ))}
            {[{ label: "Full Desc (EN)", key: "fullDescEn" }, { label: "Full Desc (BN)", key: "fullDescBn" }].map((f) => (
              <div key={f.key}><label style={LABEL}>{f.label}</label><textarea value={(productForm as Record<string, unknown>)[f.key] as string} onChange={(e) => setProductForm({ ...productForm, [f.key]: e.target.value })} style={{ ...INP, height: "auto", minHeight: 80, padding: "0.75rem 0.875rem", resize: "vertical" }} /></div>
            ))}
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <label style={LABEL}>Subscription Packages</label>
              <button type="button" onClick={addPackage} style={{ height: 30, padding: "0 0.75rem", borderRadius: "0.5rem", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#059669", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>+ Add Package</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {productForm.packages.map((pkg, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 90px 90px auto", gap: "0.5rem", alignItems: "center" }}>
                  <input placeholder="Duration (e.g. 1 Month)" value={pkg.duration} onChange={(e) => updatePkg(i, "duration", e.target.value)} style={INP} />
                  <input type="number" placeholder="BDT" min={0} value={pkg.bdt} onChange={(e) => updatePkg(i, "bdt", parseInt(e.target.value) || 0)} style={INP} />
                  <input type="number" placeholder="USDT" min={0} value={pkg.usdt} onChange={(e) => updatePkg(i, "usdt", parseInt(e.target.value) || 0)} style={INP} />
                  {productForm.packages.length > 1 && <button type="button" onClick={() => removePackage(i)} style={{ height: 42, width: 42, borderRadius: "0.625rem", background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca", cursor: "pointer", fontFamily: "inherit" }}>✕</button>}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem", borderTop: "1px solid #f1f5f9" }}>
            <button type="submit" disabled={saving} style={{ flex: 1, height: 44, background: saving ? "#94a3b8" : "linear-gradient(135deg,#00c853,#059669)", border: "none", borderRadius: "0.875rem", color: "#fff", fontSize: "0.9375rem", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(16,185,129,0.25)" }}>
              {saving ? "Saving..." : editProduct ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </Drawer>

      {/* Credential Drawer */}
      <Drawer
        open={showAddCred}
        onClose={() => { setShowAddCred(false); setAssignOrderId(null); setTotpTest({ code: "", loading: false }); }}
        title={assignOrderId ? `Assign Credential — ${assignOrderId.orderCode}` : "Add Credential"}
        width={560}
      >
        <form onSubmit={saveCred} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))", gap: "1rem" }}>
            {[{ label: "Order Code *", key: "orderCode" }, { label: "Customer Phone *", key: "phone" }, { label: "Product Name *", key: "productName" }, { label: "Duration", key: "duration" }, { label: "Username / Email *", key: "username" }, { label: "Password *", key: "password" }].map((f) => (
              <div key={f.key}><label style={LABEL}>{f.label}</label><input required={f.label.endsWith("*")} type="text" value={(credForm as Record<string, string>)[f.key]} onChange={(e) => setCredForm({ ...credForm, [f.key]: e.target.value })} style={INP} /></div>
            ))}
            <div><label style={LABEL}>Expiry Date *</label><input required type="date" value={credForm.expiryDate} onChange={(e) => setCredForm({ ...credForm, expiryDate: e.target.value })} style={INP} /></div>
            <div><label style={LABEL}>Notes</label><input type="text" value={credForm.notes} onChange={(e) => setCredForm({ ...credForm, notes: e.target.value })} placeholder="Optional notes..." style={INP} /></div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={LABEL}>🔐 TOTP Secret (Optional)</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input type="text" value={credForm.totpSecret} onChange={(e) => { setCredForm({ ...credForm, totpSecret: e.target.value }); setTotpTest({ code: "", loading: false }); }} placeholder="JBSWY3DPEHPK3PXP" style={{ ...INP, flex: 1, fontFamily: "monospace" }} />
                <button type="button" disabled={totpTest.loading} onClick={() => testTOTPSecret(credForm.totpSecret)} style={{ height: 42, padding: "0 1rem", borderRadius: "0.75rem", background: "rgba(16,185,129,0.1)", border: "1.5px solid rgba(16,185,129,0.3)", color: "#059669", fontSize: "0.8125rem", fontWeight: 700, cursor: totpTest.loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                  {totpTest.loading ? "..." : "🧪 Test"}
                </button>
              </div>
              {totpTest.code && (
                <div style={{ marginTop: "0.5rem", display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.375rem 0.75rem", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "0.625rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#15803d" }}>Current:</span>
                  <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: "1.125rem", letterSpacing: "0.2em", color: "#0f172a" }}>{totpTest.code}</span>
                  <span style={{ fontSize: "0.6875rem", color: "#94a3b8" }}>✓ Valid</span>
                </div>
              )}
            </div>
          </div>
          <div style={{ paddingTop: "0.5rem", borderTop: "1px solid #f1f5f9" }}>
            <button type="submit" style={{ width: "100%", height: 44, background: "linear-gradient(135deg,#00c853,#059669)", border: "none", borderRadius: "0.875rem", color: "#fff", fontSize: "0.9375rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(16,185,129,0.25)" }}>
              Save Credential
            </button>
          </div>
        </form>
      </Drawer>

      {/* Confirm Modal */}
      {dialog && <ConfirmModal dialog={dialog} onClose={() => setDialog(null)} />}

      {/* ══ DELIVER MODAL ══ */}
      {deliverTarget && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)", padding: "1rem" }}>
          <div style={{ background: "#fff", borderRadius: "1.5rem", width: "100%", maxWidth: 480, boxShadow: "0 32px 80px rgba(0,0,0,0.22)", animation: "modalIn 0.18s ease", overflow: "hidden" }}>

            {/* Modal header */}
            <div style={{ padding: "1.375rem 1.5rem 1.25rem", borderBottom: "1px solid #f1f5f9", background: "linear-gradient(135deg,rgba(0,200,83,0.04),rgba(255,255,255,0))" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <div style={{ width: 34, height: 34, borderRadius: "0.75rem", background: "linear-gradient(135deg,#00c853,#059669)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "1.0625rem" }}>⚡</span>
                  </div>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: "0.9375rem", color: "#0f172a", margin: 0 }}>Deliver Credential</p>
                    <p style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, margin: 0 }}>Focused entry — one product at a time</p>
                  </div>
                </div>
                <button onClick={() => setDeliverTarget(null)} style={{ width: 32, height: 32, borderRadius: "0.625rem", background: "#f8fafc", border: "1px solid #e2e8f0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "1rem", fontFamily: "inherit" }}>✕</button>
              </div>
              {/* Product info */}
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "0.875rem", padding: "0.75rem 1rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <p style={{ fontWeight: 800, fontSize: "0.9375rem", color: "#0f172a", margin: 0 }}>
                  {deliverTarget.order.items[deliverTarget.itemIdx]?.nameEn}
                </p>
                <p style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600, margin: 0 }}>
                  {deliverTarget.order.items[deliverTarget.itemIdx]?.duration} · 📱 {deliverTarget.order.phone || "—"} · {deliverTarget.order.orderCode}
                </p>
              </div>
            </div>

            {/* Form */}
            <div style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={LABEL}>Username / Email *</label>
                <input
                  autoFocus type="text" placeholder="user@example.com"
                  value={deliverForm.username}
                  onChange={(e) => setDeliverForm((f) => ({ ...f, username: e.target.value }))}
                  style={INP}
                />
              </div>
              <div>
                <label style={LABEL}>Password *</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={deliverForm.showPass ? "text" : "password"} placeholder="••••••••"
                    value={deliverForm.password}
                    onChange={(e) => setDeliverForm((f) => ({ ...f, password: e.target.value }))}
                    style={{ ...INP, paddingRight: "3rem" }}
                  />
                  <button type="button" onClick={() => setDeliverForm((f) => ({ ...f, showPass: !f.showPass }))}
                    style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: "1rem", padding: 0 }}>
                    {deliverForm.showPass ? "🙈" : "👁"}
                  </button>
                </div>
              </div>
              <div>
                <label style={LABEL}>Expiry Date *</label>
                <input type="date" value={deliverForm.expiryDate}
                  onChange={(e) => setDeliverForm((f) => ({ ...f, expiryDate: e.target.value }))}
                  style={INP} />
              </div>

              {/* Optional toggles */}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button type="button" onClick={() => setDeliverForm((f) => ({ ...f, showTotp: !f.showTotp }))}
                  style={{ ...BTN(deliverForm.showTotp ? "green" : "ghost"), height: 30, fontSize: "0.6875rem" }}>
                  {deliverForm.showTotp ? "− TOTP" : "+ TOTP Secret"}
                </button>
                <button type="button" onClick={() => setDeliverForm((f) => ({ ...f, showNotes: !f.showNotes }))}
                  style={{ ...BTN(deliverForm.showNotes ? "green" : "ghost"), height: 30, fontSize: "0.6875rem" }}>
                  {deliverForm.showNotes ? "− Notes" : "+ Notes"}
                </button>
              </div>
              {deliverForm.showTotp && (
                <div>
                  <label style={LABEL}>TOTP Secret</label>
                  <input type="text" placeholder="JBSWY3DPEHPK3PXP"
                    value={deliverForm.totpSecret}
                    onChange={(e) => setDeliverForm((f) => ({ ...f, totpSecret: e.target.value }))}
                    style={{ ...INP, fontFamily: "monospace" }} />
                </div>
              )}
              {deliverForm.showNotes && (
                <div>
                  <label style={LABEL}>Notes</label>
                  <input type="text" placeholder="e.g. profile name, region..."
                    value={deliverForm.notes}
                    onChange={(e) => setDeliverForm((f) => ({ ...f, notes: e.target.value }))}
                    style={INP} />
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: "1rem 1.5rem 1.25rem", borderTop: "1px solid #f1f5f9", display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button onClick={() => setDeliverTarget(null)}
                style={{ height: 42, padding: "0 1.25rem", borderRadius: "0.75rem", background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#475569", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
              <button disabled={quickDelivering} onClick={handleSingleDeliver}
                style={{ height: 42, padding: "0 1.5rem", borderRadius: "0.75rem", background: quickDelivering ? "#94a3b8" : "linear-gradient(135deg,#00c853,#059669)", border: "none", color: "#fff", fontSize: "0.875rem", fontWeight: 800, cursor: quickDelivering ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(16,185,129,0.3)" }}>
                {quickDelivering ? "Saving..." : "✓ Save & Deliver →"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        @keyframes pulse-badge { 0%,100% { opacity:1; } 50% { opacity:0.65; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes modalIn { from { opacity:0; transform:scale(0.94); } to { opacity:1; transform:scale(1); } }
        @keyframes drawerIn { from { transform:translateX(100%); } to { transform:translateX(0); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* ── Tablet (900px) ── */
        @media (max-width: 900px) {
          .stats-grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
        }

        /* ── Mobile (768px) ── */
        @media (max-width: 768px) {
          /* Layout */
          .admin-sidebar { display: none !important; }
          .admin-main { margin-left: 0 !important; padding-bottom: 68px !important; }
          .admin-mobile-nav { display: flex !important; }
          .admin-more-sheet { display: block !important; }
          .admin-chips { display: none !important; }
          .admin-hamburger { display: flex !important; }

          /* Stats — horizontal scroll strip on mobile */
          .stats-grid {
            display: flex !important;
            flex-direction: row !important;
            overflow-x: auto !important;
            gap: 0.625rem !important;
            padding: 0.75rem 1rem !important;
            scroll-snap-type: x mandatory;
          }
          .stats-grid > div {
            flex: 0 0 140px !important;
            min-width: 140px !important;
            scroll-snap-align: start;
          }

          /* Content padding */
          main { padding: 0.75rem !important; }

          /* Order rows on mobile */
          .order-row { padding: 0.75rem !important; gap: 0.5rem !important; }
          .order-col-phone { display: none !important; }
          .order-col-time  { display: none !important; }
          .order-items-full  { display: none !important; }
          .order-items-short { display: inline !important; }

          /* Inputs full-width */
          .admin-main input[type="text"],
          .admin-main input[type="search"] {
            min-width: unset !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────
   LINKS TAB
───────────────────────────────────────── */
interface ShortLink { id: number; code: string; label: string; clicks: number; productId: number; productName: string | null; createdAt: string; }

function LinksTab({ products, adminFetch, showToast }: {
  products: { id: number; nameEn: string }[];
  adminFetch: (url: string, opts?: RequestInit) => Promise<Response>;
  showToast: (msg: string, type?: "success" | "error" | "warn") => void;
}) {
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [productId, setProductId] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const load = () => {
    adminFetch("/api/links").then((r) => r.json()).then((d) => { setLinks(d.links || []); setLoaded(true); }).catch(() => setLoaded(true));
  };

  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) { showToast("Select a product", "warn"); return; }
    setCreating(true);
    const res = await adminFetch("/api/links", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, label, productId: parseInt(productId) }) });
    const data = await res.json();
    if (res.ok) { showToast(`Link /${data.link.code} created ✓`); setCode(""); setLabel(""); setProductId(""); load(); }
    else showToast(data.error || "Failed", "error");
    setCreating(false);
  };

  const remove = async (id: number) => {
    await adminFetch(`/api/links?id=${id}`, { method: "DELETE" });
    setLinks((prev) => prev.filter((l) => l.id !== id));
    showToast("Link deleted");
  };

  const copy = async (link: ShortLink) => {
    await navigator.clipboard.writeText(`${baseUrl}/s/${link.code}`).catch(() => {});
    setCopied(link.id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!loaded) return <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8", fontWeight: 600 }}>Loading…</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <p style={{ fontSize: "0.8125rem", color: "#64748b", fontWeight: 600, margin: 0 }}>
        Short links redirect to product pages. Share on Facebook or any platform. Clicks are tracked.
      </p>

      {/* Create form */}
      <form onSubmit={create} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "1rem", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h3 style={{ fontWeight: 800, fontSize: "0.875rem", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>Create New Link</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))", gap: "0.875rem" }}>
          <div>
            <label style={LABEL}>Product *</label>
            <select required value={productId} onChange={(e) => setProductId(e.target.value)} style={{ ...INP, height: 42, cursor: "pointer" }}>
              <option value="">— Select product —</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.nameEn}</option>)}
            </select>
          </div>
          <div>
            <label style={LABEL}>Short code * <span style={{ color: "#94a3b8", fontSize: "0.625rem", fontWeight: 500 }}>(letters, numbers, hyphens)</span></label>
            <input value={code} onChange={(e) => setCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="e.g. chatgpt-1mo" style={INP} required minLength={2} maxLength={50} />
          </div>
          <div>
            <label style={LABEL}>Label <span style={{ color: "#94a3b8", fontSize: "0.625rem" }}>(optional note)</span></label>
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. FB Post Jan" style={INP} maxLength={100} />
          </div>
        </div>
        {code && (
          <p style={{ fontSize: "0.8125rem", color: "#059669", fontWeight: 700, margin: 0 }}>
            Preview: <span style={{ fontFamily: "monospace" }}>{baseUrl}/s/{code}</span>
          </p>
        )}
        <button type="submit" disabled={creating} style={{ ...BTN("green"), height: 42, alignSelf: "flex-start", padding: "0 1.5rem", fontSize: "0.875rem" }}>
          {creating ? "Creating…" : "Create Link →"}
        </button>
      </form>

      {/* Links list */}
      {links.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 0", color: "#94a3b8" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔗</div>
          <p style={{ fontWeight: 700, color: "#64748b" }}>No short links yet</p>
          <p style={{ fontSize: "0.8125rem" }}>Create one above to start sharing</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {links.map((l) => (
            <div key={l.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "0.875rem", padding: "0.875rem 1.125rem", display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: "0.9375rem", color: "#059669" }}>/s/{l.code}</span>
                  {l.label && <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "0.1rem 0.5rem", borderRadius: "9999px" }}>{l.label}</span>}
                </div>
                <p style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600, margin: "0.2rem 0 0" }}>→ {l.productName || `Product #${l.productId}`}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0891b2", background: "#ecfeff", border: "1px solid #a5f3fc", padding: "0.2rem 0.625rem", borderRadius: "9999px" }}>
                  👁 {l.clicks} clicks
                </span>
                <button onClick={() => copy(l)} style={{ ...BTN(copied === l.id ? "green" : "blue"), height: 32 }}>
                  {copied === l.id ? "✓ Copied!" : "📋 Copy"}
                </button>
                <button onClick={() => remove(l.id)} style={{ ...BTN("red"), height: 32 }}>Del</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   SETTINGS TAB
───────────────────────────────────────── */
const SETTING_LABELS: Record<string, { label: string; hint: string; multiline?: boolean }> = {
  store_name:      { label: "Store Name",         hint: "Displayed in footer and browser title" },
  payment_phone:   { label: "Payment Phone",       hint: "Number shown on checkout (e.g. 01879-009680)" },
  whatsapp_number: { label: "WhatsApp Number",     hint: "Digits only, with country code (e.g. 8801879009680)" },
  whatsapp_link:   { label: "WhatsApp Link",       hint: "Full URL e.g. https://wa.me/8801879009680" },
  telegram_link:   { label: "Telegram Link",       hint: "Full URL e.g. https://t.me/yourusername" },
  support_email:   { label: "Support Email",       hint: "Shown in footer and contact page" },
  terms_content:   { label: "Terms & Conditions",  hint: "Plain text shown on /terms page", multiline: true },
  refund_content:  { label: "Refund Policy",       hint: "Plain text shown on /refund page", multiline: true },
  privacy_content: { label: "Privacy Policy",      hint: "Plain text shown on /privacy page (optional)", multiline: true },
};

const ALL_SETTING_KEYS = Object.keys(SETTING_LABELS);

function SettingsTab({ adminFetch, showToast }: {
  adminFetch: (url: string, opts?: RequestInit) => Promise<Response>;
  showToast: (msg: string, type?: "success" | "error" | "warn") => void;
}) {
  const [values, setValues]   = useState<Record<string, string>>({});
  const [perms, setPerms]     = useState<Record<string, boolean>>({});
  const [saving, setSaving]   = useState<string | null>(null);
  const [loaded, setLoaded]   = useState(false);

  useEffect(() => {
    adminFetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, string> = {};
        const pm: Record<string, boolean> = {};
        for (const k of ALL_SETTING_KEYS) map[k] = data.settings?.[k] ?? "";
        for (const k of ALL_SETTING_KEYS) pm[k] = data.settings?.[`perm_${k}`] === "true";
        setValues(map);
        setPerms(pm);
        setLoaded(true);
      })
      .catch(() => showToast("Failed to load settings", "error"));
  }, []);

  const save = async (key: string) => {
    setSaving(key);
    try {
      const res = await adminFetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: values[key] ?? "" }),
      });
      if (res.ok) showToast("Saved ✓");
      else { const d = await res.json(); showToast(d.error || "Save failed", "error"); }
    } catch { showToast("Save failed", "error"); }
    setSaving(null);
  };

  const togglePerm = async (key: string) => {
    const newVal = !perms[key];
    setPerms((p) => ({ ...p, [key]: newVal }));
    const res = await adminFetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: `perm_${key}`, value: newVal ? "true" : "false" }),
    });
    if (!res.ok) {
      setPerms((p) => ({ ...p, [key]: !newVal }));
      showToast("Permission update failed", "error");
    } else showToast(`Moderator ${newVal ? "can" : "cannot"} now edit "${SETTING_LABELS[key]?.label}"`);
  };

  if (!loaded) return <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8", fontWeight: 600 }}>Loading settings…</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <p style={{ fontSize: "0.8125rem", color: "#64748b", fontWeight: 600, margin: 0 }}>
        Changes apply immediately site-wide. Toggle 🔓 to allow Moderators to edit individual settings.
      </p>
      {ALL_SETTING_KEYS.map((key) => {
        const meta = SETTING_LABELS[key];
        const isSaving = saving === key;
        return (
          <div key={key} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "1rem", padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
              <div>
                <p style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.875rem", margin: 0 }}>{meta.label}</p>
                <p style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 500, margin: 0 }}>{meta.hint}</p>
              </div>
              <button
                onClick={() => togglePerm(key)}
                title={perms[key] ? "Moderators can edit — click to restrict" : "Only Super Users can edit — click to allow moderators"}
                style={{ height: 32, padding: "0 0.75rem", borderRadius: "0.625rem", border: `1px solid ${perms[key] ? "rgba(16,185,129,0.3)" : "#e2e8f0"}`, background: perms[key] ? "rgba(16,185,129,0.08)" : "#f8faf9", color: perms[key] ? "#059669" : "#94a3b8", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}
              >
                {perms[key] ? "🔓 Moderator can edit" : "🔒 Super User only"}
              </button>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
              {meta.multiline ? (
                <textarea
                  value={values[key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                  rows={5}
                  style={{ flex: 1, padding: "0.625rem 0.875rem", borderRadius: "0.75rem", border: "1.5px solid #e2e8f0", fontSize: "0.875rem", fontFamily: "inherit", color: "#0f172a", resize: "vertical", outline: "none" }}
                />
              ) : (
                <input
                  type="text"
                  value={values[key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                  style={{ flex: 1, height: 42, padding: "0 0.875rem", borderRadius: "0.75rem", border: "1.5px solid #e2e8f0", fontSize: "0.875rem", fontFamily: "inherit", color: "#0f172a", outline: "none" }}
                />
              )}
              <button
                onClick={() => save(key)}
                disabled={isSaving}
                style={{ height: 42, padding: "0 1rem", borderRadius: "0.75rem", background: isSaving ? "#94a3b8" : "linear-gradient(135deg,#00c853,#059669)", border: "none", color: "#fff", fontWeight: 700, fontSize: "0.8125rem", cursor: isSaving ? "not-allowed" : "pointer", fontFamily: "inherit", flexShrink: 0 }}
              >
                {isSaving ? "…" : "Save"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN ADMIN PAGE — Login Gate
───────────────────────────────────────── */
export default function AdminPage() {
  const [admin, setAdmin]     = useState<SessionUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((data) => { if (data.admin) setAdmin(data.admin); })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/admin/me", { method: "DELETE" });
    setAdmin(null);
  };

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a" }}>
        <div style={{ width: 40, height: 40, borderRadius: "9999px", border: "3px solid #1e293b", borderTopColor: "#10b981", animation: "spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!admin) return <AdminLoginForm onLogin={setAdmin} />;
  return <AdminDashboard admin={admin} onLogout={handleLogout} />;
}

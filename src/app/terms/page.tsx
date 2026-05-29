import { getSettings, SETTING_DEFAULTS } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const settings = await getSettings(["terms_content", "store_name"]);
  const content = settings.terms_content ?? SETTING_DEFAULTS.terms_content;
  const storeName = settings.store_name ?? SETTING_DEFAULTS.store_name;

  return (
    <div className="container-sm" style={{ paddingTop: "2rem", paddingBottom: "6rem" }}>
      <h1 style={{ fontSize: "clamp(1.375rem,4vw,2rem)", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.025em", marginBottom: "0.5rem" }}>
        Terms &amp; Conditions
      </h1>
      <p style={{ color: "#64748b", fontSize: "0.875rem", fontWeight: 500, marginBottom: "2rem" }}>
        Last updated: {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}
      </p>
      <div className="card" style={{ padding: "2rem" }}>
        <div style={{ whiteSpace: "pre-wrap", color: "#475569", fontSize: "0.9375rem", lineHeight: 1.8, fontWeight: 500 }}>
          {content || `Welcome to ${storeName}. By using our service, you agree to these terms.\n\nPlease contact us if you have any questions.`}
        </div>
      </div>
    </div>
  );
}

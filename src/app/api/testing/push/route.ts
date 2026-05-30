/* ════════════════════════════════════════════════════════════
   PILOT TEST FEATURE — remove this whole /api/testing folder when done
   Admin-only test-push endpoint with delivery diagnostics.
   ════════════════════════════════════════════════════════════ */
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/admin-auth";
import { sendPushToPhone } from "@/lib/push";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const phone = (body.phone || "").trim();
  if (!phone) return NextResponse.json({ error: "Phone required" }, { status: 400 });

  const db = getDb();
  const subs = await db
    .select({ endpoint: pushSubscriptions.endpoint })
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.phone, phone));

  const providers = subs.map((s) => {
    try { return new URL(s.endpoint).hostname; } catch { return "unknown"; }
  });

  const result = await sendPushToPhone(phone, {
    title: "🔔 Official Tool Store — Test",
    body: "Test notification. If you see this, your device push works! ✓",
    url: "/lookup",
  });

  return NextResponse.json({
    phone,
    subscriptions: subs.length,
    sent: result.sent,
    failed: result.failed,
    providers,
  });
}

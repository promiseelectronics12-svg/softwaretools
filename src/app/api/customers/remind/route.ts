import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { sendPushToPhone } from "@/lib/push";

export const dynamic = "force-dynamic";

// POST — manually send a renewal reminder push to a customer's phone
export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const phone = (body.phone || "").trim();
  const productName = (body.productName || "").trim();
  if (!phone) return NextResponse.json({ error: "Phone required" }, { status: 400 });

  const title = "⏰ Subscription Renewal Reminder";
  const text = productName
    ? `Your ${productName} subscription is ending soon. Tap to renew and keep your access active.`
    : "Your subscription is ending soon. Tap to renew and keep your access active.";

  const result = await sendPushToPhone(phone, { title, body: text, url: "/shop" });

  if (result.sent === 0) {
    return NextResponse.json(
      { error: "Customer has no active notifications", sent: 0 },
      { status: 409 }
    );
  }
  return NextResponse.json({ ok: true, sent: result.sent });
}

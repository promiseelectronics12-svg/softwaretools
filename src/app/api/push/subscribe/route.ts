import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { pushSubscriptions, lookupTokens } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

/**
 * POST /api/push/subscribe
 * Register or update a push subscription for a customer.
 * Requires a valid lookup token for authentication.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, deviceId, subscription } = body;

    if (!token || !deviceId || !subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = getDb();

    // Verify the lookup token is valid
    const [tokenRecord] = await db
      .select()
      .from(lookupTokens)
      .where(eq(lookupTokens.token, token));

    if (!tokenRecord || new Date(tokenRecord.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const phone = tokenRecord.phone;

    // Upsert: check if this phone+device already has a subscription
    const [existing] = await db
      .select()
      .from(pushSubscriptions)
      .where(
        and(
          eq(pushSubscriptions.phone, phone),
          eq(pushSubscriptions.deviceId, deviceId)
        )
      );

    if (existing) {
      // Update existing subscription
      await db
        .update(pushSubscriptions)
        .set({
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          updatedAt: new Date(),
        })
        .where(eq(pushSubscriptions.id, existing.id));
    } else {
      // Create new subscription
      await db.insert(pushSubscriptions).values({
        phone,
        deviceId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Push Subscribe]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/push/subscribe
 * Unsubscribe a device from push notifications.
 */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, deviceId } = body;

    if (!token || !deviceId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = getDb();

    const [tokenRecord] = await db
      .select()
      .from(lookupTokens)
      .where(eq(lookupTokens.token, token));

    if (!tokenRecord) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await db
      .delete(pushSubscriptions)
      .where(
        and(
          eq(pushSubscriptions.phone, tokenRecord.phone),
          eq(pushSubscriptions.deviceId, deviceId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Push Unsubscribe]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

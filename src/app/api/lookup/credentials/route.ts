import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { deliveryCredentials, lookupTokens, phoneDeviceBindings } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/lookup/credentials?token=xxx
 * Returns all credentials for the phone linked to that token.
 * - Expired credentials: status "expired", no username/password returned
 * - Active/expiring: full data, hasTOTP flag (but never the raw secret)
 */
export async function GET(req: NextRequest) {
  const token    = req.nextUrl.searchParams.get("token")    ?? "";
  const deviceId = req.nextUrl.searchParams.get("deviceId") ?? "";
  if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

  const db = getDb();
  const now = new Date();

  // Validate token
  const [tokenRow] = await db
    .select()
    .from(lookupTokens)
    .where(eq(lookupTokens.token, token))
    .limit(1);

  if (!tokenRow || tokenRow.expiresAt < now) {
    return NextResponse.json({ error: "Invalid or expired session. Please re-enter your phone number." }, { status: 401 });
  }

  // Verify the requesting device matches the bound device for this phone
  if (deviceId) {
    const [binding] = await db
      .select({ deviceId: phoneDeviceBindings.deviceId })
      .from(phoneDeviceBindings)
      .where(eq(phoneDeviceBindings.phone, tokenRow.phone))
      .limit(1);

    if (binding && binding.deviceId !== deviceId) {
      // Device mismatch — revoke token and force re-verification
      await db.delete(lookupTokens).where(eq(lookupTokens.token, token));
      return NextResponse.json({ error: "Device mismatch. Please re-verify." }, { status: 401 });
    }
  }
  // Fetch all non-reclaimed credentials for this phone
  const creds = await db
    .select()
    .from(deliveryCredentials)
    .where(
      and(
        eq(deliveryCredentials.phone, tokenRow.phone),
        eq(deliveryCredentials.isReclaimed, false)
      )
    );

  const result = creds.map((c) => {
    const expiry = new Date(c.expiryDate);
    const diffMs = expiry.getTime() - now.getTime();
    const daysLeft = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const isExpired = diffMs < 0;
    const isExpiring = !isExpired && daysLeft <= 7;

    return {
      id: c.id,
      productName: c.productName,
      duration: c.duration,
      orderCode: c.orderCode,
      startDate: c.startDate,
      expiryDate: c.expiryDate,
      daysLeft: isExpired ? 0 : daysLeft,
      status: isExpired ? "expired" : isExpiring ? "expiring" : "active",
      hasTOTP: !!c.totpSecret,
      // Only send credentials when active
      ...(isExpired ? {} : {
        username: c.username,
        password: c.password,
        notes: c.notes,
      }),
    };
  });

  // Sort: active first, then expiring, then expired
  result.sort((a, b) => {
    const order = { active: 0, expiring: 1, expired: 2 };
    return order[a.status as keyof typeof order] - order[b.status as keyof typeof order];
  });

  return NextResponse.json({ credentials: result, phone: tokenRow.phone });
}

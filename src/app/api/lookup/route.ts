import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getDb } from "@/lib/db";
import {
  deliveryCredentials,
  lookupTokens,
  phoneDeviceBindings,
  orders,
} from "@/lib/db/schema";
import { eq, and, lt, inArray, sql } from "drizzle-orm";

const lookupLimiter = new Map<string, { count: number; resetAt: number }>();
function isLookupRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = lookupLimiter.get(ip);
  if (!entry || now > entry.resetAt) {
    lookupLimiter.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (entry.count >= 5) return true;
  entry.count++;
  return false;
}

/**
 * POST /api/lookup
 * Body: { phone: string; transactionId?: string; deviceId: string }
 *
 * Flow:
 * 1. Rate-limit by IP
 * 2. Passive cleanup — delete expired tokens
 * 3. Check if this deviceId is already bound to this phone → issue token immediately
 * 4. Otherwise require transactionId to verify ownership
 * 5. On success → bind device → issue 30-day token
 *
 * All error responses for phone-not-found and wrong transaction ID use the
 * SAME generic message to prevent enumeration.
 */
export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for") ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (isLookupRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a moment." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const phone       = (body.phone       ?? "").toString().trim();
  const rawTransactionId = (body.transactionId ?? "").toString().trim();
  const transactionId = rawTransactionId.toUpperCase();
  const deviceId    = (body.deviceId    ?? "").toString().trim();

  if (!phone || !deviceId) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const db  = getDb();
  const now = new Date();

  // ── Passive cleanup: remove expired tokens ──────────────────────────────
  await db.delete(lookupTokens).where(lt(lookupTokens.expiresAt, now));

  // ── Check if this phone has any credentials at all ───────────────────────
  const creds = await db
    .select({ id: deliveryCredentials.id })
    .from(deliveryCredentials)
    .where(
      and(
        eq(deliveryCredentials.phone, phone),
        eq(deliveryCredentials.isReclaimed, false)
      )
    )
    .limit(1);

  // We deliberately do NOT return early here with a "not found" error.
  // If we did, an attacker could enumerate valid phone numbers.
  // Instead, we continue the flow and fail at the same generic error below.
  const phoneHasCreds = creds.length > 0;

  // ── Check existing device binding ────────────────────────────────────────
  const [binding] = await db
    .select()
    .from(phoneDeviceBindings)
    .where(eq(phoneDeviceBindings.phone, phone))
    .limit(1);

  const deviceMatches = binding && binding.deviceId === deviceId;

  // ── Fast path: device already bound and matches ──────────────────────────
  if (deviceMatches && phoneHasCreds) {
    const token    = randomBytes(32).toString("hex");
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const userAgent = req.headers.get("user-agent") ?? "";

    await db.insert(lookupTokens).values({
      token,
      phone,
      deviceId,
      ipAddress: ip,
      expiresAt,
    });

    return NextResponse.json({ token, expiresAt: expiresAt.toISOString() });
  }

  // ── Slow path: new device OR first login — need transaction ID ───────────
  if (!transactionId) {
    // Tell the client it needs the transaction ID
    return NextResponse.json({ needsVerification: true }, { status: 200 });
  }

  // Verify the transaction ID belongs to this phone number
  // transactionId can be either the orderCode (e.g. "ORD-XXXX") or trxId
  if (!phoneHasCreds) {
    // Use same generic error — never reveal whether phone exists
    return NextResponse.json(
      { error: "Phone number or Transaction ID does not match our records." },
      { status: 401 }
    );
  }

  // Look for an order matching both phone and orderCode/trxId
  const matchingOrders = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.phone, phone))
    .limit(50);

  const credOrderCodes = await db
    .select({ orderCode: deliveryCredentials.orderCode })
    .from(deliveryCredentials)
    .where(eq(deliveryCredentials.phone, phone));

  const validCodes = new Set([
    ...matchingOrders.map((o) => o.id.toString()),
    ...credOrderCodes.map((c) => c.orderCode.toUpperCase()),
  ]);

  // Also allow trxId match — case-insensitive, since trxIds are stored as the
  // customer typed them at checkout (may contain lowercase) but the lookup
  // input is uppercased for orderCode matching.
  const trxMatch = await db
    .select({ id: orders.id })
    .from(orders)
    .where(and(eq(orders.phone, phone), sql`lower(${orders.trxId}) = ${rawTransactionId.toLowerCase()}`))
    .limit(1);

  const isValid =
    validCodes.has(transactionId) || trxMatch.length > 0;

  if (!isValid) {
    return NextResponse.json(
      { error: "Phone number or Transaction ID does not match our records." },
      { status: 401 }
    );
  }

  // ── Bind this device (create or update) ──────────────────────────────────
  const userAgent = req.headers.get("user-agent") ?? "";

  if (binding) {
    // Update existing binding (device transfer)
    await db
      .update(phoneDeviceBindings)
      .set({ deviceId, ipAddress: ip, userAgent, boundAt: now, resetAt: null })
      .where(eq(phoneDeviceBindings.phone, phone));
  } else {
    // First time binding
    await db.insert(phoneDeviceBindings).values({
      phone,
      deviceId,
      ipAddress: ip,
      userAgent,
    });
  }

  // Issue token
  const token     = randomBytes(32).toString("hex");
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await db.insert(lookupTokens).values({
    token,
    phone,
    deviceId,
    ipAddress: ip,
    expiresAt,
  });

  return NextResponse.json({ token, expiresAt: expiresAt.toISOString() });
}

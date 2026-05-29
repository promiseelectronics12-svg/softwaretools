import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { deliveryCredentials, lookupTokens } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import * as OTPAuth from "otpauth";

/**
 * GET /api/lookup/totp?token=xxx&credId=1
 * Generates the current 6-digit TOTP code server-side.
 * The raw totpSecret NEVER leaves the server.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const credId = parseInt(req.nextUrl.searchParams.get("credId") ?? "0");

  if (!token || !credId) {
    return NextResponse.json({ error: "token and credId are required" }, { status: 400 });
  }

  const db = getDb();
  const now = new Date();

  // Validate token
  const [tokenRow] = await db
    .select()
    .from(lookupTokens)
    .where(eq(lookupTokens.token, token))
    .limit(1);

  if (!tokenRow || tokenRow.expiresAt < now) {
    return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });
  }

  // Find credential — must belong to this phone and be active
  const [cred] = await db
    .select()
    .from(deliveryCredentials)
    .where(
      and(
        eq(deliveryCredentials.id, credId),
        eq(deliveryCredentials.phone, tokenRow.phone),
        eq(deliveryCredentials.isReclaimed, false)
      )
    )
    .limit(1);

  if (!cred) return NextResponse.json({ error: "Credential not found" }, { status: 404 });
  if (new Date(cred.expiryDate) < now) return NextResponse.json({ error: "Subscription expired" }, { status: 403 });
  if (!cred.totpSecret) return NextResponse.json({ error: "No TOTP configured" }, { status: 404 });

  try {
    const totp = new OTPAuth.TOTP({
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(cred.totpSecret.replace(/\s/g, "").toUpperCase()),
    });

    const code = totp.generate();
    const epochSeconds = Math.floor(Date.now() / 1000);
    const secondsRemaining = 30 - (epochSeconds % 30);

    return NextResponse.json({ code, secondsRemaining });
  } catch {
    return NextResponse.json({ error: "Invalid TOTP secret format" }, { status: 422 });
  }
}

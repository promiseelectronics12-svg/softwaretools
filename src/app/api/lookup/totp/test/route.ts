import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import * as OTPAuth from "otpauth";

/**
 * GET /api/lookup/totp/test?secret=XXXX
 * Admin-only. Generates the current TOTP code for a given secret so the admin
 * can verify it's valid before saving it to a credential.
 */
export async function GET(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  if (!secret.trim()) {
    return NextResponse.json({ error: "secret is required" }, { status: 400 });
  }

  try {
    const totp = new OTPAuth.TOTP({
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret.replace(/\s/g, "").toUpperCase()),
    });

    const code = totp.generate();
    const secondsRemaining = 30 - (Math.floor(Date.now() / 1000) % 30);

    return NextResponse.json({ code, secondsRemaining });
  } catch {
    return NextResponse.json({ error: "Invalid TOTP secret format" }, { status: 422 });
  }
}

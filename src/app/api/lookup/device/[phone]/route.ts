import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { phoneDeviceBindings, lookupTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/admin-auth";

/**
 * DELETE /api/lookup/device/[phone]
 * Admin-only: removes the device binding for a phone number and revokes all
 * active tokens so the customer must re-verify on their next visit.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { phone } = await params;
  if (!phone) {
    return NextResponse.json({ error: "Phone required" }, { status: 400 });
  }

  const db = getDb();

  // Remove device binding
  await db
    .delete(phoneDeviceBindings)
    .where(eq(phoneDeviceBindings.phone, phone));

  // Revoke all tokens for this phone so the session ends immediately
  await db
    .delete(lookupTokens)
    .where(eq(lookupTokens.phone, phone));

  return NextResponse.json({ ok: true, message: `Device binding reset for ${phone}` });
}

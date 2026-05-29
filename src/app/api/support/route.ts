import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { supportMessages, lookupTokens } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/admin-auth";
import { broadcastSSE } from "@/lib/sse-broadcast";

/**
 * GET /api/support — Admin only. Returns all support messages newest first.
 */
export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const messages = await db
    .select()
    .from(supportMessages)
    .orderBy(desc(supportMessages.createdAt));

  return NextResponse.json({ messages });
}

/**
 * POST /api/support — Customer submits a support message.
 * Body: { token: string, message: string }
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { token, message } = body;

  if (!token || !message?.trim()) {
    return NextResponse.json({ error: "Token and message are required" }, { status: 400 });
  }

  if (message.trim().length > 1000) {
    return NextResponse.json({ error: "Message too long (max 1000 characters)" }, { status: 400 });
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

  const [saved] = await db
    .insert(supportMessages)
    .values({
      phone: tokenRow.phone,
      token,
      message: message.trim(),
      isResolved: false,
      adminNote: "",
    })
    .returning();

  // Broadcast to all connected admin SSE clients immediately
  broadcastSSE("new_message", {
    id: saved.id,
    phone: saved.phone,
    message: saved.message,
    createdAt: saved.createdAt,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}

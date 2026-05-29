import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { deliveryCredentials } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAdminSession, getSuperUserSession } from "@/lib/admin-auth";

/** PATCH /api/credentials/[id] — Toggle isReclaimed or update fields */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const { id } = await params;
  const body = await req.json();

  const [updated] = await db
    .update(deliveryCredentials)
    .set({ ...body })
    .where(eq(deliveryCredentials.id, parseInt(id)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ credential: updated });
}

/** DELETE /api/credentials/[id] — Permanently remove a credential record */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const su = await getSuperUserSession();
  if (!su) return NextResponse.json({ error: "Super User access required" }, { status: 403 });

  const db = getDb();
  const { id } = await params;

  await db.delete(deliveryCredentials).where(eq(deliveryCredentials.id, parseInt(id)));
  return NextResponse.json({ success: true });
}

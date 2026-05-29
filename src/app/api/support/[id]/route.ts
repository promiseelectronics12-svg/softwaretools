import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { supportMessages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/admin-auth";

/** PATCH /api/support/[id] — Mark resolved and/or add admin note */
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
    .update(supportMessages)
    .set(body)
    .where(eq(supportMessages.id, parseInt(id)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ message: updated });
}

/** DELETE /api/support/[id] — Admin deletes a message */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const { id } = await params;
  await db.delete(supportMessages).where(eq(supportMessages.id, parseInt(id)));
  return NextResponse.json({ success: true });
}

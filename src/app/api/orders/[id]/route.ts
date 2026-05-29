import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/admin-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const setData: Record<string, unknown> = { updatedAt: new Date() };

  if (body.status !== undefined) {
    setData.status = body.status;
  }

  if (body.note !== undefined) {
    const note = typeof body.note === "string" ? body.note.trim() : "";
    if (note.length > 200) {
      return NextResponse.json(
        { error: "Note must be 200 characters or less" },
        { status: 400 }
      );
    }
    setData.note = note || null;
  }

  if (Object.keys(setData).length <= 1) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(orders)
    .set(setData)
    .where(eq(orders.id, parseInt(id)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order: updated });
}

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/admin-auth";
import { sendPushToPhone } from "@/lib/push";

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

  // Send push notification when order is completed (delivered)
  if (body.status === "completed" && updated.phone) {
    try {
      const items = updated.items as { nameEn?: string }[] | null;
      const productName = items?.[0]?.nameEn || "your product";
      await sendPushToPhone(updated.phone, {
        title: "✅ Your Order is Ready!",
        body: `Your ${productName} credential has been delivered. Tap to view.`,
        url: "/lookup",
      });
    } catch (err) {
      // Push failure should never block order completion
      console.error("[Push] Failed to notify customer:", err);
    }
  }

  return NextResponse.json({ order: updated });
}

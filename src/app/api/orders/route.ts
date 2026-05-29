import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAdminSession } from "@/lib/admin-auth";
import { broadcastSSE } from "@/lib/sse-broadcast";

function generateOrderCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "OTS-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * GET /api/orders
 *  - ?code=OTS-XXXXXX  → public lookup by order code (no auth needed)
 *  - Admin session       → returns ALL orders
 */
export async function GET(req: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  // Public: lookup by order code
  if (code) {
    const result = await db
      .select()
      .from(orders)
      .where(eq(orders.orderCode, code.toUpperCase()))
      .limit(1);
    if (result.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ orders: result });
  }

  // Admin only: return all orders
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await db.select().from(orders).orderBy(desc(orders.createdAt));
  return NextResponse.json({ orders: result });
}

/**
 * POST /api/orders — No auth required
 * Phone is the customer identifier.
 */
export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  const { items, totalBdt, totalUsdt, paymentMethod, trxId, phone, note } = body;

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "No items" }, { status: 400 });
  }
  if (!phone || !phone.trim()) {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
  }

  const [order] = await db
    .insert(orders)
    .values({
      orderCode: generateOrderCode(),
      userId: 1, // system placeholder — no customer accounts needed
      totalBdt,
      totalUsdt: totalUsdt || 0,
      paymentMethod,
      trxId: trxId || null,
      phone: phone.trim(),
      status: "pending",
      items,
      note: note?.trim() || null,
    })
    .returning();

  // Notify any connected admin SSE clients (single-process deployments).
  // On serverless this may not fan out across instances — the admin panel
  // also polls as the authoritative real-time source.
  broadcastSSE("new_order", {
    id: order.id,
    orderCode: order.orderCode,
    phone: order.phone,
    totalBdt: order.totalBdt,
    createdAt: order.createdAt,
  });

  return NextResponse.json({ order });
}

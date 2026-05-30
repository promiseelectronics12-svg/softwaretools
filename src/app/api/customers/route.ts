import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { orders, deliveryCredentials, pushSubscriptions } from "@/lib/db/schema";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

interface CustomerCredential {
  id: number;
  productName: string;
  duration: string;
  expiryDate: string;
  isReclaimed: boolean;
}

interface Customer {
  phone: string;
  orderCount: number;
  totalSpent: number;        // completed orders only, BDT
  firstSeen: string;
  lastOrder: string;
  hasPush: boolean;
  credentials: CustomerCredential[];
}

// GET — aggregate every customer by phone from orders + credentials + push subs
export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const [allOrders, allCreds, pushRows] = await Promise.all([
    db.select().from(orders),
    db.select().from(deliveryCredentials),
    db.select({ phone: pushSubscriptions.phone }).from(pushSubscriptions),
  ]);

  const pushPhones = new Set(pushRows.map((r) => r.phone));
  const map = new Map<string, Customer>();

  for (const o of allOrders) {
    const phone = o.phone?.trim();
    if (!phone) continue;
    let c = map.get(phone);
    if (!c) {
      c = { phone, orderCount: 0, totalSpent: 0, firstSeen: o.createdAt as unknown as string, lastOrder: o.createdAt as unknown as string, hasPush: pushPhones.has(phone), credentials: [] };
      map.set(phone, c);
    }
    c.orderCount++;
    if (o.status === "completed") c.totalSpent += o.totalBdt;
    const created = new Date(o.createdAt).getTime();
    if (created < new Date(c.firstSeen).getTime()) c.firstSeen = o.createdAt as unknown as string;
    if (created > new Date(c.lastOrder).getTime()) c.lastOrder = o.createdAt as unknown as string;
  }

  for (const cr of allCreds) {
    const phone = cr.phone?.trim();
    if (!phone) continue;
    let c = map.get(phone);
    if (!c) {
      // Credential exists but no matching order row — still surface the customer
      c = { phone, orderCount: 0, totalSpent: 0, firstSeen: cr.createdAt as unknown as string, lastOrder: cr.createdAt as unknown as string, hasPush: pushPhones.has(phone), credentials: [] };
      map.set(phone, c);
    }
    c.credentials.push({
      id: cr.id,
      productName: cr.productName,
      duration: cr.duration,
      expiryDate: cr.expiryDate as unknown as string,
      isReclaimed: cr.isReclaimed,
    });
  }

  const customers = Array.from(map.values()).sort(
    (a, b) => new Date(b.lastOrder).getTime() - new Date(a.lastOrder).getTime()
  );

  return NextResponse.json({ customers });
}

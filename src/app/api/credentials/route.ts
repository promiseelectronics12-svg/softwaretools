import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { deliveryCredentials } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { getAdminSession } from "@/lib/admin-auth";

/** GET /api/credentials — Admin only. Returns all credentials sorted by expiry date ASC */
export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const result = await db
    .select()
    .from(deliveryCredentials)
    .orderBy(asc(deliveryCredentials.expiryDate));

  return NextResponse.json({ credentials: result });
}

/** POST /api/credentials — Admin only. Creates a new credential record. */
export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const body = await req.json();
  const {
    orderId, orderCode, phone, productName, duration,
    username, password, notes, totpSecret, startDate, expiryDate,
  } = body;

  if (!orderCode || !phone || !productName || !username || !password || !startDate || !expiryDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const [cred] = await db
    .insert(deliveryCredentials)
    .values({
      orderId: orderId || null,
      orderCode,
      phone,
      productName,
      duration: duration || "",
      username,
      password,
      notes: notes || "",
      totpSecret: (typeof totpSecret === "string" && totpSecret.trim()) ? totpSecret.trim() : null,
      startDate: new Date(startDate),
      expiryDate: new Date(expiryDate),
      isReclaimed: false,
    })
    .returning();

  return NextResponse.json({ credential: cred }, { status: 201 });
}

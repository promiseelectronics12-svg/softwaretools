import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { shortLinks, products } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAdminSession } from "@/lib/admin-auth";

// GET — list all short links with product name
export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const rows = await db
    .select({
      id:          shortLinks.id,
      code:        shortLinks.code,
      label:       shortLinks.label,
      clicks:      shortLinks.clicks,
      productId:   shortLinks.productId,
      productName: products.nameEn,
      createdAt:   shortLinks.createdAt,
    })
    .from(shortLinks)
    .leftJoin(products, eq(shortLinks.productId, products.id))
    .orderBy(desc(shortLinks.createdAt));

  return NextResponse.json({ links: rows });
}

// POST — create a new short link
export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const code  = (body.code || "").toLowerCase().trim().replace(/[^a-z0-9-]/g, "");
  const label = (body.label || "").trim().slice(0, 100);
  const productId = parseInt(body.productId);

  if (!code || code.length < 2 || code.length > 50) {
    return NextResponse.json({ error: "Code must be 2–50 lowercase letters, numbers, or hyphens" }, { status: 400 });
  }
  if (isNaN(productId)) {
    return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  }

  const db = getDb();
  try {
    const [link] = await db.insert(shortLinks).values({ code, productId, label }).returning();
    return NextResponse.json({ link });
  } catch {
    return NextResponse.json({ error: "Code already exists — choose another" }, { status: 409 });
  }
}

// DELETE — remove a short link by id (query param)
export async function DELETE(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseInt(req.nextUrl.searchParams.get("id") || "");
  if (isNaN(id)) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const db = getDb();
  await db.delete(shortLinks).where(eq(shortLinks.id, id));
  return NextResponse.json({ ok: true });
}

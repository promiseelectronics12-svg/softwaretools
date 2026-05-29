import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAdminSession, getSuperUserSession } from "@/lib/admin-auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  const { id } = await params;
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, parseInt(id)))
    .limit(1);

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ product });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const { id } = await params;
  const body = await req.json();

  const [updated] = await db
    .update(products)
    .set({
      nameEn: body.nameEn,
      nameBn: body.nameBn,
      shortDescEn: body.shortDescEn,
      shortDescBn: body.shortDescBn,
      fullDescEn: body.fullDescEn,
      fullDescBn: body.fullDescBn,
      image: body.image,
      icon: body.icon,
      iconBg: body.iconBg,
      category: body.category,
      tags: body.tags,
      stock: body.stock,
      packages: body.packages,
      options: body.options,
      isTop: body.isTop,
    })
    .where(eq(products.id, parseInt(id)))
    .returning();

  return NextResponse.json({ product: updated });
}

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
    .update(products)
    .set(body)
    .where(eq(products.id, parseInt(id)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const su = await getSuperUserSession();
  if (!su) return NextResponse.json({ error: "Super User access required" }, { status: 403 });

  const db = getDb();
  const { id } = await params;
  await db.delete(products).where(eq(products.id, parseInt(id)));
  return NextResponse.json({ success: true });
}


import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq, like, or, and, sql } from "drizzle-orm";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const cat = searchParams.get("cat") || "";

  let conditions = [];
  if (q) {
    conditions.push(
      or(
        like(products.nameEn, `%${q}%`),
        like(products.nameBn, `%${q}%`),
        like(products.category, `%${q}%`)
      )
    );
  }
  if (cat) {
    conditions.push(eq(products.category, cat));
  }

  let result;
  if (conditions.length > 0) {
    result = await db
      .select()
      .from(products)
      .where(and(...conditions))
      .orderBy(sql`${products.isTop} DESC, ${products.sold} DESC`);
  } else {
    result = await db
      .select()
      .from(products)
      .orderBy(sql`${products.isTop} DESC, ${products.sold} DESC`);
  }

  return NextResponse.json({ products: result });
}

export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const body = await req.json();

  const [newProduct] = await db
    .insert(products)
    .values({
      nameEn: body.nameEn,
      nameBn: body.nameBn,
      shortDescEn: body.shortDescEn || "",
      shortDescBn: body.shortDescBn || "",
      fullDescEn: body.fullDescEn || "",
      fullDescBn: body.fullDescBn || "",
      image: body.image || "",
      icon: body.icon || "📦",
      iconBg: body.iconBg || "#e8f5e9",
      category: body.category || "AI Tools",
      tags: body.tags || [],
      stock: body.stock || 100,
      sold: 0,
      packages: body.packages || [],
      options: body.options || { guarantee: "", share: "", duration: "", accountType: "" },
      isTop: body.isTop || false,
    })
    .returning();

  return NextResponse.json({ product: newProduct });
}

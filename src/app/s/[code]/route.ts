import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { shortLinks } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const db = getDb();

  const [link] = await db
    .select()
    .from(shortLinks)
    .where(eq(shortLinks.code, code.toLowerCase()))
    .limit(1);

  if (!link) {
    return NextResponse.redirect(new URL("/shop", _req.url));
  }

  // Increment click count (fire-and-forget, don't block redirect)
  db.update(shortLinks)
    .set({ clicks: sql`${shortLinks.clicks} + 1` })
    .where(eq(shortLinks.id, link.id))
    .catch(() => {});

  return NextResponse.redirect(new URL(`/product/${link.productId}`, _req.url));
}

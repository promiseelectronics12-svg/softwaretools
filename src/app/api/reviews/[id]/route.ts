import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/admin-auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const { id } = await params;
  await db.delete(reviews).where(eq(reviews.id, parseInt(id)));
  return NextResponse.json({ success: true });
}

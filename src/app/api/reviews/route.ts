import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const db = getDb();
  const result = await db.select().from(reviews).orderBy(desc(reviews.createdAt));
  return NextResponse.json({ reviews: result });
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  const { author, rating, comment } = body;

  if (!author || !rating || !comment) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  const [review] = await db
    .insert(reviews)
    .values({ author, rating, comment })
    .returning();

  return NextResponse.json({ review });
}

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { inArray, eq } from "drizzle-orm";
import { getAdminSession, getSuperUserSession } from "@/lib/admin-auth";
import { hashPassword } from "@/lib/auth";

const STAFF_ROLES = ["superuser", "moderator", "admin"] as const;

/** GET /api/users — Staff only. Returns the list of staff accounts. */
export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(inArray(users.role, [...STAFF_ROLES]));

  return NextResponse.json({ users: result });
}

/** POST /api/users — Super User only. Creates a new staff account. */
export async function POST(req: NextRequest) {
  const su = await getSuperUserSession();
  if (!su) {
    return NextResponse.json({ error: "Super User access required" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const name = (body.name || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  const role = body.role === "superuser" ? "superuser" : "moderator";

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const db = getDb();
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const [created] = await db
    .insert(users)
    .values({ name, email, passwordHash, role })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    });

  return NextResponse.json({ user: created }, { status: 201 });
}

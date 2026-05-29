import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getSuperUserSession } from "@/lib/admin-auth";
import { isSuperUser } from "@/lib/auth";

const SUPERUSER_ROLES = ["superuser", "admin"] as const;

/** Count of accounts that still have full Super User control. */
async function superUserCount(db: ReturnType<typeof getDb>): Promise<number> {
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(inArray(users.role, [...SUPERUSER_ROLES]));
  return rows.length;
}

/** PATCH /api/users/[id] — Super User only. Change a staff member's role. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const su = await getSuperUserSession();
  if (!su) return NextResponse.json({ error: "Super User access required" }, { status: 403 });

  const { id } = await params;
  const targetId = parseInt(id);
  const body = await req.json().catch(() => ({}));
  const role = body.role === "superuser" ? "superuser" : body.role === "moderator" ? "moderator" : null;
  if (!role) return NextResponse.json({ error: "Invalid role" }, { status: 400 });

  const db = getDb();
  const [target] = await db.select().from(users).where(eq(users.id, targetId)).limit(1);
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Guard: don't let the last Super User demote themselves and lock everyone out.
  if (isSuperUser(target.role) && role === "moderator") {
    if (target.id === su.id) {
      return NextResponse.json({ error: "You cannot demote your own account" }, { status: 400 });
    }
    if ((await superUserCount(db)) <= 1) {
      return NextResponse.json({ error: "Cannot demote the last Super User" }, { status: 400 });
    }
  }

  const [updated] = await db
    .update(users)
    .set({ role })
    .where(eq(users.id, targetId))
    .returning({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt });

  return NextResponse.json({ user: updated });
}

/** DELETE /api/users/[id] — Super User only. Remove a staff account. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const su = await getSuperUserSession();
  if (!su) return NextResponse.json({ error: "Super User access required" }, { status: 403 });

  const { id } = await params;
  const targetId = parseInt(id);

  if (targetId === su.id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  const db = getDb();
  const [target] = await db.select().from(users).where(eq(users.id, targetId)).limit(1);
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Guard: never delete the last Super User.
  if (isSuperUser(target.role) && (await superUserCount(db)) <= 1) {
    return NextResponse.json({ error: "Cannot delete the last Super User" }, { status: 400 });
  }

  await db.delete(users).where(eq(users.id, targetId));
  return NextResponse.json({ success: true });
}

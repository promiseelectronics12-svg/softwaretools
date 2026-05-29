import { NextResponse } from "next/server";
import { verifyToken, isStaff } from "@/lib/auth";
import { cookies } from "next/headers";

/**
 * GET /api/admin/me — Check if admin session is valid
 * POST /api/admin/logout — Clear admin session
 */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return NextResponse.json({ admin: null });

  const user = await verifyToken(token);
  if (!user || !isStaff(user.role)) return NextResponse.json({ admin: null });

  return NextResponse.json({ admin: user });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_session", "", { maxAge: 0, path: "/" });
  return response;
}

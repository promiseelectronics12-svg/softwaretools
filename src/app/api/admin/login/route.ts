import { NextRequest, NextResponse } from "next/server";
import { loginUser, isStaff } from "@/lib/auth";

/**
 * POST /api/admin/login
 * Admin-only login — only users with role "admin" can sign in here.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const result = await loginUser(email, password);
  if (!result) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Only staff (Super User / Moderator / legacy admin) can access this endpoint
  if (!isStaff(result.user.role)) {
    return NextResponse.json({ error: "Access denied. Staff accounts only." }, { status: 403 });
  }

  const response = NextResponse.json({ user: result.user });
  response.cookies.set("admin_session", result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  return response;
}

import { verifyToken, isStaff, isSuperUser, type SessionUser } from "./auth";
import { cookies } from "next/headers";

/**
 * Verifies the admin_session cookie.
 * Returns the staff user (superuser, moderator, or legacy admin) if valid, null otherwise.
 */
export async function getAdminSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return null;
  const user = await verifyToken(token);
  if (!user || !isStaff(user.role)) return null;
  return user;
}

/**
 * Verifies the admin_session cookie AND that the user is a Super User.
 * Use for destructive / staff-management actions that only the Super User may perform.
 */
export async function getSuperUserSession(): Promise<SessionUser | null> {
  const user = await getAdminSession();
  if (!user || !isSuperUser(user.role)) return null;
  return user;
}

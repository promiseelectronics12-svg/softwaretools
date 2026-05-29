import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { getDb } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "fallback-secret-change-me"
);

export type Role = "superuser" | "moderator" | "admin" | "user";

// Staff = anyone who can reach the admin panel.
export type StaffRole = "superuser" | "moderator" | "admin";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

/** Staff can open the admin panel (superuser, moderator, or legacy admin). */
export function isStaff(role: string): boolean {
  return role === "superuser" || role === "moderator" || role === "admin";
}

/** Super User has full control. Legacy "admin" is treated as a Super User. */
export function isSuperUser(role: string): boolean {
  return role === "superuser" || role === "admin";
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createToken(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ user: SessionUser; token: string } | null> {
  const db = getDb();
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!existingUser) return null;

  const valid = await verifyPassword(password, existingUser.passwordHash);
  if (!valid) return null;

  const sessionUser: SessionUser = {
    id: existingUser.id,
    name: existingUser.name,
    email: existingUser.email,
    role: existingUser.role as Role,
  };

  const token = await createToken(sessionUser);
  return { user: sessionUser, token };
}

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<{ user: SessionUser; token: string } | null> {
  const db = getDb();
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) return null;

  const passwordHash = await hashPassword(password);
  const [newUser] = await db
    .insert(users)
    .values({ name, email, passwordHash })
    .returning();

  const sessionUser: SessionUser = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role as Role,
  };

  const token = await createToken(sessionUser);
  return { user: sessionUser, token };
}

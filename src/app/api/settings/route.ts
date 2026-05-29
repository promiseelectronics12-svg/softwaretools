import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAdminSession, getSuperUserSession } from "@/lib/admin-auth";
import { isSuperUser } from "@/lib/auth";
import { getSettings, permKey, type SettingKey } from "@/lib/settings";

/**
 * GET /api/settings
 * Public — returns all settings (values only, no perm_ keys exposed).
 */
export async function GET() {
  const all = await getSettings();
  const public_: Record<string, string> = {};
  for (const [k, v] of Object.entries(all)) {
    if (!k.startsWith("perm_")) public_[k] = v;
  }
  return NextResponse.json({ settings: public_ });
}

/**
 * PUT /api/settings
 * Body: { key: string; value: string }
 * Super User: can update any key or perm_ flag.
 * Moderator: can update only keys where perm_<key> = "true".
 */
export async function PUT(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { key, value } = await req.json() as { key: string; value: string };
  if (!key || typeof value !== "string") {
    return NextResponse.json({ error: "key and value required" }, { status: 400 });
  }

  const superUser = isSuperUser(admin.role);

  // perm_ keys only editable by Super User
  if (key.startsWith("perm_") && !superUser) {
    return NextResponse.json({ error: "Only Super User can change permissions" }, { status: 403 });
  }

  // Moderator: check if Super User granted edit access for this key
  if (!superUser) {
    const perms = await getSettings([permKey(key as SettingKey)]);
    const allowed = perms[permKey(key as SettingKey)] === "true";
    if (!allowed) {
      return NextResponse.json({ error: "You don't have permission to edit this setting" }, { status: 403 });
    }
  }

  const db = getDb();
  await db
    .insert(siteSettings)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value, updatedAt: new Date() },
    });

  return NextResponse.json({ ok: true, key, value });
}

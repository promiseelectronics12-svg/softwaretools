import { getDb } from "./db";
import { siteSettings } from "./db/schema";
import { inArray } from "drizzle-orm";

export const SETTING_KEYS = [
  "whatsapp_number",   // e.g. 8801879009680
  "whatsapp_link",     // e.g. https://wa.me/8801879009680
  "telegram_link",     // e.g. https://t.me/yourusername
  "support_email",     // e.g. support@officialtoolstore.com
  "payment_phone",     // e.g. 01879-009680
  "store_name",        // e.g. OfficialToolStore
  "terms_content",     // plain text / markdown for T&C page
  "refund_content",    // plain text / markdown for Refund Policy page
  "privacy_content",   // plain text / markdown for Privacy Policy page
] as const;

export type SettingKey = typeof SETTING_KEYS[number];

// Permission key pattern: "perm_<key>" = "true" means moderator can edit that setting
export function permKey(key: SettingKey): string {
  return `perm_${key}`;
}

export type SettingsMap = Record<string, string>;

export async function getSettings(keys?: string[]): Promise<SettingsMap> {
  const db = getDb();
  const rows = keys
    ? await db.select().from(siteSettings).where(inArray(siteSettings.key, keys))
    : await db.select().from(siteSettings);
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export const SETTING_DEFAULTS: SettingsMap = {
  whatsapp_number: "8801879009680",
  whatsapp_link:   "https://wa.me/8801879009680",
  telegram_link:   "https://t.me/",
  support_email:   "support@officialtoolstore.com",
  payment_phone:   "01879-009680",
  store_name:      "OfficialToolStore",
  terms_content:   "Terms & Conditions\n\nContent coming soon.",
  refund_content:  "Refund Policy\n\nAll sales are final. Digital products cannot be refunded once delivered.",
  privacy_content: "Privacy Policy\n\nContent coming soon.",
};

export function getSetting(map: SettingsMap, key: string): string {
  return map[key] ?? SETTING_DEFAULTS[key] ?? "";
}

import webpush from "web-push";
import { getDb } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Configure VAPID (runs once at module load)
const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_KEY || "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_EMAIL = process.env.VAPID_EMAIL || "mailto:support@dizistore.com";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);
}

interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

/**
 * Send a push notification to all subscriptions for a given phone number.
 * Automatically cleans up expired/invalid subscriptions (410 Gone).
 */
export async function sendPushToPhone(
  phone: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    console.warn("[Push] VAPID keys not configured, skipping push");
    return { sent: 0, failed: 0 };
  }

  const db = getDb();
  const subs = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.phone, phone));

  if (subs.length === 0) {
    return { sent: 0, failed: 0 };
  }

  let sent = 0;
  let failed = 0;

  const jsonPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || "/lookup",
  });

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        jsonPayload
      );
      sent++;
    } catch (err: unknown) {
      const statusCode = (err as { statusCode?: number })?.statusCode;
      if (statusCode === 410 || statusCode === 404) {
        // Subscription expired or invalid — clean up
        await db
          .delete(pushSubscriptions)
          .where(eq(pushSubscriptions.id, sub.id));
        console.log(`[Push] Removed expired subscription ${sub.id} for ${phone}`);
      } else {
        console.error(`[Push] Failed to send to subscription ${sub.id}:`, err);
      }
      failed++;
    }
  }

  return { sent, failed };
}

"use client";

import { useEffect, useState, useCallback } from "react";

function playNotificationBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  } catch {}
}

const PUSH_DISMISSED_KEY = "dizi_push_dismissed";
const PUSH_SUBSCRIBED_KEY = "dizi_push_subscribed";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// VAPID public key → Uint8Array (ArrayBuffer-backed) for pushManager.subscribe
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const out = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) out[i] = rawData.charCodeAt(i);
  return out;
}

interface PushManagerProps {
  phone: string;
  deviceId: string;
  token: string;
}

export default function PushManager({ phone, deviceId, token }: PushManagerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  // Listen for push events from service worker → play beep (app open / foreground)
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "PLAY_NOTIFICATION_SOUND") playNotificationBeep();
    };
    navigator.serviceWorker.addEventListener("message", handler);
    return () => navigator.serviceWorker.removeEventListener("message", handler);
  }, []);

  // Ensure a push subscription exists on this device AND is saved server-side.
  // Creates one if missing (permission already granted). Idempotent upsert, so
  // running it every visit keeps the admin's customer list accurate.
  const ensureSubscribed = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      let sub = await registration.pushManager.getSubscription();
      if (!sub) {
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY;
        if (!vapidKey) { console.warn("[Push] VAPID key missing"); return; }
        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
        });
      }
      await saveSubscription(sub);
      localStorage.setItem(PUSH_SUBSCRIBED_KEY, "true");
    } catch (e) {
      console.error("[Push] ensureSubscribed failed:", e);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, deviceId]);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission === "denied") return;

    // Permission already granted → make sure a subscription exists & is saved.
    // Runs every visit (idempotent) so a granted-but-unsaved device self-heals.
    if (Notification.permission === "granted") {
      ensureSubscribed();
      return;
    }

    // permission === "default" → offer the banner (unless done / recently dismissed)
    if (localStorage.getItem(PUSH_SUBSCRIBED_KEY) === "true") return;
    const dismissed = localStorage.getItem(PUSH_DISMISSED_KEY);
    if (dismissed && Date.now() - parseInt(dismissed) < DISMISS_DURATION_MS) return;

    const timer = setTimeout(() => setShowBanner(true), 3000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveSubscription = async (subscription: PushSubscription) => {
    const subJson = subscription.toJSON();
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        deviceId,
        subscription: {
          endpoint: subJson.endpoint,
          keys: {
            p256dh: subJson.keys?.p256dh || "",
            auth: subJson.keys?.auth || "",
          },
        },
      }),
    });
  };

  const handleAllow = async () => {
    setSubscribing(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setShowBanner(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY;
      if (!vapidKey) {
        console.warn("[Push] VAPID key not available");
        setShowBanner(false);
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
      });

      await saveSubscription(subscription);
      localStorage.setItem(PUSH_SUBSCRIBED_KEY, "true");
      setShowBanner(false);
    } catch (err) {
      console.error("[Push] Subscribe failed:", err);
    }
    setSubscribing(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(PUSH_DISMISSED_KEY, Date.now().toString());
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 80,
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 2rem)",
        maxWidth: 420,
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        border: "1.5px solid rgba(16, 185, 129, 0.2)",
        borderRadius: "1.25rem",
        padding: "1rem 1.25rem",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(16, 185, 129, 0.08)",
        zIndex: 9999,
        animation: "slideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "0.75rem",
            background: "rgba(16, 185, 129, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.25rem",
            flexShrink: 0,
          }}
        >
          🔔
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: "0.875rem", color: "#0f172a", margin: 0 }}>
            Get notified when your order is ready
          </p>
          <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "0.25rem 0 0", lineHeight: 1.4 }}>
            We&apos;ll send you a notification when your credentials are delivered.
          </p>
        </div>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.875rem" }}>
        <button
          onClick={handleAllow}
          disabled={subscribing}
          style={{
            flex: 1,
            height: 38,
            background: subscribing ? "#94a3b8" : "linear-gradient(135deg, #00c853, #059669)",
            border: "none",
            borderRadius: "0.75rem",
            color: "#fff",
            fontSize: "0.8125rem",
            fontWeight: 700,
            cursor: subscribing ? "wait" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {subscribing ? "Enabling..." : "Allow"}
        </button>
        <button
          onClick={handleDismiss}
          style={{
            height: 38,
            padding: "0 1rem",
            background: "rgba(0, 0, 0, 0.04)",
            border: "1px solid rgba(0, 0, 0, 0.06)",
            borderRadius: "0.75rem",
            color: "#64748b",
            fontSize: "0.8125rem",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Not now
        </button>
      </div>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, 24px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}

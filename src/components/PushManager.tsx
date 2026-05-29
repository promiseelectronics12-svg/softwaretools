"use client";

import { useEffect, useState, useCallback } from "react";

const PUSH_DISMISSED_KEY = "dizi_push_dismissed";
const PUSH_SUBSCRIBED_KEY = "dizi_push_subscribed";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface PushManagerProps {
  phone: string;
  deviceId: string;
  token: string;
}

export default function PushManager({ phone, deviceId, token }: PushManagerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    // Don't show if already subscribed
    if (localStorage.getItem(PUSH_SUBSCRIBED_KEY) === "true") return;

    // Don't show if recently dismissed
    const dismissed = localStorage.getItem(PUSH_DISMISSED_KEY);
    if (dismissed && Date.now() - parseInt(dismissed) < DISMISS_DURATION_MS) return;

    // Don't show if browser doesn't support push
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    // Don't show if already granted or denied
    if (Notification.permission === "denied") return;
    if (Notification.permission === "granted") {
      // Already granted but maybe not subscribed on this device — try silent subscribe
      silentSubscribe();
      return;
    }

    // Show the banner after a short delay
    const timer = setTimeout(() => setShowBanner(true), 3000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const silentSubscribe = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub) {
        // Already subscribed, just make sure server knows
        await saveSubscription(existingSub);
        localStorage.setItem(PUSH_SUBSCRIBED_KEY, "true");
      }
    } catch {}
  }, [token, deviceId]);

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

      // Convert VAPID key to Uint8Array
      const urlBase64ToUint8Array = (base64String: string) => {
        const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
        const rawData = window.atob(base64);
        return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
      };

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
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

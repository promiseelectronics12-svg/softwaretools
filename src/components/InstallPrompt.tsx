"use client";

import { useEffect, useState } from "react";

const INSTALL_DISMISSED_KEY = "dizi_install_dismissed";
const DISMISS_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed recently
    const dismissed = localStorage.getItem(INSTALL_DISMISSED_KEY);
    if (dismissed && Date.now() - parseInt(dismissed) < DISMISS_DURATION_MS) return;

    // Don't show if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show after a small delay so page settles first
      setTimeout(() => setShowBanner(true), 2000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(INSTALL_DISMISSED_KEY, Date.now().toString());
    setShowBanner(false);
    setDeferredPrompt(null);
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
        maxWidth: 400,
        background: "rgba(255, 255, 255, 0.96)",
        backdropFilter: "blur(20px)",
        border: "1.5px solid rgba(16, 185, 129, 0.15)",
        borderRadius: "1.25rem",
        padding: "1rem 1.25rem",
        boxShadow:
          "0 10px 40px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(16, 185, 129, 0.06)",
        zIndex: 9998,
        animation: "installSlideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "0.75rem",
            background: "linear-gradient(135deg, #00c853, #059669)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.25rem",
            flexShrink: 0,
            boxShadow: "0 4px 12px rgba(16,185,129,0.2)",
          }}
        >
          📲
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontWeight: 700,
              fontSize: "0.875rem",
              color: "#0f172a",
              margin: 0,
            }}
          >
            Install Official Toon Store
          </p>
          <p
            style={{
              fontSize: "0.75rem",
              color: "#64748b",
              margin: "0.125rem 0 0",
            }}
          >
            Add to home screen for faster access
          </p>
        </div>
        <button
          onClick={handleDismiss}
          style={{
            background: "none",
            border: "none",
            color: "#94a3b8",
            fontSize: "1.125rem",
            cursor: "pointer",
            padding: "0.25rem",
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      </div>
      <button
        onClick={handleInstall}
        style={{
          width: "100%",
          height: 38,
          marginTop: "0.75rem",
          background: "linear-gradient(135deg, #00c853, #059669)",
          border: "none",
          borderRadius: "0.75rem",
          color: "#fff",
          fontSize: "0.8125rem",
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "inherit",
          boxShadow: "0 4px 12px rgba(16,185,129,0.18)",
        }}
      >
        Install App
      </button>
      <style>{`
        @keyframes installSlideUp {
          from { opacity: 0; transform: translate(-50%, 24px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}

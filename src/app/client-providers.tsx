"use client";

import { ReactNode, useEffect, useState } from "react";
import { LanguageProvider } from "@/lib/language-context";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import MobileDock from "@/components/MobileDock";

/**
 * ClientProviders — wraps the entire app with context providers.
 * Auth context is kept for admin compatibility but no longer required for customers.
 */
export function ClientProviders({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Small delay to prevent FOUC (flash of unstyled content)
    setReady(true);
  }, []);

  return (
    <AuthProvider initialUser={null}>
      <LanguageProvider>
        <CartProvider>
          {!ready ? (
            /* ─── Splash Screen ─── */
            <div
              style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "#f5f7f5",
                gap: "1.25rem",
              }}
            >
              <div
                style={{
                  width: 60, height: 60,
                  borderRadius: "1.25rem",
                  background: "linear-gradient(135deg,#00c853,#059669)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(16,185,129,0.25)",
                  animation: "float 0.9s ease-in-out infinite",
                }}
              >
                <svg width="28" height="28" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          ) : (
            <>
              {children}
              <MobileDock />
            </>
          )}
        </CartProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

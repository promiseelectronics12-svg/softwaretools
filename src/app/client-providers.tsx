"use client";

import { ReactNode, useEffect } from "react";
import { LanguageProvider } from "@/lib/language-context";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import MobileDock from "@/components/MobileDock";
import InstallPrompt from "@/components/InstallPrompt";
import { registerServiceWorker } from "@/lib/register-sw";

export function ClientProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <AuthProvider initialUser={null}>
      <LanguageProvider>
        <CartProvider>
          {children}
          <MobileDock />
          <InstallPrompt />
        </CartProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

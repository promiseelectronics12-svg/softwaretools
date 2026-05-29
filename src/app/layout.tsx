import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "./client-providers";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "OfficialToolStore — Premium Digital Tools",
  description:
    "Instant access to premium accounts & subscriptions. Lightning-fast delivery.",
  keywords: ["premium tools", "digital subscriptions", "streaming", "AI tools"],
  openGraph: {
    title: "OfficialToolStore — Premium Digital Tools",
    description:
      "Instant access to premium accounts & subscriptions. Lightning-fast delivery.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={outfit.variable}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#f5f7f5" />
        {/* PWA */}
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DiziStore" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

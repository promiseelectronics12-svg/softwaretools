import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "./client-providers";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f5f7f5",
};

export const metadata: Metadata = {
  title: "Official Tool Store — Premium Digital Tools",
  description:
    "Instant access to premium accounts & subscriptions. Lightning-fast delivery.",
  keywords: ["premium tools", "digital subscriptions", "streaming", "AI tools"],
  openGraph: {
    title: "Official Tool Store — Premium Digital Tools",
    description:
      "Instant access to premium accounts & subscriptions. Lightning-fast delivery.",
    type: "website",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tool Store",
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
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

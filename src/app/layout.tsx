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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dizistore.com";
const siteName = "DiziStore";
const siteDescription =
  "Buy premium digital tools, online subscriptions, AI tools, streaming accounts, and software services in Bangladesh with fast delivery and secure support.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f5f7f5",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DiziStore Bangladesh — Premium Digital Tools & Subscriptions",
    template: "%s | DiziStore Bangladesh",
  },
  description: siteDescription,
  applicationName: siteName,
  category: "shopping",
  keywords: [
    "DiziStore",
    "digital tools Bangladesh",
    "premium tools Bangladesh",
    "online subscriptions Bangladesh",
    "AI tools Bangladesh",
    "streaming accounts Bangladesh",
    "software tools Bangladesh",
    "premium accounts BD",
    "buy digital services Bangladesh",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "DiziStore Bangladesh — Premium Digital Tools & Subscriptions",
    description: siteDescription,
    url: "/",
    siteName,
    locale: "en_BD",
    type: "website",
    images: [
      {
        url: "/icons/android-chrome-512x512.png",
        width: 1200,
        height: 630,
        alt: "DiziStore premium digital tools and subscriptions in Bangladesh",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DiziStore Bangladesh — Premium Digital Tools & Subscriptions",
    description: siteDescription,
    images: ["/icons/android-chrome-512x512.png"],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteName,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: siteName,
        url: siteUrl,
        logo: `${siteUrl}/icons/icon-512x512.png`,
        areaServed: {
          "@type": "Country",
          name: "Bangladesh",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: `${siteName} Bangladesh`,
        url: siteUrl,
        description: siteDescription,
        inLanguage: "en-BD",
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
      },
      {
        "@type": "OnlineStore",
        "@id": `${siteUrl}/#store`,
        name: `${siteName} Bangladesh`,
        url: siteUrl,
        description: siteDescription,
        image: `${siteUrl}/icons/og-image.png`,
        areaServed: {
          "@type": "Country",
          name: "Bangladesh",
        },
        currenciesAccepted: "BDT",
        paymentAccepted: "Online payment, Mobile banking",
      },
    ],
  };

  return (
    <html lang="en" className={outfit.variable}>
      <head>
        <meta name="geo.region" content="BD" />
        <meta name="geo.placename" content="Bangladesh" />
        <meta name="distribution" content="Bangladesh" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

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
      </head>
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

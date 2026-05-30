import type { MetadataRoute } from "next";
import { getDb } from "@/lib/db";
import { products } from "@/lib/db/schema";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://softwaretools.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl,                   lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${siteUrl}/shop`,         lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${siteUrl}/contact`,      lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/terms`,        lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/refund`,       lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/lookup`,       lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  // Dynamic product pages
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const db = getDb();
    const allProducts = await db.select({ id: products.id, updatedAt: products.createdAt }).from(products);
    productPages = allProducts.map((p) => ({
      url:             `${siteUrl}/product/${p.id}`,
      lastModified:    p.updatedAt ?? now,
      changeFrequency: "weekly" as const,
      priority:        0.8,
    }));
  } catch {
    // DB unavailable — return static pages only
  }

  return [...staticPages, ...productPages];
}

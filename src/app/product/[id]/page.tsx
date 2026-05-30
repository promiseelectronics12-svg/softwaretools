import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import ProductDetail from "@/components/ProductDetail";
import { getDb } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://softwaretools.vercel.app";

async function getProduct(id: string) {
  try {
    const db = getDb();
    const [p] = await db.select().from(products).where(eq(products.id, parseInt(id))).limit(1);
    return p ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const p = await getProduct(id);
  if (!p) return { title: "Product Not Found" };

  const title       = `${p.nameEn} | Official Tool Store`;
  const description = p.shortDescEn || p.fullDescEn || "Premium digital subscription — fast delivery, replacement warranty.";
  const image       = p.image || `${siteUrl}/icons/og-image.png`;
  const url         = `${siteUrl}/product/${id}`;
  const price       = p.packages?.[0]?.bdt ? String(p.packages[0].bdt) : undefined;

  return {
    title: p.nameEn,
    description,
    alternates: { canonical: `/product/${id}` },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: p.nameEn }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    // Facebook product namespace meta tags
    other: {
      "og:type":                "product",
      ...(price ? {
        "product:price:amount":   price,
        "product:price:currency": "BDT",
        "og:price:amount":        price,
        "og:price:currency":      "BDT",
      } : {}),
      "product:availability":   p.stock > 0 ? "in stock" : "out of stock",
      "product:condition":      "new",
      "product:retailer_item_id": String(p.id),
    },
  };
}

export default async function ProductPage(
  { params }: { params: Promise<{ id: string }> }
) {
  // params consumed by generateMetadata — page just renders the client component
  await params;
  return (
    <PageShell>
      <ProductDetail />
    </PageShell>
  );
}

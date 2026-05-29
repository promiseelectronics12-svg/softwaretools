"use client";

import { Suspense } from "react";
import PageShell from "@/components/PageShell";
import ProductGrid from "@/components/ProductGrid";

export default function ShopPage() {
  return (
    <PageShell>
      <Suspense
        fallback={
          <div className="container" style={{ paddingTop: "3rem" }}>
            <div className="skeleton" style={{ height: 384, borderRadius: "1.25rem" }} />
          </div>
        }
      >
        <ProductGrid isShopPage />
      </Suspense>
    </PageShell>
  );
}

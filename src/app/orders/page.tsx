"use client";

import { Suspense } from "react";
import PageShell from "@/components/PageShell";
import OrdersPage from "@/components/OrdersPage";

export default function Orders() {
  return (
    <PageShell>
      <Suspense
        fallback={
          <div className="container" style={{ paddingTop: "3rem" }}>
            <div className="skeleton" style={{ height: 320, borderRadius: "1.25rem" }} />
          </div>
        }
      >
        <OrdersPage />
      </Suspense>
    </PageShell>
  );
}

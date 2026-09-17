import React, { Suspense } from "react";
import { Metadata } from "next";
import AccessoriesClient from "./AccessoriesClient";
import { fetchAccessoriesFromSupabase, AccessoryProduct } from "@/lib/accessories";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Mobile Accessories & Phone Cases Store in Gurugram",
  description: "Shop genuine phone cases, fast chargers, tempered glass protectors, and Type-C cables for 600+ phone models in Gurugram. Express delivery & in-store fitting.",
  keywords: [
    "mobile accessories Gurugram",
    "phone cases Gurgaon",
    "mobile charger store Gurugram",
    "tempered glass Gurgaon",
    "mobile accessories shop Sector 37C"
  ],
  alternates: {
    canonical: "https://www.smartcaremobile.in/accessories",
  },
  openGraph: {
    title: "Mobile Accessories & Cases Store in Gurugram | Smart Care",
    description: "Shop genuine phone cases, fast chargers & screen guards in Gurugram.",
    url: "https://www.smartcaremobile.in/accessories",
  },
};

export const revalidate = 3600; // ISR revalidate catalog every hour

async function getInitialServerAccessories(): Promise<{ products: AccessoryProduct[]; totalCount: number; hasMore: boolean }> {
  try {
    const res = await fetchAccessoriesFromSupabase({ page: 0, pageSize: 24 });
    return res;
  } catch (e) {
    return { products: [], totalCount: 0, hasMore: false };
  }
}

export default async function AccessoriesPage() {
  const initialData = await getInitialServerAccessories();

  const storeSchema = {
    "@context": "https://schema.org",
    "@type": "ItemPage",
    "name": "Mobile Accessories & Cases Store Gurugram",
    "description": "Genuine phone cases, tempered glass, fast chargers, and audio cables in Gurugram.",
    "url": "https://www.smartcaremobile.in/accessories"
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.smartcaremobile.in" },
      { "@type": "ListItem", "position": 2, "name": "Accessories Store", "item": "https://www.smartcaremobile.in/accessories" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Crawlable initial HTML product catalog for Search Engines */}
      {initialData.products.length > 0 && (
        <div className="sr-only" id="server-rendered-accessories-catalog">
          <h2>Smart Care Mobile Accessories Catalog</h2>
          <ul>
            {initialData.products.map((p) => (
              <li key={p.id}>
                <h3>{p.name}</h3>
                <p>Category: {p.category} | Brand: {p.brand} | Price: ₹{p.price}</p>
                <p>{p.description}</p>
                <a href={`/accessories/${p.id}`}>{p.name} Details</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Suspense fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }>
        <AccessoriesClient 
          initialProducts={initialData.products} 
          initialTotalCount={initialData.totalCount}
          initialHasMore={initialData.hasMore}
        />
      </Suspense>
    </>
  );
}

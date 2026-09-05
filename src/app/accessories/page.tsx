import React from "react";
import { Metadata } from "next";
import AccessoriesClient from "./AccessoriesClient";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { AccessoryProduct } from "@/lib/accessories";

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

async function getInitialServerAccessories(): Promise<AccessoryProduct[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data } = await supabase.from("accessories").select("*");
    if (!data) return [];
    return data.map((item: any) => ({
      id: String(item.id),
      name: item.name || "Accessory Product",
      category: item.category || "case",
      brand: item.brand || "Generic",
      price: Number(item.price || 0),
      originalPrice: item.original_price ? Number(item.original_price) : null,
      inStock: item.in_stock !== false,
      isOnSale: item.is_on_sale || false,
      rating: Number(item.rating || 4.8),
      reviewsCount: Number(item.reviews_count || 15),
      image: item.image || (item.images && item.images[0]) || "/shop_accessories.png",
      images: item.images || [item.image || "/shop_accessories.png"],
      specifications: item.specifications || {},
      description: item.description || ""
    }));
  } catch (e) {
    return [];
  }
}

export default async function AccessoriesPage() {
  const initialProducts = await getInitialServerAccessories();

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
      {initialProducts.length > 0 && (
        <div className="sr-only" id="server-rendered-accessories-catalog">
          <h2>Smart Care Mobile Accessories Catalog</h2>
          <ul>
            {initialProducts.map((p) => (
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

      <AccessoriesClient initialProducts={initialProducts} />
    </>
  );
}

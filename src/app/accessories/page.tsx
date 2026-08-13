import React from "react";
import { Metadata } from "next";
import AccessoriesClient from "./AccessoriesClient";

export const metadata: Metadata = {
  title: "Mobile Accessories & Phone Cases Store in Gurugram",
  description: "Shop genuine phone cases, fast chargers, tempered glass protectors, and Type-C cables for 600+ phone models in Gurugram. Express doorstep delivery & in-store fitting.",
  keywords: [
    "mobile accessories Gurugram",
    "phone cases Gurgaon",
    "mobile charger store Gurugram",
    "tempered glass Gurgaon",
    "mobile accessories shop Sector 37C"
  ],
  alternates: {
    canonical: "https://smartcaremobile.in/accessories",
  },
  openGraph: {
    title: "Mobile Accessories & Cases Store in Gurugram | Smart Care",
    description: "Shop genuine phone cases, fast chargers & screen guards in Gurugram.",
    url: "https://smartcaremobile.in/accessories",
  },
};

export default function AccessoriesPage() {
  const storeSchema = {
    "@context": "https://schema.org",
    "@type": "ItemPage",
    "name": "Mobile Accessories & Cases Store Gurugram",
    "description": "Genuine phone cases, tempered glass, fast chargers, and audio cables in Gurugram.",
    "url": "https://smartcaremobile.in/accessories"
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://smartcaremobile.in" },
      { "@type": "ListItem", "position": 2, "name": "Accessories Store", "item": "https://smartcaremobile.in/accessories" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <AccessoriesClient />
    </>
  );
}

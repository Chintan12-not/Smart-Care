import React from "react";
import { Metadata } from "next";
import CorporateClient from "./CorporateClient";

export const metadata: Metadata = {
  title: "Corporate Mobile Accessories & Bulk Repair Services in Gurugram",
  description: "B2B wholesale procurement for corporate mobile accessories, bulk phone cases, screen protectors, fast chargers, and enterprise device repair services in Gurugram with 100% GST invoices.",
  keywords: [
    "corporate mobile accessories Gurugram",
    "bulk phone cases Gurgaon",
    "wholesale mobile chargers Gurugram",
    "B2B phone repair Gurgaon",
    "corporate mobile gifting Gurgaon"
  ],
  alternates: {
    canonical: "https://smartcaremobile.in/corporate-orders",
  },
  openGraph: {
    title: "Corporate Mobile Accessories & Bulk Repair | Smart Care Gurugram",
    description: "B2B wholesale corporate mobile accessories & bulk device repair in Gurugram.",
    url: "https://smartcaremobile.in/corporate-orders",
  },
};

export default function CorporateOrdersPage() {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Corporate Mobile Accessories & Bulk Repair Gurugram",
    "provider": {
      "@type": "MobilePhoneStore",
      "name": "Smart Care & Mobile Point",
      "telephone": "+919289942313",
      "url": "https://smartcaremobile.in"
    },
    "areaServed": "Gurugram",
    "serviceType": "B2B Corporate Mobile Procurement & Repair",
    "description": "Custom B2B bulk orders for mobile accessories, chargers, corporate gifting kits, and institutional repair services in Gurugram."
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://smartcaremobile.in" },
      { "@type": "ListItem", "position": 2, "name": "Corporate & Bulk Orders", "item": "https://smartcaremobile.in/corporate-orders" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <CorporateClient />
    </>
  );
}

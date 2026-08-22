import React from "react";
import { Metadata } from "next";
import PickupClient from "./PickupClient";

export const metadata: Metadata = {
  title: "Doorstep Mobile Repair Pickup & Delivery in Gurugram",
  description: "Book doorstep mobile repair pickup across Sector 37C, Sector 45, DLF, Sohna Road & Cyber City in Gurugram. Fast 45-min repair, anti-static safety packaging & doorstep payment.",
  keywords: [
    "doorstep mobile repair Gurugram",
    "mobile pickup repair Gurgaon",
    "mobile screen replacement pickup Gurgaon",
    "phone repair home delivery Sector 37C"
  ],
  alternates: {
    canonical: "https://www.smartcaremobile.in/pickup",
  },
  openGraph: {
    title: "Doorstep Mobile Repair Pickup & Delivery in Gurugram | Smart Care",
    description: "Free doorstep mobile repair pickup within 5 km in Gurugram. Same-day screen & battery service.",
    url: "https://www.smartcaremobile.in/pickup",
  },
};

export default function PickupPage() {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Doorstep Mobile Repair Pickup & Delivery Gurugram",
    "provider": {
      "@type": "MobilePhoneStore",
      "name": "Smart Care & Mobile Point",
      "telephone": "+919289942313",
      "url": "https://www.smartcaremobile.in"
    },
    "areaServed": "Gurugram",
    "serviceType": "Doorstep Smartphone Logistics & Repair",
    "description": "Safe anti-static doorstep pickup, express workshop repair, and same-day delivery back to customer address."
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://smartcaremobile.in" },
      { "@type": "ListItem", "position": 2, "name": "Pickup & Drop Service", "item": "https://smartcaremobile.in/pickup" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <PickupClient />
    </>
  );
}

import React from "react";
import { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";
import { MOCK_ACCESSORIES } from "@/lib/accessories";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = MOCK_ACCESSORIES.find(p => String(p.id) === String(id));

  if (!product) {
    return {
      title: "Mobile Accessory Product | Smart Care Gurugram",
      description: "Buy genuine smartphone accessories, fast chargers, cases, and tempered glass in Gurugram.",
      alternates: {
        canonical: `https://smartcaremobile.in/accessories/${id}`,
      }
    };
  }

  return {
    title: `${product.name} - ${product.brand} | Buy in Gurugram`,
    description: `Buy ${product.name} in Gurugram. Genuine ${product.brand} ${product.category} with express doorstep delivery, 7-day fit guarantee & store pickup at Sector 37C.`,
    keywords: [
      product.name,
      `${product.brand} ${product.category}`,
      `buy ${product.name} Gurgaon`,
      "mobile accessories Gurugram"
    ],
    alternates: {
      canonical: `https://smartcaremobile.in/accessories/${product.id}`,
    },
    openGraph: {
      title: `${product.name} | Smart Care Gurugram`,
      description: `Buy ${product.name} in Gurugram with same-day doorstep delivery.`,
      url: `https://smartcaremobile.in/accessories/${product.id}`,
      images: [
        {
          url: product.image.startsWith("/") ? `https://smartcaremobile.in${product.image}` : product.image,
          width: 800,
          height: 800,
          alt: product.name,
        }
      ]
    }
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <ProductDetailClient productId={id} />
  );
}

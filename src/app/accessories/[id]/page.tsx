import React from "react";
import { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: "Mobile Accessory Product | Smart Care Gurugram",
    description: "Buy genuine smartphone accessories, fast chargers, cases, and tempered glass in Gurugram.",
    alternates: {
      canonical: `https://smartcaremobile.in/accessories/${id}`,
    }
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <ProductDetailClient productId={id} />
  );
}

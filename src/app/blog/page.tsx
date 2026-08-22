import React from "react";
import { Metadata } from "next";
import BlogClient from "./BlogClient";
import { ARTICLES } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Mobile Repair & Smartphone Battery Maintenance Blog | Gurugram",
  description: "Read expert hardware repair guides, iPhone screen replacement cost breakdowns in Gurugram, battery health warning signs, and fast-charging troubleshooting tips.",
  keywords: [
    "mobile repair blog Gurugram",
    "iPhone screen replacement cost Gurgaon",
    "phone battery health signs",
    "charging port fix Gurgaon"
  ],
  alternates: {
    canonical: "https://www.smartcaremobile.in/blog",
  },
  openGraph: {
    title: "Mobile Repair & Maintenance Blog | Smart Care Gurugram",
    description: "Expert hardware guides & repair cost estimates for Gurugram smartphone owners.",
    url: "https://www.smartcaremobile.in/blog",
  },
};

export default function BlogPage() {
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Smart Care Mobile Repair & Maintenance Tech Blog",
    "description": "Guides and hardware maintenance tips for smartphones in Gurugram.",
    "url": "https://www.smartcaremobile.in/blog",
    "blogPost": ARTICLES.map(art => ({
      "@type": "BlogPosting",
      "headline": art.title,
      "description": art.summary,
      "datePublished": "2026-07-01",
      "author": { "@type": "Person", "name": art.author }
    }))
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.smartcaremobile.in" },
      { "@type": "ListItem", "position": 2, "name": "Blog & Tech Guides", "item": "https://www.smartcaremobile.in/blog" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <BlogClient />
    </>
  );
}

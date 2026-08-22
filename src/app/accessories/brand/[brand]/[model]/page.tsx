import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Smartphone, ChevronRight, Check, ShoppingBag, PhoneCall } from "lucide-react";
import phoneData from "@/data/phoneModels.json";
import { formatINR } from "@/lib/utils";
import ProductCardImageSlider from "@/components/accessories/ProductCardImageSlider";

interface ModelPageProps {
  params: Promise<{ brand: string; model: string }>;
}

export async function generateMetadata({ params }: ModelPageProps): Promise<Metadata> {
  const { brand: rawBrand, model: rawModel } = await params;
  const brandName = rawBrand.charAt(0).toUpperCase() + rawBrand.slice(1);
  const modelName = rawModel.split("-").map(w => w.toUpperCase() === "PRO" || w.toUpperCase() === "MAX" ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  return {
    title: `${brandName} ${modelName} Accessories, Covers & Screen Protectors`,
    description: `Shop drop-tested shockproof cases, 9H tempered glass screen protectors, fast chargers, and Type-C cables custom engineered for ${brandName} ${modelName} at smartcaremobile.in.`,
    keywords: [
      `${brandName} ${modelName} cases`,
      `${brandName} ${modelName} tempered glass`,
      `${brandName} ${modelName} charger`,
      `${brandName} ${modelName} accessories Gurugram`
    ],
    alternates: {
      canonical: `https://smartcaremobile.in/accessories/brand/${rawBrand.toLowerCase()}/${rawModel.toLowerCase()}`,
    },
  };
}

export default async function ModelAccessoriesPage({ params }: ModelPageProps) {
  const { brand: rawBrand, model: rawModel } = await params;
  const normalizedBrand = rawBrand.toLowerCase();

  const matchedBrandKey = phoneData.brands.find(b => b.toLowerCase() === normalizedBrand);
  if (!matchedBrandKey) {
    notFound();
  }

  const modelFormatted = rawModel.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  const faqs = [
    {
      q: `Will these cases fit my ${matchedBrandKey} ${modelFormatted}?`,
      a: `Yes! Every accessory listed on this page is custom-engineered with precision camera and port cutouts specifically for the ${matchedBrandKey} ${modelFormatted}.`
    },
    {
      q: `Do you deliver accessories in Gurugram?`,
      a: `Yes, we provide fast delivery across Gurugram, and doorstep pickup is also available if you need screen guard installation at your location.`
    }
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://smartcaremobile.in" },
      { "@type": "ListItem", "position": 2, "name": "Accessories", "item": "https://smartcaremobile.in/accessories" },
      { "@type": "ListItem", "position": 3, "name": matchedBrandKey, "item": `https://smartcaremobile.in/accessories/brand/${normalizedBrand}` },
      { "@type": "ListItem", "position": 4, "name": modelFormatted, "item": `https://smartcaremobile.in/accessories/brand/${normalizedBrand}/${rawModel}` }
    ]
  };

  return (
    <div className="flex-grow bg-background text-foreground pb-20 pt-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumbs */}
        <nav className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/accessories" className="hover:text-foreground">Accessories</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={`/accessories/brand/${normalizedBrand}`} className="hover:text-foreground">{matchedBrandKey}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-semibold">{modelFormatted}</span>
        </nav>

        {/* Header */}
        <div className="glass-card rounded-3xl p-8 border border-border bg-card shadow-xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Check className="h-3.5 w-3.5" />
            Exact Fit Guaranteed For {matchedBrandKey} {modelFormatted}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            {matchedBrandKey} {modelFormatted} Accessories & Covers
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Explore 100% compatible protective cases, edge-to-edge 9H tempered glass screen protectors, fast wall chargers, and original Type-C charging cables.
          </p>
        </div>

        {/* Accessories Product Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Compatible Accessories List</h2>
          <div className="p-8 rounded-3xl bg-card border border-border text-center space-y-3">
            <ShoppingBag className="h-10 w-10 text-emerald-500 mx-auto opacity-80" />
            <h3 className="font-bold text-foreground text-sm">Custom Stock for {matchedBrandKey} {modelFormatted}</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              We stock custom protective cases, 9H tempered glass screen protectors, and fast chargers specifically for your {matchedBrandKey} {modelFormatted}.
            </p>
            <div className="pt-2">
              <Link
                href={`/accessories?brand=${encodeURIComponent(matchedBrandKey)}&model=${encodeURIComponent(modelFormatted)}`}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 text-black font-extrabold text-xs inline-flex items-center gap-2 hover:bg-emerald-400 transition-colors"
              >
                <span>Browse All Accessories</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-4 max-w-3xl mx-auto pt-6 border-t border-border">
          <h2 className="text-xl font-bold text-foreground text-center">Frequently Asked Questions</h2>
          {faqs.map((f, i) => (
            <div key={i} className="p-5 rounded-2xl bg-card border border-border space-y-2">
              <h3 className="font-bold text-sm text-foreground">{f.q}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

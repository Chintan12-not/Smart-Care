import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Smartphone, ChevronRight, Check, ShoppingBag } from "lucide-react";
import phoneData from "@/data/phoneModels.json";

interface BrandPageProps {
  params: Promise<{ brand: string }>;
}

function getValidBrand(rawBrand: string): string | null {
  const normalized = rawBrand.toLowerCase().trim();
  if (normalized === "iphone") return "Apple";
  const found = phoneData.brands.find(b => b.toLowerCase() === normalized);
  return found || null;
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { brand: rawBrand } = await params;
  const matchedBrandKey = getValidBrand(rawBrand);
  if (!matchedBrandKey) {
    return {
      title: "Accessories Brand Not Found | Smart Care Gurugram",
      description: "Browse smartphone accessories by brand at Smart Care Gurugram.",
    };
  }

  return {
    title: `${matchedBrandKey} Phone Cases, Chargers & Accessories Store`,
    description: `Shop genuine cases, 9H tempered glass screen protectors, GaN fast chargers, and Type-C cables compatible with all ${matchedBrandKey} phone models at smartcaremobile.in.`,
    keywords: [
      `${matchedBrandKey} accessories`,
      `${matchedBrandKey} phone cases Gurugram`,
      `${matchedBrandKey} chargers`,
      `${matchedBrandKey} tempered glass`
    ],
    alternates: {
      canonical: `https://smartcaremobile.in/accessories/brand/${matchedBrandKey.toLowerCase()}`,
    },
  };
}

export default async function BrandAccessoriesPage({ params }: BrandPageProps) {
  const { brand: rawBrand } = await params;
  const matchedBrandKey = getValidBrand(rawBrand);
  if (!matchedBrandKey) {
    notFound();
  }

  const normalizedBrand = matchedBrandKey.toLowerCase();
  const brandModels = (phoneData.brandModels as Record<string, Array<{ id: string; name: string; series: string }>>)[matchedBrandKey] || [];

  return (
    <div className="flex-grow bg-background text-foreground pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/accessories" className="hover:text-foreground">Accessories</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-semibold">{matchedBrandKey}</span>
        </nav>

        {/* Brand Header */}
        <div className="glass-card rounded-3xl p-8 border border-border bg-card shadow-xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Smartphone className="h-3.5 w-3.5" />
            {matchedBrandKey} Compatible Accessories Hub
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            {matchedBrandKey} Phone Covers, Glass & Fast Chargers
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Browse custom-fit shockproof cases, 9H tempered screen guards, certified fast charging bricks, and cables engineered specifically for {brandModels.length} {matchedBrandKey} smartphone models.
          </p>
        </div>

        {/* Model Selector Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Select Your {matchedBrandKey} Model</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {brandModels.map((m) => {
              const modelSlug = m.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
              return (
                <Link
                  key={m.id}
                  href={`/accessories/brand/${normalizedBrand}/${modelSlug}`}
                  className="p-3.5 rounded-2xl bg-card border border-border/80 hover:border-emerald-500/50 hover:bg-muted/40 transition-all flex flex-col justify-between group"
                >
                  <span className="font-extrabold text-xs text-foreground group-hover:text-emerald-500 transition-colors truncate">
                    {m.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-1 font-medium flex items-center justify-between">
                    <span>Accessories</span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-emerald-500" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

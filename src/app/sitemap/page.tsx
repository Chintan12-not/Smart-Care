import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { 
  Map, 
  Wrench, 
  ShoppingBag, 
  Building2, 
  FileText, 
  ShieldCheck, 
  ArrowLeft, 
  ChevronRight, 
  Smartphone,
  BookOpen
} from "lucide-react";

export const metadata: Metadata = {
  title: "HTML Sitemap | Smart Care & Mobile Point Gurugram",
  description: "Complete sitemap directory of Smart Care & Mobile Point. Explore doorstep mobile repair services in Gurugram, genuine accessories by phone model, blog guides, and corporate services.",
  alternates: {
    canonical: "https://smartcaremobile.in/sitemap",
  },
};

export default function HtmlSitemapPage() {
  const brandCategories = [
    { name: "Apple iPhone Accessories", href: "/accessories/brand/apple" },
    { name: "Samsung Galaxy Accessories", href: "/accessories/brand/samsung" },
    { name: "OnePlus Accessories", href: "/accessories/brand/oneplus" },
    { name: "Xiaomi & Redmi Accessories", href: "/accessories/brand/xiaomi" },
    { name: "Vivo Phone Accessories", href: "/accessories/brand/vivo" },
    { name: "Oppo Accessories", href: "/accessories/brand/oppo" },
    { name: "Realme Accessories", href: "/accessories/brand/realme" },
    { name: "Google Pixel Accessories", href: "/accessories/brand/google" },
  ];

  const modelLandingPages = [
    { name: "iPhone 15 Pro Accessories", href: "/accessories/brand/apple/iphone-15-pro" },
    { name: "iPhone 15 Accessories", href: "/accessories/brand/apple/iphone-15" },
    { name: "iPhone 14 Accessories", href: "/accessories/brand/apple/iphone-14" },
    { name: "iPhone 13 Accessories", href: "/accessories/brand/apple/iphone-13" },
    { name: "Samsung S24 Ultra Accessories", href: "/accessories/brand/samsung/s24-ultra" },
    { name: "Samsung S23 Accessories", href: "/accessories/brand/samsung/s23" },
    { name: "OnePlus 12 Accessories", href: "/accessories/brand/oneplus/oneplus-12" },
    { name: "OnePlus Nord 3 Accessories", href: "/accessories/brand/oneplus/nord-3" },
  ];

  const repairLandingPages = [
    { name: "Doorstep Mobile Repair in Gurugram", href: "/mobile-repair-gurugram" },
    { name: "Apple iPhone Repair Center Gurugram", href: "/iphone-repair-gurugram" },
    { name: "Samsung Galaxy Repair Service Gurugram", href: "/samsung-repair-gurugram" },
    { name: "Screen & Glass Replacement Gurugram", href: "/screen-replacement-gurugram" },
    { name: "Book Doorstep Repair Pickup", href: "/pickup" },
    { name: "AI Diagnostics Cost Estimator", href: "/repair" },
  ];

  const blogGuides = [
    { name: "iPhone Screen Replacement Cost in Gurgaon Guide", href: "/blog/iphone-screen-replacement-cost-gurgaon" },
    { name: "When to Replace Phone Battery: Signs & Tips", href: "/blog/when-to-replace-phone-battery" },
    { name: "Smart Care Hardware Repair Blog Directory", href: "/blog" },
  ];

  return (
    <div className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Top Header */}
      <div className="space-y-3 border-b border-border pb-6">
        <Link href="/" className="inline-flex items-center gap-1 text-xs font-bold text-cyan-500 hover:underline mb-2">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
        </Link>
        <div className="flex items-center gap-2 text-cyan-500">
          <Map className="h-6 w-6" />
          <span className="text-xs font-extrabold uppercase tracking-wider">Website Directory</span>
        </div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">Website Sitemap</h1>
        <p className="text-xs text-muted-foreground">
          Explore all service pages, phone model accessory catalogs, repair guides, and legal resources on <strong className="text-foreground">smartcaremobile.in</strong>.
        </p>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Column 1: Core Pages & Gurugram Repairs */}
        <div className="space-y-8">
          
          {/* Main Website Pages */}
          <div className="p-6 bg-card border border-border rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-500 font-extrabold text-sm uppercase tracking-wider border-b border-border/60 pb-3">
              <Smartphone className="h-5 w-5" />
              <span>Main Store & Service Hubs</span>
            </div>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link href="/" className="flex items-center justify-between text-foreground hover:text-emerald-500 transition-colors">
                  <span>Home Page</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              </li>
              <li>
                <Link href="/accessories" className="flex items-center justify-between text-foreground hover:text-emerald-500 transition-colors">
                  <span>Accessories Store Catalog</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              </li>
              <li>
                <Link href="/pickup" className="flex items-center justify-between text-foreground hover:text-emerald-500 transition-colors">
                  <span>Doorstep Repair Pickup Booking</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              </li>
              <li>
                <Link href="/mobile-assistant" className="flex items-center justify-between text-foreground hover:text-emerald-500 transition-colors">
                  <span>AI Mobile Repair Assistant</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              </li>
              <li>
                <Link href="/corporate-bulk-orders" className="flex items-center justify-between text-foreground hover:text-emerald-500 transition-colors">
                  <span>Corporate Bulk Orders & Wholesale</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="flex items-center justify-between text-foreground hover:text-emerald-500 transition-colors">
                  <span>Customer Dashboard & Order Tracking</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              </li>
              <li>
                <Link href="/login" className="flex items-center justify-between text-foreground hover:text-emerald-500 transition-colors">
                  <span>Customer Login / Register</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Gurugram Repair Landing Pages */}
          <div className="p-6 bg-card border border-border rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-cyan-500 font-extrabold text-sm uppercase tracking-wider border-b border-border/60 pb-3">
              <Wrench className="h-5 w-5" />
              <span>Gurugram Doorstep Mobile Repair Pages</span>
            </div>
            <ul className="space-y-2.5 text-xs font-medium">
              {repairLandingPages.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="flex items-center justify-between text-foreground hover:text-cyan-500 transition-colors">
                    <span>{item.name}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Column 2: Brand Accessories & Model Catalogs */}
        <div className="space-y-8">
          
          {/* Brand Accessories Catalogs */}
          <div className="p-6 bg-card border border-border rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-purple-500 font-extrabold text-sm uppercase tracking-wider border-b border-border/60 pb-3">
              <ShoppingBag className="h-5 w-5" />
              <span>Accessories by Smartphone Brand</span>
            </div>
            <ul className="space-y-2.5 text-xs font-medium">
              {brandCategories.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="flex items-center justify-between text-foreground hover:text-purple-500 transition-colors">
                    <span>{item.name}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Featured Phone Model Catalogs */}
          <div className="p-6 bg-card border border-border rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-amber-500 font-extrabold text-sm uppercase tracking-wider border-b border-border/60 pb-3">
              <Smartphone className="h-5 w-5" />
              <span>Featured Phone Model Catalogs</span>
            </div>
            <ul className="space-y-2.5 text-xs font-medium">
              {modelLandingPages.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="flex items-center justify-between text-foreground hover:text-amber-500 transition-colors">
                    <span>{item.name}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hardware Repair Guides & Blog */}
          <div className="p-6 bg-card border border-border rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-sm uppercase tracking-wider border-b border-border/60 pb-3">
              <BookOpen className="h-5 w-5" />
              <span>Repair Blog & Guides</span>
            </div>
            <ul className="space-y-2.5 text-xs font-medium">
              {blogGuides.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="flex items-center justify-between text-foreground hover:text-cyan-400 transition-colors">
                    <span>{item.name}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Compliance Pages */}
          <div className="p-6 bg-card border border-border rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm uppercase tracking-wider border-b border-border/60 pb-3">
              <ShieldCheck className="h-5 w-5" />
              <span>Legal Policies & Information</span>
            </div>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link href="/privacy" className="flex items-center justify-between text-foreground hover:text-emerald-400 transition-colors">
                  <span>Privacy Policy & Data Security</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              </li>
              <li>
                <Link href="/terms" className="flex items-center justify-between text-foreground hover:text-emerald-400 transition-colors">
                  <span>Terms & Conditions & Service Guarantee</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              </li>
              <li>
                <a href="/sitemap.xml" target="_blank" className="flex items-center justify-between text-cyan-400 hover:underline">
                  <span>XML Sitemap File for Search Engines (sitemap.xml)</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </a>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}

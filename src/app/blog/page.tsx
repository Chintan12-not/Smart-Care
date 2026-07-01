"use client";

import React, { useState } from "react";
import { BookOpen, Calendar, User, Clock, ArrowRight, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { LinkPreview } from "@/components/ui/link-preview";

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: "health" | "medicine_guide" | "technology" | "repair_guide" | "buying_guide";
  categoryLabel: string;
  readTime: string;
  date: string;
  author: string;
  tags: string[];
}

const ARTICLES: Article[] = [
  {
    id: "art-1",
    title: "Understanding Generic vs Brand Name Medicines: How PMBJP Saves You Money",
    slug: "generic-vs-brand-medicines-pmbjp",
    summary: "Many Indians pay up to 80% extra for brand name medicines when generic substitutes contain the exact same active ingredients. Learn how Jan Aushadhi Kendras maintain quality control.",
    category: "medicine_guide",
    categoryLabel: "Medicine Guide",
    readTime: "5 min read",
    date: "June 28, 2026",
    author: "Dr. Ananya Sen, PharmD",
    tags: ["Generic Medicines", "PMBJP", "Healthcare Savings", "Drug Safety"],
    content: `
      ## What are Generic Medicines?
      Generic medicines are pharmaceutical drugs that have the exact same chemical formulation, therapeutic dosage, safety profile, strength, route of administration, and quality control as their original branded counterparts.
      
      ## The Cost Difference Explained
      Branded drug manufacturers spend millions on patent registrations, marketing, and doctor representatives. Generic manufacturers skip these promotional costs and pass 100% of the savings directly to the patients.
      
      ## Quality Standards at Jan Aushadhi Kendras
      Every batch of medicine sold under the PMBJP scheme is tested at NABL accredited labs before being distributed to local shops, ensuring strict compliance with World Health Organization (WHO) Good Manufacturing Practices (GMP).
    `
  },
  {
    id: "art-2",
    title: "Why is Your Smartphone Overheating? Common Causes & Simple Diagnostic Steps",
    slug: "why-smartphone-overheating-causes",
    summary: "Constant heating degrades your smartphone battery capacity and CPU speeds. Diagnose if it is a background apps issue, dust accumulation, or faulty hardware controller.",
    category: "repair_guide",
    categoryLabel: "Repair Guide",
    readTime: "4 min read",
    date: "June 25, 2026",
    author: "Rahul Verma, Senior Hardware Engineer",
    tags: ["Device Care", "Battery Safety", "Android Diagnostics", "iPhone Overheating"],
    content: `
      ## Primary Causes of Device Heating
      1. **High Background CPU Load:** Apps running syncing cycles, background locations, or graphics rendering.
      2. **Failing Battery Chemistry:** Internal resistance increases as lithium-ion cells age, generating thermal energy during charging.
      3. **Faulty Charger Adapter:** Using cheap non-certified wall adapters that push raw current without voltage regulation.
      
      ## Simple Troubleshooting Guidelines
      - **Check CPU Usage:** Navigate to battery settings and force-stop rogue power-draining applications.
      - **Audit Chargers:** Switch to original or GaN-certified fast chargers.
      - **Clean Port Contacts:** Ensure lint is not creating minor electrical shorts in the type-C slot.
    `
  },
  {
    id: "art-3",
    title: "Top 5 Mobile Accessories to Extend Your Device's Lifespan in 2026",
    slug: "top-mobile-accessories-extend-lifespan",
    summary: "From 9H tempered protectors to MagSafe cases and GaN adapters, here are the essential accessories you need to protect your tech investment.",
    category: "buying_guide",
    categoryLabel: "Buying Guide",
    readTime: "3 min read",
    date: "June 22, 2026",
    author: "Vikram Malhotra, Tech Reviewer",
    tags: ["Accessories", "Phone Cases", "GaN Chargers", "Device Lifespan"],
    content: `
      ## Essential Accessories checklist
      - **Tempered Glass (9H):** Absorbs front impact shock, saving screen repairs that cost over ₹5,000.
      - **Shockproof Case Shells:** Raised edge bumpers around cameras protect optical lenses from scratches.
      - **GaN Fast Chargers:** Gallium Nitride chargers generate less heat, protecting battery lifespan during charging.
    `
  }
];

export default function BlogPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);

  const filteredArticles = ARTICLES.filter((art) => {
    const matchesSearch = 
      art.title.toLowerCase().includes(search.toLowerCase()) ||
      art.summary.toLowerCase().includes(search.toLowerCase()) ||
      art.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      
    const matchesCategory = 
      selectedCategory === "all" || 
      art.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = [
    { code: "all", label: "All Articles" },
    { code: "medicine_guide", label: "Medicine Guides" },
    { code: "repair_guide", label: "Repair Guides" },
    { code: "buying_guide", label: "Buying Guides" }
  ];

  // Schema.org Article JSON-LD for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": activeArticle?.title || "Smart Care & Mobile Point Blog",
    "description": activeArticle?.summary || "Read informative health guides and smartphone repair articles.",
    "author": {
      "@type": "Person",
      "name": activeArticle?.author || "Smart Care Editorial Team"
    },
    "datePublished": activeArticle?.date || "2026-06-30"
  };

  return (
    <div className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Schema.org Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center justify-center gap-2">
          <BookOpen className="h-7 w-7 text-emerald-500" />
          Guides & Articles Hub
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          Expert recommendations, healthcare budgeting tips, and smartphone hardware troubleshooting guides.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="glass-card rounded-2xl p-5 border border-border flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search guides or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-muted border border-border rounded-xl py-3 pl-11 pr-4 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.code}
              onClick={() => setSelectedCategory(cat.code)}
              className={cn(
                "px-3.5 py-1.5 rounded-full border text-[11px] font-semibold whitespace-nowrap transition-all duration-200",
                selectedCategory === cat.code
                  ? "bg-foreground text-background border-foreground shadow-sm"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Article list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredArticles.map((art) => (
          <div key={art.id} className="glass-card rounded-2xl p-6 border border-border flex flex-col justify-between hover:border-emerald-500/20 transition-all duration-300 group">
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">
                {art.categoryLabel}
              </span>
              <h3 className="text-base font-bold text-foreground leading-snug group-hover:text-emerald-500 transition-colors">
                <LinkPreview url={`/blog/${art.slug}`} isStatic imageSrc="/placeholder_blog.png">
                  {art.title}
                </LinkPreview>
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                {art.summary}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-6 text-[10px] text-muted-foreground font-medium">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-0.5">
                  <Calendar className="h-3 w-3" />
                  {art.date}
                </span>
                <span className="flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />
                  {art.readTime}
                </span>
              </div>
              <button
                onClick={() => setActiveArticle(art)}
                className="text-xs font-bold text-foreground group-hover:text-emerald-500 flex items-center gap-0.5 hover:underline"
              >
                Read Article
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Full Article Reader */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-card border border-border rounded-3xl p-6 md:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-start gap-4">
              <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">
                {activeArticle.categoryLabel}
              </span>
              <button
                onClick={() => setActiveArticle(null)}
                className="text-xs text-muted-foreground hover:text-foreground bg-muted border border-border/50 px-2.5 py-1 rounded-lg"
              >
                Close
              </button>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-foreground leading-snug">
              {activeArticle.title}
            </h2>

            <div className="flex items-center gap-4 text-[10px] text-muted-foreground border-b border-border/40 pb-4">
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {activeArticle.author}
              </span>
              <span>&bull;</span>
              <span>{activeArticle.date}</span>
              <span>&bull;</span>
              <span>{activeArticle.readTime}</span>
            </div>

            {/* Rendered content */}
            <div className="text-xs md:text-sm text-foreground leading-relaxed whitespace-pre-line space-y-4 font-normal">
              {activeArticle.content}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 pt-6 border-t border-border/40">
              {activeArticle.tags.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded bg-muted text-muted-foreground text-[10px] font-semibold"
                >
                  #{t}
                </span>
              ))}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

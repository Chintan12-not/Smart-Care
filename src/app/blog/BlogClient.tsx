"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BookOpen, Calendar, User, Clock, ArrowRight, Search, Smartphone, Wrench, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { ARTICLES, Article } from "@/lib/articles";

export default function BlogClient() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

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

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          <BookOpen className="h-3.5 w-3.5" />
          Smart Care Tech & Repair Guides
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Mobile Repair & Maintenance Blog
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Expert guides written by Gurugram hardware technicians on screen repair costs, battery health, charging troubleshooting, and buying accessories.
        </p>
      </div>

      {/* Search Bar & Category Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-3xl mx-auto">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guides (e.g. Screen, Battery, Charger)..."
            className="w-full bg-card border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: "all", label: "All Guides" },
            { id: "repair_guide", label: "Repair Guides" },
            { id: "maintenance", label: "Maintenance" },
            { id: "buying_guide", label: "Buying Guides" }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-full border text-[11px] font-semibold whitespace-nowrap transition-all",
                selectedCategory === cat.id
                  ? "bg-emerald-500 text-black border-emerald-500 font-bold"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {filteredArticles.map((article) => (
          <article
            key={article.id}
            className="glass-card rounded-3xl p-6 border border-border flex flex-col justify-between hover:shadow-lg transition-all group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-extrabold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  {article.categoryLabel}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {article.readTime}
                </span>
              </div>

              <h2 className="text-base font-extrabold text-foreground group-hover:text-emerald-500 transition-colors leading-snug">
                <Link href={`/blog/${article.slug}`}>
                  {article.title}
                </Link>
              </h2>

              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {article.summary}
              </p>
            </div>

            <div className="pt-6 mt-4 border-t border-border/60 flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" />
                {article.author.split(",")[0]}
              </span>
              <Link
                href={`/blog/${article.slug}`}
                className="text-xs font-bold text-emerald-500 flex items-center gap-1 hover:gap-2 transition-all"
              >
                <span>Read Guide</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>

    </div>
  );
}

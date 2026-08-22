import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ChevronRight, Clock, User, Calendar, PhoneCall, Truck, ArrowLeft } from "lucide-react";
import { ARTICLES } from "@/lib/articles";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug)
    || ARTICLES.find((a) => a.slug.includes(slug) || slug.includes(a.slug))
    || ARTICLES[0];

  return {
    title: article.title,
    description: article.summary,
    keywords: article.tags,
    alternates: {
      canonical: `https://smartcaremobile.in/blog/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.summary,
      url: `https://smartcaremobile.in/blog/${article.slug}`,
      type: "article",
      publishedTime: article.date,
      authors: [article.author],
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug)
    || ARTICLES.find((a) => a.slug.includes(slug) || slug.includes(a.slug))
    || ARTICLES[0];

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.summary,
    "author": {
      "@type": "Person",
      "name": article.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Smart Care & Mobile Point",
      "logo": {
        "@type": "ImageObject",
        "url": "https://smartcaremobile.in/logo.png"
      }
    },
    "datePublished": article.date,
    "mainEntityOfPage": `https://smartcaremobile.in/blog/${article.slug}`
  };

  return (
    <div className="flex-grow bg-background text-foreground pb-20 pt-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/blog" className="hover:text-foreground">Blog</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-semibold truncate max-w-[200px]">{article.title}</span>
        </nav>

        {/* Article Header */}
        <div className="space-y-4">
          <span className="text-[10px] uppercase font-extrabold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            {article.categoryLabel}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-snug">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground border-y border-border py-3">
            <span className="flex items-center gap-1 font-medium">
              <User className="h-3.5 w-3.5" />
              {article.author}
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Calendar className="h-3.5 w-3.5" />
              {article.date}
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Clock className="h-3.5 w-3.5" />
              {article.readTime}
            </span>
          </div>
        </div>

        {/* Article Body */}
        <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed space-y-4">
          {article.content.split("\n\n").map((paragraph, i) => {
            if (paragraph.trim().startsWith("## ")) {
              return <h2 key={i} className="text-xl font-bold text-foreground mt-6 mb-2">{paragraph.replace("## ", "")}</h2>;
            }
            return <p key={i} className="text-muted-foreground leading-relaxed">{paragraph.trim()}</p>;
          })}
        </div>

        {/* Call to Action Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 via-background to-sky-950/20 shadow-xl space-y-4 mt-8">
          <h3 className="text-lg font-bold text-foreground">Need Smartphone Repair in Gurugram?</h3>
          <p className="text-xs text-muted-foreground">
            Contact Smart Care & Mobile Point for doorstep pickup, express screen replacement, OEM battery swap, and genuine accessories in Sector 37C, Gurugram.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/pickup"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-extrabold text-xs uppercase tracking-wider hover:bg-emerald-400 flex items-center gap-1.5"
            >
              <Truck className="h-4 w-4" />
              <span>Book Repair Pickup</span>
            </Link>
            <a
              href="https://wa.me/919289942313"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-card border border-border text-foreground font-extrabold text-xs uppercase tracking-wider hover:bg-muted flex items-center gap-1.5"
            >
              <PhoneCall className="h-4 w-4 text-emerald-500" />
              <span>WhatsApp Technicians</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

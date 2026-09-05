import React from "react";
import Link from "next/link";
import { Smartphone, Wrench, ShoppingBag, Building2, PhoneCall, ArrowLeft, Search } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found | Smart Care & Mobile Point",
  description: "The page you are looking for may have moved or no longer exists. Browse mobile repair services, accessories, or contact Smart Care Gurugram.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-background text-foreground">
      <div className="max-w-2xl w-full text-center space-y-8 glass-card rounded-3xl p-8 sm:p-12 border border-border shadow-xl">
        
        {/* Error Code Badge */}
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            Error 404
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Page Not Found
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            The page you are looking for might have been removed, renamed, or is temporarily unavailable. Explore our core services below:
          </p>
        </div>

        {/* Helpful Shortcut Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          
          <Link
            href="/mobile-repair-gurugram"
            className="p-4 rounded-2xl bg-card border border-border/80 hover:border-emerald-500/40 hover:bg-muted/50 transition-all flex items-center gap-3.5 group"
          >
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:scale-105 transition-transform">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-foreground group-hover:text-emerald-500 transition-colors">
                Mobile Repair Services
              </h3>
              <p className="text-[11px] text-muted-foreground">Express pickup & screen repair in Gurugram</p>
            </div>
          </Link>

          <Link
            href="/accessories"
            className="p-4 rounded-2xl bg-card border border-border/80 hover:border-sky-500/40 hover:bg-muted/50 transition-all flex items-center gap-3.5 group"
          >
            <div className="p-3 rounded-xl bg-sky-500/10 text-sky-500 group-hover:scale-105 transition-transform">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-foreground group-hover:text-sky-500 transition-colors">
                Accessories Store
              </h3>
              <p className="text-[11px] text-muted-foreground">Covers, chargers & glass for 600+ models</p>
            </div>
          </Link>

          <Link
            href="/corporate-orders"
            className="p-4 rounded-2xl bg-card border border-border/80 hover:border-purple-500/40 hover:bg-muted/50 transition-all flex items-center gap-3.5 group"
          >
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-105 transition-transform">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-foreground group-hover:text-purple-400 transition-colors">
                Corporate & Bulk Orders
              </h3>
              <p className="text-[11px] text-muted-foreground">Wholesale pricing & GST invoices</p>
            </div>
          </Link>

          <a
            href="https://wa.me/919289942313"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-card border border-border/80 hover:border-emerald-500/40 hover:bg-muted/50 transition-all flex items-center gap-3.5 group"
          >
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:scale-105 transition-transform">
              <PhoneCall className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-foreground group-hover:text-emerald-500 transition-colors">
                Support via WhatsApp
              </h3>
              <p className="text-[11px] text-muted-foreground">Instant chat with Gurugram technicians</p>
            </div>
          </a>

        </div>

        {/* Back to Home CTA */}
        <div className="pt-4 border-t border-border/60 flex justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-foreground text-background font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4 stroke-[3]" />
            <span>Return to Homepage</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

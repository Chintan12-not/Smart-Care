import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Smartphone, Wrench, ShieldCheck, Truck, ChevronRight, PhoneCall, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Screen & Glass Replacement Service in Gurugram | 45-Min Fix",
  description: "Fast 45-minute mobile screen & glass replacement in Gurugram. Original OEM & AAA displays for iPhone, Samsung, OnePlus, Vivo, Oppo & Xiaomi with warranty.",
  keywords: [
    "mobile screen replacement Gurgaon", 
    "phone glass replacement Gurugram", 
    "broken screen repair Gurgaon", 
    "display change cost Gurgaon"
  ],
  alternates: {
    canonical: "https://smartcaremobile.in/screen-replacement-gurugram",
  },
};

export default function ScreenReplacementGurugramPage() {
  return (
    <div className="flex-grow bg-background text-foreground pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/mobile-repair-gurugram" className="hover:text-foreground">Mobile Repair Gurugram</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-semibold">Screen Replacement Gurugram</span>
        </nav>

        <section className="glass-card rounded-3xl p-8 sm:p-12 border border-border bg-gradient-to-r from-emerald-950/20 via-background to-cyan-950/20 shadow-xl space-y-6">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <ShieldCheck className="h-4 w-4" />
            45-Minute Display Replacement Lab
          </span>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Mobile <span className="text-emerald-500">Screen Replacement</span> in Gurugram
          </h1>

          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Cracked screen or touch digitizer malfunction? Get original AAA and OEM display replacements backed by warranty and zero-loss data protection.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link href="/pickup" className="px-6 py-3.5 rounded-2xl bg-emerald-500 text-black font-extrabold text-xs uppercase tracking-wider hover:bg-emerald-400 shadow-md flex items-center gap-2">
              <Truck className="h-4 w-4" />
              <span>Book Screen Replacement Pickup</span>
            </Link>
            <a href="https://wa.me/919289942313?text=Hi%20Smart%20Care,%20I%20need%20a%20screen%20replacement%20quote." target="_blank" rel="noopener noreferrer" className="px-6 py-3.5 rounded-2xl bg-card border border-border text-foreground font-extrabold text-xs uppercase tracking-wider hover:bg-muted flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-emerald-500" />
              <span>WhatsApp Estimate</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

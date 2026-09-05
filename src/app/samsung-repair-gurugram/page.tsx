import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Smartphone, Wrench, ShieldCheck, Truck, ChevronRight, PhoneCall, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Samsung Galaxy Repair in Gurugram | AMOLED Display & Battery",
  description: "Certified Samsung Galaxy mobile repair in Gurugram. Super AMOLED display replacement, battery swap, charging port fix for Galaxy S24, S23, A-series & M-series.",
  keywords: [
    "Samsung repair Gurgaon", 
    "Samsung screen replacement Gurugram", 
    "Samsung Galaxy service center Gurgaon", 
    "Samsung battery replacement Gurugram"
  ],
  alternates: {
    canonical: "https://www.smartcaremobile.in/samsung-repair-gurugram",
  },
};

export default function SamsungRepairGurugramPage() {
  return (
    <div className="flex-grow bg-background text-foreground pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/mobile-repair-gurugram" className="hover:text-foreground">Mobile Repair Gurugram</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-semibold">Samsung Repair Gurugram</span>
        </nav>

        <section className="glass-card rounded-3xl p-8 sm:p-12 border border-border bg-gradient-to-r from-sky-950/20 via-background to-blue-950/20 shadow-xl space-y-6">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <ShieldCheck className="h-4 w-4" />
            Samsung Galaxy Repair Specialist
          </span>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Samsung Mobile Repair in <span className="text-sky-400">Gurugram</span>
          </h1>

          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            High-Quality Dynamic AMOLED &amp; OLED compatible screen replacement, battery swap, charging connector repair, and motherboard diagnostics for all Samsung Galaxy models.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link href="/pickup" className="px-6 py-3.5 rounded-2xl bg-sky-500 text-black font-extrabold text-xs uppercase tracking-wider hover:bg-sky-400 shadow-md flex items-center gap-2">
              <Truck className="h-4 w-4" />
              <span>Book Repair Pickup</span>
            </Link>
            <a href="https://wa.me/919289942313?text=Hi%20Smart%20Care,%20I%20need%20a%20Samsung%20repair%20quote." target="_blank" rel="noopener noreferrer" className="px-6 py-3.5 rounded-2xl bg-card border border-border text-foreground font-extrabold text-xs uppercase tracking-wider hover:bg-muted flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-sky-400" />
              <span>WhatsApp Support</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

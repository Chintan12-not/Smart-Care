import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Smartphone, Wrench, ShieldCheck, Truck, ChevronRight, PhoneCall, Check, AlertTriangle, Layers } from "lucide-react";

export const metadata: Metadata = {
  title: "Screen & Glass Replacement Service in Gurugram | 45-Min Fix",
  description: "Fast 45-minute mobile screen & glass replacement in Gurugram. Original OEM & AAA displays for iPhone, Samsung, OnePlus, Vivo, Oppo & Xiaomi with pre-delivery testing.",
  keywords: [
    "mobile screen replacement Gurgaon", 
    "phone glass replacement Gurugram", 
    "broken screen repair Gurgaon", 
    "display change cost Gurgaon",
    "AMOLED display repair Sector 37C"
  ],
  alternates: {
    canonical: "https://www.smartcaremobile.in/screen-replacement-gurugram",
  },
  openGraph: {
    title: "Mobile Screen & Glass Replacement in Gurugram | Smart Care",
    description: "45-minute display replacement lab in Gurugram. Free express pickup available.",
    url: "https://www.smartcaremobile.in/screen-replacement-gurugram",
  },
};

export default function ScreenReplacementGurugramPage() {
  const faqs = [
    {
      q: "What is the difference between glass-only repair and full display replacement?",
      a: "If your top Gorilla glass is cracked but your touch digitizer, display colors, and brightness work 100% normally without any black spots or lines, we can refurbish just the outer glass layer. If vertical lines, black ink spots, or touch glitches appear, the complete OLED assembly must be replaced."
    },
    {
      q: "How long does screen replacement take in Gurugram?",
      a: "Our certified technicians perform screen replacements within 45 to 60 minutes at our Sector 37C workshop counter using dust-free vacuum laminators."
    },
    {
      q: "Will TrueTone and high refresh rate (120Hz) work after replacement?",
      a: "Yes! We use EEPROM programmers to clone your original display serial data so TrueTone, auto-brightness, and 120Hz refresh rates continue operating seamlessly."
    }
  ];

  const displaySymptoms = [
    "Glass spiderweb cracks across the front panel",
    "Vertical green, pink, or white lines on display",
    "Black ink bleed spots spreading across the OLED panel",
    "Unresponsive touch digitizer or ghost touching",
    "Completely black screen while phone still vibrates or rings"
  ];

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Mobile Screen & Glass Replacement Gurugram",
    "provider": {
      "@type": "MobilePhoneStore",
      "name": "Smart Care & Mobile Point",
      "telephone": "+919289942313",
      "url": "https://www.smartcaremobile.in"
    },
    "areaServed": "Gurugram",
    "serviceType": "Smartphone Display & Outer Glass Replacement",
    "description": "Express 45-minute mobile screen replacement for iPhone, Samsung, OnePlus, Vivo, Oppo & Xiaomi in Gurugram."
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a
      }
    }))
  };

  return (
    <div className="flex-grow bg-background text-foreground pb-20 pt-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/mobile-repair-gurugram" className="hover:text-foreground">Mobile Repair Gurugram</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-semibold">Screen Replacement Gurugram</span>
        </nav>

        {/* Hero Section */}
        <section className="glass-card rounded-3xl p-8 sm:p-12 border border-border bg-gradient-to-r from-emerald-950/20 via-background to-cyan-950/20 shadow-xl space-y-6">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <ShieldCheck className="h-4 w-4" />
            45-Minute Display Replacement Lab
          </span>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Mobile <span className="text-emerald-500">Screen Replacement</span> in Gurugram
          </h1>

          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Cracked screen or touch digitizer malfunction? Get high-grade tested AAA and OEM-compatible display replacements backed by pre-delivery testing, touch calibration, and transparent pricing.
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

        {/* Display Fault Symptoms Grid */}
        <section className="space-y-6">
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Common Screen & Display Faults We Repair</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {displaySymptoms.map((symptom, i) => (
              <div key={i} className="p-5 rounded-2xl bg-card border border-border space-y-2 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs font-semibold leading-relaxed text-foreground">{symptom}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Outer Glass vs Full OLED Section */}
        <section className="p-8 rounded-3xl bg-card border border-border space-y-4">
          <div className="flex items-center gap-3">
            <Layers className="h-6 w-6 text-emerald-500" />
            <h2 className="text-xl font-bold text-foreground">Glass-Only Refurbishment vs Full OLED Assembly Swap</h2>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Our Sector 37C workshop is equipped with freeze-separator vacuum machinery and OCA laminators. If your original display panel and touch sensor remain undamaged under cracked outer glass, glass-only refurbishing preserves your original factory OLED panel at a fraction of full replacement cost.
          </p>
        </section>

        {/* FAQs */}
        <section className="space-y-6 pt-6 border-t border-border">
          <h2 className="text-2xl font-extrabold text-foreground text-center">Screen Replacement FAQs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {faqs.map((f, i) => (
              <div key={i} className="p-6 rounded-2xl bg-card border border-border space-y-2">
                <h3 className="font-bold text-sm text-foreground">{f.q}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

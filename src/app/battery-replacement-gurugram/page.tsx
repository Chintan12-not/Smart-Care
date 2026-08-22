import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Smartphone, BatteryCharging, ShieldCheck, Truck, ChevronRight, PhoneCall, Check, Clock, AlertTriangle, UserCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Mobile Battery Replacement in Gurugram | Fast Battery Swap",
  description: "Certified smartphone battery replacement in Gurugram. Fast OEM battery swap for iPhone, Samsung, OnePlus, Vivo, Oppo & Xiaomi at Sector 37C workshop with doorstep pickup.",
  keywords: [
    "battery replacement Gurugram",
    "iPhone battery replacement Gurgaon",
    "Samsung battery replacement Gurugram",
    "phone battery swap Sector 37C",
    "mobile battery repair Gurgaon"
  ],
  alternates: {
    canonical: "https://www.smartcaremobile.in/battery-replacement-gurugram",
  },
  openGraph: {
    title: "Mobile Battery Replacement Service in Gurugram | Smart Care",
    description: "Express smartphone battery swap in Gurugram. Doorstep pickup & expert technician installation.",
    url: "https://www.smartcaremobile.in/battery-replacement-gurugram",
  },
};

export default function BatteryReplacementGurugramPage() {
  const faqs = [
    {
      q: "How do I know if my smartphone battery needs replacement?",
      a: "Warning signs include rapid charge drain below 30%, sudden shutdowns during camera use, battery health dropping below 80% on iPhone, overheating while charging, or the back glass/screen lifting due to battery swelling."
    },
    {
      q: "How long does mobile battery replacement take?",
      a: "Battery replacement takes approximately 30 to 45 minutes at our Sector 37C counter. For doorstep pickup orders, devices are serviced and returned on the same day."
    },
    {
      q: "Are the replacement battery cells safe and tested?",
      a: "Yes. We use premium high-capacity tested battery cells manufactured to strict OEM safety specifications, ensuring thermal protection and stable charging cycles."
    }
  ];

  const symptoms = [
    "Battery health drops rapidly from 30% to zero",
    "Phone shuts down unexpectedly under camera or GPS load",
    "Device gets hot near the back panel during slow charging",
    "Screen or back panel lifting caused by battery cell swelling",
    "Phone operates only while plugged into wall charger"
  ];

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Mobile Battery Replacement Service Gurugram",
    "provider": {
      "@type": "MobilePhoneStore",
      "name": "Smart Care & Mobile Point",
      "telephone": "+919289942313",
      "url": "https://www.smartcaremobile.in"
    },
    "areaServed": "Gurugram",
    "serviceType": "Smartphone Battery Swap & Diagnostics",
    "description": "Professional battery replacement for Apple iPhone, Samsung Galaxy, OnePlus, Vivo, Oppo & Xiaomi in Gurugram."
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
          <Link href="/mobile-repair-gurugram" className="hover:text-foreground">Mobile Repair</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-semibold">Battery Replacement Gurugram</span>
        </nav>

        {/* Hero Banner */}
        <section className="glass-card rounded-3xl p-8 sm:p-12 border border-border bg-gradient-to-r from-amber-950/20 via-background to-emerald-950/20 shadow-xl space-y-6">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <BatteryCharging className="h-4 w-4" />
            30-Minute Battery Swap Lab Gurugram
          </span>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Mobile <span className="text-amber-500">Battery Replacement</span> in Gurugram
          </h1>

          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Is your phone draining quickly or overheating? Restore full-day battery life with certified high-capacity battery cell replacement for iPhone, Samsung Galaxy, OnePlus, Vivo, Oppo, and Xiaomi devices.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link href="/pickup" className="px-6 py-3.5 rounded-2xl bg-amber-500 text-black font-extrabold text-xs uppercase tracking-wider hover:bg-amber-400 shadow-md flex items-center gap-2">
              <Truck className="h-4 w-4" />
              <span>Book Battery Pickup</span>
            </Link>
            <a href="https://wa.me/919289942313?text=Hi%20Smart%20Care,%20I%20need%20a%20battery%20replacement%20quote%20for%20my%20phone." target="_blank" rel="noopener noreferrer" className="px-6 py-3.5 rounded-2xl bg-card border border-border text-foreground font-extrabold text-xs uppercase tracking-wider hover:bg-muted flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-amber-500" />
              <span>WhatsApp Estimate</span>
            </a>
          </div>
        </section>

        {/* Warning Symptoms Grid */}
        <section className="space-y-6">
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">5 Signs Your Battery Needs Replacement</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {symptoms.map((symptom, i) => (
              <div key={i} className="p-5 rounded-2xl bg-card border border-border space-y-2 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs font-semibold leading-relaxed text-foreground">{symptom}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="space-y-6 pt-6 border-t border-border">
          <h2 className="text-2xl font-extrabold text-foreground text-center">Battery Replacement FAQs</h2>
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

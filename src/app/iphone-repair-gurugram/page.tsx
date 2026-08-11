import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Smartphone, Wrench, ShieldCheck, Truck, ChevronRight, PhoneCall, Check, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "iPhone Repair Service in Gurugram | Screen, Battery & Back Glass",
  description: "Certified iPhone repair in Gurugram. Fast screen replacement, OEM battery swap, and back glass repair for iPhone 11, 12, 13, 14, 15 & 16 series. Doorstep pickup available.",
  keywords: [
    "iPhone repair Gurgaon", 
    "iPhone screen replacement Gurugram", 
    "iPhone battery replacement Gurgaon", 
    "iPhone back glass repair Gurgaon",
    "iPhone service center Sector 37C Gurugram"
  ],
  alternates: {
    canonical: "https://www.smartcaremobile.in/iphone-repair-gurugram",
  },
  openGraph: {
    title: "iPhone Repair Service in Gurugram | Smart Care & Mobile Point",
    description: "Express iPhone repair service in Gurugram. Free doorstep pickup & OEM parts warranty.",
    url: "https://www.smartcaremobile.in/iphone-repair-gurugram",
  },
};

export default function IPhoneRepairGurugramPage() {
  const models = [
    "iPhone 16 / 16 Pro / 16 Pro Max", "iPhone 15 / 15 Pro / 15 Pro Max",
    "iPhone 14 / 14 Plus / 14 Pro / 14 Pro Max", "iPhone 13 / 13 Mini / 13 Pro / 13 Pro Max",
    "iPhone 12 / 12 Pro / 12 Pro Max", "iPhone 11 / 11 Pro / 11 Pro Max / SE"
  ];

  const faqs = [
    {
      q: "How long does iPhone screen replacement take in Gurugram?",
      a: "Our technicians replace iPhone displays within 45 minutes at our Sector 37C workshop counter using ESD-safe precision toolkits."
    },
    {
      q: "Will TrueTone and Face ID work after screen replacement?",
      a: "Yes! We transfer original TrueTone display data and carefully retain your original TrueDepth camera module so Face ID and TrueTone function seamlessly."
    },
    {
      q: "Do you provide iPhone battery health calibration?",
      a: "Yes, we install high-capacity OEM battery cells engineered to deliver full-day battery life."
    }
  ];

  return (
    <div className="flex-grow bg-background text-foreground pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/mobile-repair-gurugram" className="hover:text-foreground transition-colors">Mobile Repair Gurugram</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-semibold">iPhone Repair Gurugram</span>
        </nav>

        {/* Hero */}
        <section className="glass-card rounded-3xl p-8 sm:p-12 border border-border bg-gradient-to-r from-purple-950/20 via-background to-sky-950/20 shadow-xl space-y-6">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <ShieldCheck className="h-4 w-4" />
            Apple iPhone Service Specialist Gurugram
          </span>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Certified <span className="text-purple-400">iPhone Repair</span> in Gurugram
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
            Professional display replacement, genuine battery installation, rear glass laser separation, and camera lens repair for all iPhone models.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/pickup"
              className="px-6 py-3.5 rounded-2xl bg-purple-500 text-black font-extrabold text-xs uppercase tracking-wider hover:bg-purple-400 shadow-md flex items-center gap-2 transition-all"
            >
              <Truck className="h-4 w-4" />
              <span>Book iPhone Pickup</span>
            </Link>
            <a
              href="https://wa.me/919289942313?text=Hi%20Smart%20Care,%20I%20need%20an%20iPhone%20repair%20quote."
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-2xl bg-card border border-border text-foreground font-extrabold text-xs uppercase tracking-wider hover:bg-muted transition-all flex items-center gap-2"
            >
              <PhoneCall className="h-4 w-4 text-purple-400" />
              <span>Get WhatsApp Price</span>
            </a>
          </div>
        </section>

        {/* Supported Models */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground text-center">Supported iPhone Models</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.map((m) => (
              <div key={m} className="p-4 rounded-2xl bg-card border border-border flex items-center gap-3">
                <Check className="h-4 w-4 text-purple-400 shrink-0" />
                <span className="text-xs font-bold text-foreground">{m}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground text-center">iPhone Repair FAQs</h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {faqs.map((f, i) => (
              <div key={i} className="p-5 rounded-2xl bg-card border border-border space-y-2">
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

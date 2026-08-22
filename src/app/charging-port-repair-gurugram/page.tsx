import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Zap, ShieldCheck, Truck, ChevronRight, PhoneCall, Check, Wrench, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Mobile Charging Port Repair in Gurugram | Type-C & Lightning Fix",
  description: "Professional smartphone charging port repair and Type-C pin replacement in Gurugram. Fast port cleaning and sub-board replacement for all mobile brands at Sector 37C.",
  keywords: [
    "charging port repair Gurugram",
    "Type-C port replacement Gurgaon",
    "iPhone charging jack repair Gurgaon",
    "phone not charging fix Sector 37C",
    "mobile charging pin repair Gurgaon"
  ],
  alternates: {
    canonical: "https://www.smartcaremobile.in/charging-port-repair-gurugram",
  },
  openGraph: {
    title: "Mobile Charging Port Repair Service in Gurugram | Smart Care",
    description: "Express Type-C & Lightning charging port repair in Gurugram. Doorstep pickup available.",
    url: "https://www.smartcaremobile.in/charging-port-repair-gurugram",
  },
};

export default function ChargingPortRepairGurugramPage() {
  const faqs = [
    {
      q: "My phone cable feels loose and keeps disconnecting. Do I need a new port?",
      a: "Not always! Often lint and pocket dust get compacted deep inside the Type-C or Lightning port, preventing full pin contact. We offer professional anti-static port cleaning before replacing any hardware."
    },
    {
      q: "How long does charging port replacement take?",
      a: "Port cleaning takes 15 minutes, while complete charging sub-board replacement takes 30 to 45 minutes at our Sector 37C workshop."
    },
    {
      q: "Do you repair both Type-C and Lightning charging connectors?",
      a: "Yes, we stock genuine USB Type-C charging sub-boards, micro-USB connectors, and iPhone Lightning port assemblies across all major brands."
    }
  ];

  const symptoms = [
    "Charging cable feels loose or falls out easily",
    "Phone charges only when cable is held at a specific angle",
    "Fast charging or Power Delivery (PD) stops functioning",
    "Overheating near the bottom speaker/charging area",
    "Computer fails to recognize phone via USB data transfer"
  ];

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Mobile Charging Port Repair Service Gurugram",
    "provider": {
      "@type": "MobilePhoneStore",
      "name": "Smart Care & Mobile Point",
      "telephone": "+919289942313",
      "url": "https://www.smartcaremobile.in"
    },
    "areaServed": "Gurugram",
    "serviceType": "Smartphone Charging Port Cleaning & Pin Replacement",
    "description": "Expert charging jack repair and sub-board replacement for iPhone, Samsung, OnePlus, Vivo, Oppo & Xiaomi in Gurugram."
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
          <span className="text-foreground font-semibold">Charging Port Repair Gurugram</span>
        </nav>

        {/* Hero Banner */}
        <section className="glass-card rounded-3xl p-8 sm:p-12 border border-border bg-gradient-to-r from-sky-950/20 via-background to-emerald-950/20 shadow-xl space-y-6">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Zap className="h-4 w-4" />
            Fast Port Cleaning & Pin Replacement Gurugram
          </span>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Mobile <span className="text-sky-400">Charging Port Repair</span> in Gurugram
          </h1>

          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Is your phone charging slowly, disconnecting intermittently, or not taking charge at all? We provide precision anti-static cleaning and original charging pin sub-board replacement for all mobile models.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link href="/pickup" className="px-6 py-3.5 rounded-2xl bg-sky-500 text-black font-extrabold text-xs uppercase tracking-wider hover:bg-sky-400 shadow-md flex items-center gap-2">
              <Truck className="h-4 w-4" />
              <span>Book Port Repair Pickup</span>
            </Link>
            <a href="https://wa.me/919289942313?text=Hi%20Smart%20Care,%20I%20need%20a%20charging%20port%20repair%20quote." target="_blank" rel="noopener noreferrer" className="px-6 py-3.5 rounded-2xl bg-card border border-border text-foreground font-extrabold text-xs uppercase tracking-wider hover:bg-muted flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-sky-400" />
              <span>WhatsApp Estimate</span>
            </a>
          </div>
        </section>

        {/* Symptoms Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Common Charging Port Faults</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {symptoms.map((symptom, i) => (
              <div key={i} className="p-5 rounded-2xl bg-card border border-border space-y-2 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-sky-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs font-semibold leading-relaxed text-foreground">{symptom}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="space-y-6 pt-6 border-t border-border">
          <h2 className="text-2xl font-extrabold text-foreground text-center">Charging Port Repair FAQs</h2>
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

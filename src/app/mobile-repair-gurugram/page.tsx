import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Smartphone, Wrench, ShieldCheck, Truck, Clock, Check, PhoneCall, ChevronRight, Star, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Express Mobile Repair in Gurugram | Screen, Battery & Diagnostics",
  description: "Certified express mobile repair in Gurugram. Fast 45-minute screen replacement, OEM battery swap, and charging port repair across Sector 37C, Sector 45, DLF & Sohna Road.",
  keywords: [
    "mobile repair in Gurugram", 
    "express mobile repair Gurgaon", 
    "mobile repair shop Sector 37C Gurugram", 
    "phone repair near me Gurgaon",
    "mobile screen replacement Gurgaon"
  ],
  alternates: {
    canonical: "https://www.smartcaremobile.in/mobile-repair-gurugram",
  },
  openGraph: {
    title: "Express Mobile Repair Service in Gurugram | Smart Care",
    description: "Express mobile repair service in Gurugram. Free express pickup & same-day delivery.",
    url: "https://www.smartcaremobile.in/mobile-repair-gurugram",
  },
};

export default function MobileRepairGurugramPage() {
  const faqs = [
    {
      q: "How does mobile repair pickup work in Gurugram?",
      a: "Simply fill out our online booking form or message us on WhatsApp (+91 9289942313). A logistics executive collects your phone from your home or office in Gurugram, our certified lab replaces the component, and we return it to you safely on the same day."
    },
    {
      q: "How long does screen replacement take?",
      a: "Most screen replacements and battery swaps are completed within 45 to 60 minutes after the device reaches our Sector 37C workshop counter."
    },
    {
      q: "Are pickup and delivery charges free?",
      a: "Pickup and delivery is 100% FREE for all addresses within 5 km of our shop (Sector 37C, Residency). Nominal distance charges apply beyond 5 km."
    },
    {
      q: "What quality testing do you perform on repaired devices?",
      a: "Every replacement screen, battery, or charging port undergoes thorough pre-installation testing and post-repair quality verification for touch response, display calibration, and charging speed."
    }
  ];

  const serviceAreas = [
    "Sector 37C & Residency", "Sector 45 & Huda City", "DLF Phase 1, 2, 3, 4 & 5",
    "Sohna Road & Subhash Chowk", "Golf Course Road & Extension", "Cyber City & MG Road",
    "Palam Vihar & Dwarka Expressway", "Sector 14 & Old Gurgaon"
  ];

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Express Mobile Repair Gurugram",
    "provider": {
      "@type": "MobilePhoneStore",
      "name": "Smart Care & Mobile Point",
      "telephone": "+919289942313",
      "url": "https://smartcaremobile.in"
    },
    "areaServed": "Gurugram",
    "serviceType": "Smartphone Repair Services",
    "description": "Express screen replacement, battery swap, and water damage repair in Gurugram."
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
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/pickup" className="hover:text-foreground transition-colors">Repair Pickup & Drop</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-semibold">Mobile Repair Gurugram</span>
        </nav>

        {/* Hero Section */}
        <section className="glass-card rounded-3xl p-8 sm:p-12 border border-border bg-gradient-to-r from-emerald-950/20 via-background to-sky-950/20 shadow-xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <ShieldCheck className="h-4 w-4" />
            <span>Gurugram Express &amp; In-Store Repair</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Professional <span className="text-emerald-500">Mobile Repair</span> Services in Gurugram
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
            Fast, transparent, and reliable smartphone repairs for iPhone, Samsung, OnePlus, Vivo, Oppo, Xiaomi &amp; Realme. Free express pickup across all Gurugram sectors.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/pickup"
              className="px-6 py-3.5 rounded-2xl bg-emerald-500 text-black font-extrabold text-xs uppercase tracking-wider hover:bg-emerald-400 shadow-md flex items-center gap-2 transition-all"
            >
              <Truck className="h-4 w-4" />
              <span>Book Repair Pickup</span>
            </Link>
            <a
              href="https://wa.me/919289942313?text=Hi%20Smart%20Care,%20I%20need%20mobile%20repair%20quote%20in%20Gurugram."
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-2xl bg-card border border-border text-foreground font-extrabold text-xs uppercase tracking-wider hover:bg-muted transition-all flex items-center gap-2"
            >
              <PhoneCall className="h-4 w-4 text-emerald-500" />
              <span>Instant WhatsApp Quote</span>
            </a>
          </div>
        </section>

        {/* FREE GIFT PROMO BANNER */}
        <section className="glass-card rounded-3xl p-6 sm:p-8 border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-cyan-500/10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <span className="px-3.5 py-1 rounded-full bg-emerald-500 text-black font-black text-[10px] uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm animate-pulse">
              🎁 EXCLUSIVE FREE GIFTS WITH REPAIR
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-foreground">
              FREE <span className="text-emerald-400">9H Screen Guard</span> + FREE <span className="text-cyan-400">Phone Cover</span>
            </h2>
            <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
              Get a complimentary 9H Tempered Glass Screen Guard &amp; protective back cover installed 100% FREE on all completed mobile screen, battery, or component repairs in Gurugram!
            </p>
          </div>
          <Link
            href="/pickup"
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black text-xs uppercase tracking-wider hover:opacity-95 shadow-md shrink-0 transition-all flex items-center gap-2"
          >
            <span>Claim Free Gifts &amp; Book Repair</span>
          </Link>
        </section>

        {/* Services Offered Grid */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Common Repair Services We Perform</h2>
            <p className="text-xs text-muted-foreground">High-grade tested AAA &amp; OEM-compatible replacement parts installed by experienced technicians.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-card border border-border space-y-3 shadow-sm hover:border-emerald-500/30 transition-all">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <Smartphone className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-foreground">Express Screen & Glass Replacement</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Cracked or unresponsive touch screen? We fit genuine Super AMOLED & IPS LCD displays in under 45 minutes with full touch calibration and testing.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border space-y-3 shadow-sm hover:border-emerald-500/30 transition-all">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-foreground">Battery Replacement</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Swollen or fast-draining battery? Restore your phone&apos;s full-day backup with high-capacity OEM battery cells.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border space-y-3 shadow-sm hover:border-emerald-500/30 transition-all">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <Wrench className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-foreground">Charging Port & Mic Repair</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Loose Type-C or Lightning port, slow charging, or mic issues repaired with original flex cables.
              </p>
            </div>
          </div>
        </section>

        {/* Gurugram Service Areas */}
        <section className="glass-card rounded-3xl p-8 border border-border space-y-6">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-500" />
            <h2 className="text-xl font-bold text-foreground">Gurugram Pickup & Service Coverage</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {serviceAreas.map((area) => (
              <div key={area} className="p-3 rounded-xl bg-muted/40 border border-border/80 text-xs font-semibold text-foreground flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>{area}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground text-center">Frequently Asked Questions</h2>
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

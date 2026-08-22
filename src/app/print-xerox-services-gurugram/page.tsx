import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Printer, FileText, Camera, ShieldCheck, MapPin, Clock, PhoneCall, ChevronRight, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Document Printing, Xerox & Passport Photos in Gurugram | Sector 37C",
  description: "High-speed document printing, B&W photocopy (Xerox), high-resolution colour prints, passport size photos, document lamination & mobile recharge at Ninex Residency, Sector 37C, Gurugram.",
  keywords: [
    "photocopy shop Sector 37C Gurugram",
    "document printing Gurgaon",
    "xerox shop Sector 37C Gurgaon",
    "passport size photo Gurugram",
    "mobile recharge shop Ninex Residency"
  ],
  alternates: {
    canonical: "https://www.smartcaremobile.in/print-xerox-services-gurugram",
  },
  openGraph: {
    title: "Document Printing, Xerox & Passport Photo Center Gurugram | Smart Care",
    description: "Instant document printing, B&W photocopy, colour prints, lamination & passport photos in Sector 37C Gurugram.",
    url: "https://www.smartcaremobile.in/print-xerox-services-gurugram",
  },
};

export default function PrintXeroxServicesGurugramPage() {
  const servicesList = [
    { title: "B&W & Colour Xerox", desc: "High-speed crisp A4 black & white and full-colour document photocopying.", icon: Printer },
    { title: "Document Printing", desc: "Print PDF files, resume, admit cards, tickets, government IDs directly via WhatsApp/Email.", icon: FileText },
    { title: "Urgent Passport Photos", desc: "Instant high-resolution studio passport size photographs printed on glossy photo paper in 5 minutes.", icon: Camera },
    { title: "Document Lamination", desc: "Heavy-duty thermal pouch lamination for marksheets, certificates, and ID cards.", icon: ShieldCheck }
  ];

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Smart Care & Mobile Point - Print & Xerox Center",
    "url": "https://www.smartcaremobile.in/print-xerox-services-gurugram",
    "telephone": "+919289942313",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Shop No. 28, Ninex Residency, Sector 37C",
      "addressLocality": "Gurugram",
      "addressRegion": "Haryana",
      "postalCode": "122001",
      "addressCountry": "IN"
    },
    "description": "Document printing, B&W photocopy, passport photos, document lamination, and mobile recharge service hub in Sector 37C Gurugram."
  };

  return (
    <div className="flex-grow bg-background text-foreground pb-20 pt-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-semibold">Print & Xerox Services Gurugram</span>
        </nav>

        {/* Hero Banner */}
        <section className="glass-card rounded-3xl p-8 sm:p-12 border border-border bg-gradient-to-r from-emerald-950/20 via-background to-cyan-950/20 shadow-xl space-y-6">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Printer className="h-4 w-4" />
            Document Printing & Xerox Center Sector 37C Gurugram
          </span>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Photocopy, Printing & <span className="text-emerald-500">Passport Photos</span> in Gurugram
          </h1>

          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Need urgent document printing, B&W photocopy, colour prints, or passport size photos? Visit Smart Care & Mobile Point at Shop No. 28, Ninex Residency, Sector 37C, Gurugram for fast walk-in service.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <a href="https://maps.app.goo.gl/vuN5QDzjVbjhKDVh7" target="_blank" rel="noopener noreferrer" className="px-6 py-3.5 rounded-2xl bg-emerald-500 text-black font-extrabold text-xs uppercase tracking-wider hover:bg-emerald-400 shadow-md flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Get Directions to Store</span>
            </a>
            <a href="https://wa.me/919289942313?text=Hi%20Smart%20Care,%20I%20want%20to%20send%20a%20document%20for%20printing." target="_blank" rel="noopener noreferrer" className="px-6 py-3.5 rounded-2xl bg-card border border-border text-foreground font-extrabold text-xs uppercase tracking-wider hover:bg-muted flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-emerald-500" />
              <span>Send PDF on WhatsApp</span>
            </a>
          </div>
        </section>

        {/* Services Grid */}
        <section className="space-y-6">
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Our Printing & Document Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {servicesList.map((srv, i) => {
              const IconComp = srv.icon;
              return (
                <div key={i} className="p-6 rounded-2xl bg-card border border-border space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <IconComp className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground">{srv.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{srv.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Store Location & Timing Banner */}
        <section className="p-8 rounded-3xl bg-card border border-border space-y-4">
          <h2 className="text-xl font-bold text-foreground">Visit Our Sector 37C Workshop & Store</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground block font-bold">Address:</strong>
                Shop No. 28, Ninex Residency, Sector 37C, Gurugram, Haryana 122001
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground block font-bold">Opening Hours:</strong>
                Open Daily: 10:00 AM – 9:00 PM (Monday to Sunday)
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

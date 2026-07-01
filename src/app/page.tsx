import React from "react";
import Link from "next/link";
import { 
  HeartPulse, 
  Smartphone, 
  Sparkles, 
  Wrench, 
  ShoppingBag, 
  ShieldCheck, 
  ChevronRight,
  TrendingDown,
  Activity,
  Award,
  Zap,
  Star
} from "lucide-react";
import { formatINR } from "@/lib/utils";

export default function Home() {
  const testimonials = [
    { name: "Amit Sharma", city: "Delhi", rating: 5, text: "Switched my generic medications to Jan Aushadhi generic equivalents via Smart Care. Saved over ₹2,400 this month alone!" },
    { name: "Pooja Mehta", city: "Noida", rating: 5, text: "AI Mobile Diagnostics pinpointed my battery charging issue instantly. The doorstep repair was completed in 1 hour. Highly recommended!" },
    { name: "John Abraham", city: "Gurugram", rating: 5, text: "Excellent customer service and premium fast chargers. The website design is sleek and extremely fast." }
  ];

  return (
    <div className="flex-grow flex flex-col relative overflow-hidden bg-background">
      {/* Dynamic Background Image Loop (Video-like Slow Pan) */}
      <div className="absolute top-[-100px] left-0 w-full h-[700px] overflow-hidden pointer-events-none select-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background z-10" />
        <img
          src="/hero_background.png"
          alt="Smart Care & Mobile Point Concept Wallpaper"
          className="w-full h-full object-cover opacity-[0.28] animate-slow-pan"
        />
      </div>

      {/* Background Ambient Lights (Apple/Stripe Aesthetic) */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center space-y-6 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-muted border border-border/80 text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-fade-in">
          <Sparkles className="h-3.5 w-3.5 text-cyan-500 animate-pulse" />
          <span>India&apos;s Advanced AI-Powered Solution Platform</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1] font-sans">
          Your One-Stop Destination for{" "}
          <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
            Healthcare & Mobile Solutions
          </span>
        </h1>
        
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
          Consult our AI health assistant for general guidance, get instant smartphone diagnostic quotes, shop premium accessories, and book certified repair technicians.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-6 max-w-sm sm:max-w-none mx-auto">
          <Link
            href="/health-assistant"
            className="px-6 py-3.5 rounded-2xl bg-foreground text-background font-bold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 shadow-lg hover:translate-y-[-1px] transition-all uppercase tracking-wider"
          >
            AI Health Assistant
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            href="/mobile-assistant"
            className="px-6 py-3.5 rounded-2xl bg-muted text-foreground border border-border font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-muted/80 hover:translate-y-[-1px] transition-all uppercase tracking-wider"
          >
            AI Device Diagnostics
          </Link>
        </div>
      </section>

      {/* Main Core Portals Grid (Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Card: Smartphone Repairs */}
          <div className="glass-card rounded-3xl p-8 border border-border flex flex-col justify-between hover:border-cyan-500/25 group transition-all duration-300">
            <div className="space-y-4">
              <span className="p-3.5 inline-flex rounded-2xl bg-cyan-500/10 text-cyan-500 group-hover:scale-105 transition-transform duration-300">
                <Wrench className="h-6 w-6" />
              </span>
              <h3 className="text-xl font-bold text-foreground">Smart Repair Portal</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Broken displays, battery drain, speaker static, or liquid damage? Get instant repair pricing estimates and schedule doorstep pickup service.
              </p>
            </div>
            <Link
              href="/repair"
              className="mt-8 flex items-center gap-1 text-xs font-bold text-cyan-500 hover:underline"
            >
              Book Repair Job
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Card: Premium Accessories */}
          <div className="glass-card rounded-3xl p-8 border border-border flex flex-col justify-between hover:border-cyan-500/25 group transition-all duration-300">
            <div className="space-y-4">
              <span className="p-3.5 inline-flex rounded-2xl bg-cyan-500/10 text-cyan-500 group-hover:scale-105 transition-transform duration-300">
                <ShoppingBag className="h-6 w-6" />
              </span>
              <h3 className="text-xl font-bold text-foreground">Accessories E-Store</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Equip your smartphone with certified GaN wall adapters, durable double-braided nylon charging cables, and military-grade drop cases.
              </p>
            </div>
            <Link
              href="/accessories"
              className="mt-8 flex items-center gap-1 text-xs font-bold text-cyan-500 hover:underline"
            >
              Shop Accessories
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* Feature Section: Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 w-full border-t border-border/40">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Engineered for Reliability & Savings</h2>
          <p className="text-xs text-muted-foreground">Certified medical standard checks and top-tier electronics components.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-card border border-border text-center space-y-3">
            <TrendingDown className="h-8 w-8 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-sm">Up to 80% Cost Savings</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">Government-approved generic substitutes compared side-by-side.</p>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border text-center space-y-3">
            <Award className="h-8 w-8 text-cyan-500 mx-auto" />
            <h4 className="font-bold text-sm">Certified Technicians</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">Diagnostics and parts replacements completed by ESD-safe specialists.</p>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border text-center space-y-3">
            <ShieldCheck className="h-8 w-8 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-sm">3-Months Warranty</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">Every smartphone repair and accessory purchase includes hardware assurance.</p>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border text-center space-y-3">
            <Zap className="h-8 w-8 text-cyan-500 mx-auto" />
            <h4 className="font-bold text-sm">AI-Powered Diagnostics</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">Instant diagnosis guides powered by Gemini and direct OCR prescription parsing.</p>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 w-full border-t border-border/40">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Trust & Reviews</h2>
          <p className="text-xs text-muted-foreground">What our patients and clients say about us.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-6 border border-border space-y-4">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="h-4.5 w-4.5 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="pt-2 border-t border-border/30">
                <span className="font-semibold text-xs text-foreground block">{t.name}</span>
                <span className="text-[10px] text-muted-foreground">{t.city}, India</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Smartphone, 
  Sparkles, 
  Wrench, 
  ShoppingBag, 
  ShieldCheck, 
  ChevronRight,
  Activity,
  Award,
  Zap,
  Star,
  Search,
  MessageSquare,
  Clock,
  Heart,
  Plus,
  Minus,
  MapPin,
  Check,
  Truck,
  ArrowRight,
  User,
  ThumbsUp,
  Sliders,
  AlertCircle,
  Mail,
  Navigation,
  ChevronLeft,
  Phone
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const router = useRouter();
  
  // Search query
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Review Slider State
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  // Contact Form State
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactDevice, setContactDevice] = useState("");
  const [contactIssue, setContactIssue] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [isContactSuccess, setIsContactSuccess] = useState(false);

  // Before/After Slider state
  const [sliderPos, setSliderPos] = useState(50);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/accessories?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactPhone || !contactDevice || !contactIssue) {
      alert("Please fill in all required fields.");
      return;
    }
    
    setIsSubmittingContact(true);
    setTimeout(() => {
      setIsSubmittingContact(false);
      setIsContactSuccess(true);
      confetti({
        particleCount: 80,
        spread: 60,
        colors: ["#10b981", "#06b6d4"]
      });
      setTimeout(() => {
        setIsContactSuccess(false);
        setContactName("");
        setContactPhone("");
        setContactEmail("");
        setContactDevice("");
        setContactIssue("");
        setContactMessage("");
      }, 5000);
    }, 1500);
  };

  // Static trust numbers
  const stats = [
    { value: "15,000+", label: "Devices Repaired" },
    { value: "4.9★", label: "Google Rating (1.2k Reviews)" },
    { value: "100%", label: "Genuine Parts" },
    { value: "90-Day", label: "Service Warranty" }
  ];

  // Brand Logos
  const brandLogos = [
    "Apple", "Samsung", "OnePlus", "Vivo", "Oppo", 
    "Xiaomi", "Realme", "Motorola", "Nothing", "Google Pixel"
  ];

  // Why Choose Us feature cards
  const features = [
    { title: "Certified Technicians", desc: "ESD-safe environment and certified expert engineers for all micro-soldering tasks.", icon: Award, color: "text-cyan-500" },
    { title: "Genuine Parts", desc: "We use only AAA-grade or OEM original spare components backed by warranty.", icon: ShieldCheck, color: "text-emerald-500" },
    { title: "Pickup & Drop", desc: "Free door-step pick and delivery across Gurugram. Smart distance charges apply.", icon: Truck, color: "text-amber-500" },
    { title: "Same Day Repair", desc: "Screen replacements and battery swaps completed in under 45 minutes.", icon: Zap, color: "text-purple-500" },
    { title: "90-Day Service Warranty", desc: "Relax with a solid 90-day parts swap coverage on screen and diagnostic fixes.", icon: Clock, color: "text-cyan-500" },
    { title: "Affordable Pricing", desc: "Completely transparent price estimations. Pay only what is quoted, no hidden fees.", icon: Activity, color: "text-emerald-500" },
    { title: "Fast Delivery", desc: "Super fast return delivery of your device once final testing passes.", icon: Sliders, color: "text-amber-500" },
    { title: "Customer Satisfaction", desc: "Rated 4.9★ on Google Maps. Over 1,200 Gurugram device owners trust us.", icon: ThumbsUp, color: "text-purple-500" }
  ];

  // Repair Timeline Steps
  const timelineSteps = [
    { number: "01", title: "Book Service", desc: "Fill pickup details online or call us directly.", icon: Smartphone },
    { number: "02", title: "Pickup", desc: "Logistics agent collects your phone securely.", icon: Truck },
    { number: "03", title: "Diagnosis", desc: "Technician inspects core hardware circuits.", icon: Search },
    { number: "04", title: "Repair", desc: "Certified replacements done in ESD-safe lab.", icon: Wrench },
    { number: "05", title: "Quality Check", desc: "21-point rigorous testing checklist.", icon: ShieldCheck },
    { number: "06", title: "Delivery", desc: "Device returned safely with service warranty.", icon: Check }
  ];

  // Google Testimonials Carousel
  const reviews = [
    { name: "Sumit Rawat", rating: 5, text: "Excellent screen replacement service! Rahul took less than 45 minutes to fix my cracked OnePlus display. The pricing was exactly as quoted. Highly recommended!", location: "Sector 37C, Gurugram" },
    { name: "Neha Kapoor", rating: 5, text: "Very professional pickup and drop service. The agent picked up my Samsung S23 in Sector 45 and returned it repaired on the same day. Saved me so much time!", location: "Sector 45, Gurugram" },
    { name: "Vikram Sen", rating: 5, text: "Rahul diagnosed a battery drain issue on my iPhone. Replaced it with an original OEM battery and gave a 90-day warranty. The battery life is like new again.", location: "Sohna Road, Gurugram" },
    { name: "Arjun Mehta", rating: 5, text: "Superb experience! I bought a MagSafe case and got my charging port fixed. Transparency, fair pricing, and polite staff. Great store near Residency.", location: "Ninex Residency, Gurugram" }
  ];

  const handleNextReview = () => {
    setCurrentReviewIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  const handlePrevReview = () => {
    setCurrentReviewIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  // FAQ list
  const faqs = [
    { q: "Where is your store located?", a: "Our store, Smart Care & Mobile Point, is located at Shop No. 28, Ninex Residency, Sector 37C, Gurugram, Haryana 122001." },
    { q: "What are your business hours?", a: "We are open Monday to Sunday from 10:00 AM to 9:00 PM." },
    { q: "How much are pickup and drop charges?", a: "Logistics charges are FREE for addresses within 5 km of the shop, and ₹200 for addresses beyond 5 km. Repair costs are separate." },
    { q: "Do you offer a warranty on repairs?", a: "Yes! We offer a 90-day service warranty on replaced parts (like displays, battery, charging ports) against any defects." },
    { q: "How can I calculate distance from my home?", a: "Simply visit our 'Pickup & Drop' page, enter your pickup address, and our system will calculate the distance and show the fee automatically before booking." }
  ];

  const handleSliderMove = (e: React.MouseEvent | React.TouchEvent) => {
    const container = e.currentTarget as HTMLDivElement;
    const rect = container.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  return (
    <div className="flex-grow flex flex-col relative overflow-hidden bg-background">
      
      {/* Background Animated Wallpaper Grid */}
      <div className="absolute top-[-100px] left-0 w-full h-[800px] overflow-hidden pointer-events-none select-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background z-10" />
        <img
          src="/hero_background.png"
          alt="Smart Care Premium backdrop"
          className="w-full h-full object-cover opacity-[0.25] dark:opacity-[0.22] animate-slow-pan"
        />
      </div>

      {/* Floating lights */}
      <div className="absolute top-[-150px] left-1/3 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[-50px] right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* 1. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center space-y-8 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-muted border border-border/80 text-[10px] font-bold uppercase tracking-wider text-muted-foreground shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-cyan-500 animate-pulse" />
          <span>Gurugram&apos;s Premium Smart Diagnostics & Repair Hub</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1] font-sans">
          Premium Care for Your Device.{" "}
          <span className="bg-gradient-to-r from-cyan-400 to-emerald-500 bg-clip-text text-transparent">
            Instant AI Support.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Book certified doorstep mobile repairs, troubleshoot device issues in real-time with our AI assistant, and shop premium protective accessories with a 90-day service warranty.
        </p>

        {/* Global search */}
        <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto relative flex items-center bg-card border border-border shadow-lg rounded-2xl p-1.5 group focus-within:border-cyan-500/50 transition-all duration-300">
          <Search className="h-5 w-5 text-muted-foreground ml-3" />
          <input
            type="text"
            placeholder="Search accessories (e.g. Galaxy S25 case, Fast charger)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-0 px-3 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none"
          />
          <button type="submit" className="px-4 py-2.5 rounded-xl bg-foreground text-background font-bold text-[11px] hover:opacity-90 transition-opacity">
            Search
          </button>
        </form>

        {/* Primary CTAs */}
        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <Link
            href="/pickup"
            className="px-6 py-3.5 rounded-2xl bg-amber-500 text-black font-bold text-xs flex items-center gap-1.5 hover:bg-amber-400 shadow-md shadow-amber-500/10 transition-all hover:scale-[1.01]"
          >
            <Truck className="h-4 w-4" />
            Book Pickup & Drop
          </Link>
          <Link
            href="/accessories"
            className="px-6 py-3.5 rounded-2xl bg-cyan-500 text-black font-bold text-xs flex items-center gap-1.5 hover:bg-cyan-400 shadow-md shadow-cyan-500/10 transition-all hover:scale-[1.01]"
          >
            <ShoppingBag className="h-4 w-4" />
            Shop Accessories
          </Link>
          <Link
            href="/repair"
            className="px-6 py-3.5 rounded-2xl bg-foreground text-background font-bold text-xs flex items-center gap-1.5 hover:opacity-90 shadow-md transition-all hover:scale-[1.01]"
          >
            <Wrench className="h-4 w-4" />
            Book Mobile Repair
          </Link>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10 w-full">
        <div className="glass-card rounded-3xl p-6 border border-border max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-border/40">
          {stats.map((s, idx) => (
            <div key={idx} className={idx > 0 ? "pl-2 border-l border-border/40" : ""}>
              <p className="text-xl sm:text-2xl font-black text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BRAND LOGOS SLIDER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 w-full text-center border-t border-border/30 mt-6 overflow-hidden">
        <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground block mb-6">Expert Repairs & Spares Supported For</span>
        
        {/* Infinite scrolling marquee wrapper */}
        <div className="relative w-full overflow-hidden py-2">
          {/* Fading side masks for premium look */}
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />
          
          <div className="flex w-max gap-6 items-center animate-marquee opacity-75 grayscale hover:grayscale-0 transition-all duration-300">
            {/* First render of logos */}
            {brandLogos.map((brand) => (
              <span key={`first-${brand}`} className="inline-flex text-sm font-extrabold text-foreground tracking-tight px-6 py-2.5 bg-muted/45 border border-border/40 rounded-2xl hover:bg-muted/80 transition-colors select-none">
                {brand}
              </span>
            ))}
            {/* Duplicate logos for seamless infinite scrolling loop */}
            {brandLogos.map((brand) => (
              <span key={`second-${brand}`} className="inline-flex text-sm font-extrabold text-foreground tracking-tight px-6 py-2.5 bg-muted/45 border border-border/40 rounded-2xl hover:bg-muted/80 transition-colors select-none">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PICKUP & DROP PROMOTION CARD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full border-t border-border/40">
        <div className="glass-card rounded-3xl p-8 border border-emerald-500/20 bg-emerald-500/[0.01] grid grid-cols-1 md:grid-cols-12 gap-8 items-center max-w-5xl mx-auto shadow-md">
          <div className="md:col-span-8 space-y-4 text-left">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">Convenient Logistics</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">Free Doorstep Pickup & Delivery</h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
              Don&apos;t let a cracked screen ruin your day. Book doorstep pickup. We will fetch your mobile, diagnose and swap components, package it securely, and deliver it back to you. Same-day repair service available.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-foreground">
              <span className="flex items-center gap-1.5">✓ Safe Anti-Static Pack</span>
              <span className="flex items-center gap-1.5">✓ Cash/UPI/Card at Doorstep</span>
              <span className="flex items-center gap-1.5">✓ Live SMS Diagnostics Status</span>
            </div>
          </div>
          <div className="md:col-span-4 text-center md:text-right space-y-4">
            <div className="bg-background/80 border border-border rounded-2xl p-4 text-left shadow-sm inline-block w-full max-w-[240px]">
              <span className="text-[9px] uppercase font-bold text-muted-foreground block">Pickup Charges</span>
              <p className="text-xs font-bold text-foreground mt-1">• Till 5 km: <span className="text-emerald-500">FREE</span></p>
              <p className="text-xs font-bold text-foreground mt-0.5">• Beyond 5 km: <span className="text-amber-500">₹200</span></p>
              <span className="text-[9px] text-muted-foreground block mt-2 leading-tight">*Repair charges separate.*</span>
            </div>
            <Link
              href="/pickup"
              className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-foreground text-background font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
            >
              <Truck className="h-4.5 w-4.5" />
              Book Pickup Now
            </Link>
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE US SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 w-full border-t border-border/40">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Engineered for Premium Reliability</h2>
          <p className="text-xs text-muted-foreground">Why Gurugram smartphone owners choose Smart Care & Mobile Point.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat) => (
            <div key={feat.title} className="p-6 rounded-3xl bg-card border border-border text-center space-y-3.5 hover:border-cyan-500/20 hover:scale-[1.01] transition-all duration-300 group shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                <feat.icon className={`h-5 w-5 ${feat.color}`} />
              </div>
              <h4 className="font-bold text-sm text-foreground">{feat.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed h-12">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. REPAIR PROCESS TIMELINE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 w-full border-t border-border/40">
        <div className="text-center space-y-2 mb-12">
          <span className="text-[10px] uppercase font-bold text-cyan-500 tracking-widest">Our Service Cycle</span>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">How We Fix Your Device</h2>
          <p className="text-xs text-muted-foreground">Six streamlined stages to get your phone fully operating again.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {timelineSteps.map((step, idx) => (
            <div key={step.title} className="p-5 rounded-2xl bg-card border border-border relative flex flex-col justify-between hover:border-cyan-500/25 transition-colors shadow-sm group">
              <div className="flex justify-between items-start">
                <span className="text-2xl font-black text-muted-foreground/35 tracking-tighter">{step.number}</span>
                <span className="p-2 rounded-xl bg-muted group-hover:scale-105 transition-transform">
                  <step.icon className="h-4.5 w-4.5 text-cyan-500" />
                </span>
              </div>
              <div className="mt-6">
                <h4 className="font-bold text-xs text-foreground">{step.title}</h4>
                <p className="text-[10px] text-muted-foreground mt-1 leading-normal">{step.desc}</p>
              </div>
              {idx < 5 && (
                <div className="hidden lg:block absolute top-1/2 -right-3.5 -translate-y-1/2 z-10 text-muted-foreground/60">
                  <ArrowRight className="h-4.5 w-4.5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* BEFORE & AFTER SHOWCASE INTERACTIVE SLIDER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 w-full border-t border-border/40">
        <div className="text-center space-y-2 max-w-xl mx-auto mb-10">
          <span className="text-[10px] uppercase font-bold text-cyan-500 tracking-wider">Before & After Repair Quality</span>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Visual Diagnostic Swap Check</h2>
          <p className="text-xs text-muted-foreground">Drag or slide to inspect screen repair results completed by our technicians.</p>
        </div>

        <div className="flex justify-center">
          <div 
            onMouseMove={handleSliderMove}
            onTouchMove={handleSliderMove}
            className="relative w-full max-w-xl h-80 rounded-3xl overflow-hidden border border-border/80 shadow-lg cursor-ew-resize select-none"
          >
            {/* Before (Cracked Screen) */}
            <div className="absolute inset-0 bg-zinc-950 flex items-center justify-center">
              <div className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-lg bg-red-500 text-white text-[9px] font-bold uppercase tracking-wider">
                Before: Cracked screen
              </div>
              <img 
                src="/cracked_phone.png" 
                className="w-full h-full object-cover select-none pointer-events-none" 
                alt="Before cracked screen repair"
              />
            </div>

            {/* After (Clean Repaired Glass) - Layer with dynamic slider position width */}
            <div 
              style={{ width: `${sliderPos}%` }}
              className="absolute inset-y-0 left-0 bg-zinc-900 border-r-2 border-cyan-400 overflow-hidden"
            >
              {/* After content (width matches the max-w-xl container width of 576px) */}
              <div className="absolute inset-0 w-[576px] h-full">
                <div className="absolute top-4 right-4 z-10 px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-wider">
                  After: Clean clear display
                </div>
                <img 
                  src="/repaired_phone.png" 
                  className="w-full h-full object-cover select-none pointer-events-none" 
                  alt="After repaired clean display"
                />
              </div>
            </div>

            {/* Slider Handle */}
            <div 
              style={{ left: `${sliderPos}%` }}
              className="absolute inset-y-0 -ml-[1px] w-0.5 bg-cyan-400 pointer-events-none"
            >
              <div className="absolute top-1/2 -translate-y-1/2 -ml-3.5 h-7 w-7 rounded-full bg-cyan-500 text-black shadow-md flex items-center justify-center font-bold text-xs select-none">
                ↔
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. GOOGLE REVIEWS TESTIMONIALS CAROUSEL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 w-full border-t border-border/40">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-1 text-amber-500">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-amber-500 text-amber-500" />)}
          </div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Loved by Gurugram Device Owners</h2>
          <p className="text-xs text-muted-foreground">Certified 4.9★ rating on Google Maps from over 1,200+ local customer reviews.</p>
        </div>

        <div className="relative max-w-2xl mx-auto">
          {/* Testimonial slider view */}
          <div className="glass-card rounded-3xl p-8 border border-border space-y-6 shadow-lg min-h-[190px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(reviews[currentReviewIndex].rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-xl flex items-center gap-0.5">
                  <Check className="h-3 w-3 stroke-[2.5]" /> Verified Google Review
                </span>
              </div>
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                &ldquo;{reviews[currentReviewIndex].text}&rdquo;
              </p>
            </div>
            
            <div className="pt-4 border-t border-border/45 flex justify-between items-center">
              <div>
                <span className="font-bold text-xs text-foreground block">{reviews[currentReviewIndex].name}</span>
                <span className="text-[10px] text-muted-foreground">{reviews[currentReviewIndex].location}</span>
              </div>
              
              {/* Slider Dots */}
              <div className="flex gap-1.5">
                {reviews.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentReviewIndex(idx)}
                    className={`h-2 w-2 rounded-full transition-all ${
                      idx === currentReviewIndex ? "bg-cyan-500 w-4" : "bg-muted-foreground/30"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Left/Right controls */}
          <button
            onClick={handlePrevReview}
            className="absolute left-[-20px] sm:left-[-50px] top-1/2 -translate-y-1/2 p-2 rounded-full bg-background border border-border shadow-md hover:bg-muted text-foreground transition-colors"
            aria-label="Previous Review"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={handleNextReview}
            className="absolute right-[-20px] sm:right-[-50px] top-1/2 -translate-y-1/2 p-2 rounded-full bg-background border border-border shadow-md hover:bg-muted text-foreground transition-colors"
            aria-label="Next Review"
          >
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </div>
      </section>

      {/* 7. CONTACT FORM & GOOGLE MAPS INTEGRATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 w-full border-t border-border/40 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Contact details & Map Embed (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-cyan-500 tracking-wider">Contact & Location</span>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Visit Our Workshop</h2>
            <p className="text-xs text-muted-foreground">Drop in or get directions to Gurugram&apos;s leading repair service outlet.</p>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-border space-y-4 text-xs text-muted-foreground shadow-sm">
            <div className="flex items-start gap-2.5">
              <MapPin className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-foreground">Address</p>
                <p className="mt-0.5">Shop No. 28, Ninex Residency, Sector 37C, Gurugram, Haryana 122001</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5">
              <Phone className="h-5 w-5 text-cyan-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-foreground">Call / WhatsApp</p>
                <a href="tel:+919289942313" className="hover:text-foreground transition-colors mt-0.5 block">+91 92899 42313</a>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Mail className="h-5 w-5 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-foreground">Email</p>
                <a href="mailto:enigcon2020@gmail.com" className="hover:text-foreground transition-colors mt-0.5 block">enigcon2020@gmail.com</a>
              </div>
            </div>

            <div className="flex items-start gap-2.5 border-t border-border/40 pt-4">
              <Clock className="h-5 w-5 text-cyan-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-foreground">Business Hours</p>
                <p className="mt-0.5">Monday–Sunday: 10:00 AM – 9:00 PM</p>
              </div>
            </div>
          </div>

          {/* Interactive Google Map Embed */}
          <div className="glass-card rounded-3xl border border-border overflow-hidden shadow-md flex flex-col">
            <div className="h-64 w-full relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3507.894072411972!2d76.990898!3d28.4526094!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d18f0d00058bd%3A0xba40220b4cd272e9!2sSmart+Care+%26+Mobile+Point!5e0!3m2!1sen!2sin!4v1720800000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps Location of Smart Care & Mobile Point"
              />
            </div>
            <div className="p-4 bg-muted/40 border-t border-border flex items-center justify-between">
              <span className="text-[10px] font-semibold text-muted-foreground">Mobile-friendly map routing</span>
              <a 
                href="https://maps.app.goo.gl/vuN5QDzjVbjhKDVh7"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4.5 py-2 bg-foreground text-background font-bold text-[10px] rounded-xl flex items-center gap-1 hover:opacity-90 select-none"
              >
                <Navigation className="h-3.5 w-3.5 fill-current" />
                Get Directions
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="glass-card rounded-3xl p-8 border border-border shadow-lg">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-6">Drop Us a Message</h3>
            
            <AnimatePresence mode="wait">
              {!isContactSuccess ? (
                <motion.form 
                  key="contact-form"
                  onSubmit={handleContactSubmit} 
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground">Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground">Phone <span className="text-red-500">*</span></label>
                      <input
                        type="tel"
                        required
                        placeholder="Contact number"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground">Email</label>
                      <input
                        type="email"
                        placeholder="Email address"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground">Device Model <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. iPhone 14, Galaxy S22"
                        value={contactDevice}
                        onChange={(e) => setContactDevice(e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Select Issue <span className="text-red-500">*</span></label>
                    <select
                      required
                      value={contactIssue}
                      onChange={(e) => setContactIssue(e.target.value)}
                      className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    >
                      <option value="">Choose issue...</option>
                      <option value="broken_screen">Broken Screen Replacement</option>
                      <option value="battery">Battery Drainage / Replacement</option>
                      <option value="charging">Charging / Port Issue</option>
                      <option value="sound">Speaker / Sound static</option>
                      <option value="diagnostics">Unknown Hardware Fault</option>
                      <option value="others">Others</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Message</label>
                    <textarea
                      rows={3}
                      placeholder="Add details about your issue..."
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingContact}
                    className="w-full py-3.5 bg-foreground text-background font-bold rounded-xl text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
                  >
                    {isSubmittingContact ? (
                      <span className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Send Message"
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.div 
                  key="contact-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10 space-y-4"
                >
                  <div className="h-12 w-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                    <Check className="h-6 w-6 stroke-[3]" />
                  </div>
                  <h4 className="font-bold text-foreground">Message Sent Successfully!</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Thanks for contacting us. We will get back to you within 2 business hours regarding your repair request.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 8. FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 w-full border-t border-border/40">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Frequently Asked Questions</h2>
          <p className="text-xs text-muted-foreground">Get quick answers regarding warranty, locations, and device repairs.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className="bg-card border border-border rounded-2xl overflow-hidden transition-all">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-xs text-foreground select-none"
                >
                  <span>{faq.q}</span>
                  <span className="text-muted-foreground ml-2">
                    {isOpen ? <Minus className="h-4.5 w-4.5" /> : <Plus className="h-4.5 w-4.5" />}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-muted-foreground border-t border-border/30 leading-relaxed animate-in slide-in-from-top-1 duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}

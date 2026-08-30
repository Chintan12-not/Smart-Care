"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Phone,
  Lock,
  Building2,
  Printer,
  Gift
} from "lucide-react";
import PhoneModelFinder from "@/components/accessories/PhoneModelFinder";


import { formatINR } from "@/lib/utils";
import confetti from "canvas-confetti";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [showAuthPopup, setShowAuthPopup] = useState(false);

  // Trigger login/signup popup on land if guest
  useEffect(() => {
    if (!authLoading && !user) {
      const dismissed = sessionStorage.getItem("sc_auth_popup_dismissed");
      if (!dismissed) {
        const timer = setTimeout(() => {
          setShowAuthPopup(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [user, authLoading]);

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
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const [sliderWidth, setSliderWidth] = useState(576);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        if (sliderContainerRef.current) {
          setSliderWidth(sliderContainerRef.current.offsetWidth);
        }
      };
      // Wait for mount layout layout cycles
      const timer = setTimeout(handleResize, 100);
      window.addEventListener("resize", handleResize);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/repair?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactPhone || !contactDevice || !contactIssue) {
      alert("Please fill in all required fields.");
      return;
    }
    
    setIsSubmittingContact(true);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          access_key: "c30177c2-2365-458f-a261-474f35fdc4d5",
          subject: `New Mobile Repair Inquiry: ${contactName} (${contactDevice})`,
          from_name: "Smart Care Mobile Point",
          name: contactName,
          phone: contactPhone,
          email: contactEmail || "Not provided",
          replyto: "enigcononline@gmail.com, chintanmaheshwari714@gmail.com",
          admin_email: "enigcononline@gmail.com, chintanmaheshwari714@gmail.com",
          device_model: contactDevice,
          issue: contactIssue,
          message: contactMessage || "No additional details provided",
          formType: "General Contact Inquiry"
        })
      });

      // Dual dispatch to backend email API (sends to enigcononline@gmail.com & chintanmaheshwari714@gmail.com)
      fetch("/api/v1/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact",
          to: contactEmail || "enigcononline@gmail.com",
          payload: {
            name: contactName,
            phone: contactPhone,
            email: contactEmail || "Not provided",
            device: contactDevice,
            issue: contactIssue,
            message: contactMessage
          }
        })
      }).catch(err => console.error("Contact email dispatch error:", err));

      const result = await response.json();
      if (response.ok && result.success) {
        setIsContactSuccess(true);
        setTimeout(() => {
          setIsContactSuccess(false);
          setContactName("");
          setContactPhone("");
          setContactEmail("");
          setContactDevice("");
          setContactIssue("");
          setContactMessage("");
        }, 5000);
      } else {
        alert(result.message || "Failed to submit message. Please try again or WhatsApp us at +91 9289942313.");
      }
    } catch (err) {
      console.error("Web3Forms submit error:", err);
      alert("Network error occurred while sending your message. Please WhatsApp us directly at +91 9289942313.");
    } finally {
      setIsSubmittingContact(false);
    }
  };

  // Static trust highlights (Policy Compliant)
  const stats = [
    { value: "Same-Day", label: "Doorstep Repair" },
    { value: "600+", label: "Supported Models" },
    { value: "Transparent", label: "Diagnostic Pricing" },
    { value: "Sector 37C", label: "Gurugram Service Hub" }
  ];

  // Brand Logos
  const brandLogos = [
    "Apple", "Samsung", "OnePlus", "Vivo", "Oppo", 
    "Xiaomi", "Realme", "Motorola", "Nothing", "Google Pixel"
  ];

  // Why Choose Us feature cards (Policy Compliant)
  const features = [
    { title: "Expert Engineers", desc: "ESD-safe environment and experienced technicians for all micro-soldering and display repairs.", icon: Award, color: "text-cyan-500" },
    { title: "Quality Tested Spares", desc: "We use only tested high-grade or OEM-compatible spare components ensuring maximum reliability.", icon: ShieldCheck, color: "text-emerald-500" },
    { title: "Pickup & Drop", desc: "Door-step pickup and return delivery across Gurugram. Smart distance charges apply.", icon: Truck, color: "text-amber-500" },
    { title: "Same Day Repair", desc: "Screen replacements and battery swaps completed in under 45 minutes.", icon: Zap, color: "text-purple-500" },
    { title: "No Hidden Costs", desc: "Pay exactly what is quoted in the diagnostics estimate report. Absolutely transparent pricing.", icon: Clock, color: "text-cyan-500" },
    { title: "Affordable Pricing", desc: "Completely transparent price estimations. Pay only what is quoted, no hidden fees.", icon: Activity, color: "text-emerald-500" },
    { title: "Fast Delivery", desc: "Super fast return delivery of your device once final testing passes.", icon: Sliders, color: "text-amber-500" },
    { title: "Customer Satisfaction", desc: "Trusted by Gurugram smartphone owners for fast, reliable device repairs.", icon: ThumbsUp, color: "text-purple-500" }
  ];

  // Repair Timeline Steps
  const timelineSteps = [
    { number: "01", title: "Book Service", desc: "Fill pickup details online or call us directly.", icon: Smartphone },
    { number: "02", title: "Pickup", desc: "Logistics agent collects your phone securely.", icon: Truck },
    { number: "03", title: "Diagnosis", desc: "Technician inspects core hardware circuits.", icon: Search },
    { number: "04", title: "Repair", desc: "Certified replacements done in ESD-safe lab.", icon: Wrench },
    { number: "05", title: "Quality Check", desc: "21-point rigorous testing checklist.", icon: ShieldCheck },
    { number: "06", title: "Delivery", desc: "Device returned safely, fully verified and tested.", icon: Check }
  ];

  // Google Testimonials Carousel
  const reviews = [
    { name: "Sumit Rawat", rating: 5, text: "Excellent screen replacement service! Rahul took less than 45 minutes to fix my cracked OnePlus display. The pricing was exactly as quoted. Highly recommended!", location: "Sector 37C, Gurugram" },
    { name: "Neha Kapoor", rating: 5, text: "Very professional pickup and drop service. The agent picked up my Samsung S23 in Sector 45 and returned it repaired on the same day. Saved me so much time!", location: "Sector 45, Gurugram" },
    { name: "Vikram Sen", rating: 5, text: "Rahul diagnosed a battery drain issue on my iPhone. Replaced it with an original OEM battery and tested it thoroughly. The battery life is like new again.", location: "Sohna Road, Gurugram" },
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
    { q: "How much are pickup and drop charges?", a: "Logistics charges are FREE for addresses within 5 km of the shop, ₹120 for addresses between 5 and 10 km, ₹200 for addresses between 10 and 15 km, and ₹300 beyond 15 km. Repair costs are separate." },
    { q: "Do you use original parts?", a: "Yes! We use premium OEM-grade and AAA-grade original components for all screen, battery, and charging port replacements." },
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
      
      {/* Background Animated Wallpaper Grid / Hero Cinematic Video */}
      <div className="absolute top-[-100px] left-0 w-full h-[800px] overflow-hidden pointer-events-none select-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/75 to-background z-10" />
        <div className="absolute inset-0 bg-background/50 dark:bg-background/15 z-5 pointer-events-none" />
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/hero_background.png"
          className="w-full h-full object-cover opacity-[0.75] dark:opacity-[0.55] animate-slow-pan filter brightness-[0.95] dark:brightness-[0.7] contrast-[1.05]"
        >
          <source src="/hero_bg.mp4" type="video/mp4" />
          {/* Fallback image in case video fails to load */}
          <img
            src="/hero_background.png"
            alt="Smart Care Premium backdrop"
            className="w-full h-full object-cover"
          />
        </video>
      </div>

      {/* Floating lights */}
      <div className="absolute top-[-150px] left-1/3 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[-50px] right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* 1. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 text-center space-y-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-500 shadow-sm">
          <ShieldCheck className="h-4 w-4" />
          <span>Trusted Doorstep Mobile Repair &amp; Pickup Service in Gurugram</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.12]">
          Expert Doorstep Mobile Repair &{" "}
          <span className="text-emerald-500">
            Express Service
          </span>
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Doorstep mobile repair pickup, 45-minute express screen replacement, genuine OEM screen/battery spares for 600+ phone models, and corporate device maintenance.
        </p>

        {/* Global search */}
        <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto relative flex items-center bg-card border border-border/80 shadow-md rounded-2xl p-1.5 group focus-within:border-emerald-500 transition-all">
          <Search className="h-5 w-5 text-muted-foreground ml-3 shrink-0" />
          <input
            type="text"
            placeholder="Search repair services or phone models (e.g. iPhone 15 Screen, Samsung Battery)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-0 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none font-medium"
          />
          <button type="submit" className="px-3.5 sm:px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-extrabold text-xs sm:text-[11px] hover:bg-emerald-400 transition-all shrink-0">
            <span className="hidden sm:inline">Search Repairs</span>
            <span className="sm:hidden">Search</span>
          </button>
        </form>

        {/* Primary CTAs */}
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href="/pickup"
            className="px-6 py-3.5 rounded-2xl bg-emerald-500 text-black font-extrabold text-xs flex items-center gap-2 hover:bg-emerald-400 shadow-md transition-all active:scale-[0.99]"
          >
            <Truck className="h-4 w-4" />
            Book Doorstep Pickup & Repair
          </Link>
          <Link
            href="/corporate-orders"
            className="px-6 py-3.5 rounded-2xl bg-muted/80 border border-border/80 text-foreground font-extrabold text-xs flex items-center gap-2 hover:bg-muted transition-all"
          >
            <Building2 className="h-4 w-4 text-purple-400" />
            <span>Corporate & Bulk Repair</span>
          </Link>
        </div>

        {/* Highlighted Accessories Quick Store Banner Card */}
        <div className="max-w-2xl mx-auto pt-4">
          <div className="p-4 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-blue-500/15 to-purple-500/20 border border-cyan-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl backdrop-blur-md group hover:border-cyan-400 transition-all">
            <div className="flex items-center gap-3.5 text-left">
              <div className="h-11 w-11 rounded-2xl bg-cyan-500 text-black flex items-center justify-center font-black shadow-md shrink-0 group-hover:scale-110 transition-transform">
                <Smartphone className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-cyan-500 text-black text-[9px] font-black uppercase tracking-wider">Direct Accessories Hub</span>
                  <span className="text-[10px] text-cyan-400 font-bold">100% Genuine</span>
                </div>
                <p className="text-xs sm:text-sm font-extrabold text-foreground mt-0.5">Looking for Phone Cases, Chargers & Accessories?</p>
              </div>
            </div>
            <Link
              href="/accessories"
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shrink-0 transition-all group-hover:scale-105 active:scale-95"
            >
              <span>Explore Accessories Store</span>
              <ArrowRight className="h-4 w-4 stroke-[3]" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10 w-full">
        <div className="glass-card rounded-3xl p-6 border border-border max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
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
        <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground block mb-6">Expert Repairs &amp; Spares Supported For</span>
        
        {/* Infinite scrolling marquee wrapper */}
        <div className="relative w-full overflow-hidden py-2">
          {/* Fading side masks for premium look */}
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />
          
          <div className="flex w-max gap-4 sm:gap-6 items-center animate-marquee opacity-90 hover:opacity-100 transition-opacity">
            {/* 1st copy */}
            {brandLogos.map((brand) => (
              <span key={`first-${brand}`} className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-foreground tracking-tight px-5 py-2.5 bg-card border border-border/60 rounded-2xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all select-none shadow-sm shrink-0">
                <span className="h-2 w-2 rounded-full bg-emerald-500/60" />
                {brand}
              </span>
            ))}
            {/* 2nd copy */}
            {brandLogos.map((brand) => (
              <span key={`second-${brand}`} className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-foreground tracking-tight px-5 py-2.5 bg-card border border-border/60 rounded-2xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all select-none shadow-sm shrink-0">
                <span className="h-2 w-2 rounded-full bg-emerald-500/60" />
                {brand}
              </span>
            ))}
            {/* 3rd copy for 100% seamless infinite loop */}
            {brandLogos.map((brand) => (
              <span key={`third-${brand}`} className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-foreground tracking-tight px-5 py-2.5 bg-card border border-border/60 rounded-2xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all select-none shadow-sm shrink-0">
                <span className="h-2 w-2 rounded-full bg-emerald-500/60" />
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PICKUP & DROP PROMOTION CARD WITH FREE PHONE COVER OFFER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full border-t border-border/40">
        <div className="glass-card rounded-3xl p-8 border border-emerald-500/30 bg-gradient-to-r from-emerald-500/[0.04] via-cyan-500/[0.03] to-indigo-500/[0.04] grid grid-cols-1 md:grid-cols-12 gap-8 items-center max-w-5xl mx-auto shadow-lg relative overflow-hidden">
          
          <div className="md:col-span-8 space-y-4 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500 text-black font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <Gift className="h-3.5 w-3.5" /> FREE GIFT OFFER
              </span>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Smart Care Exclusive</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              FREE PHONE COVER
            </h2>

            <p className="text-xs sm:text-sm font-bold text-emerald-400">
              Book our Pickup &amp; Drop repair service and get a phone cover FREE from Smart Care.
            </p>

            <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
              Don&apos;t let a cracked screen ruin your day. Book doorstep pickup. We will fetch your mobile, diagnose and swap components, package it securely, and deliver it back to you with your free gift.
            </p>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-foreground pt-1">
              <span className="flex items-center gap-1.5 text-emerald-400">✓ FREE Phone Cover Included</span>
              <span className="flex items-center gap-1.5">✓ Safe Anti-Static Pack</span>
              <span className="flex items-center gap-1.5">✓ Cash/UPI at Doorstep</span>
            </div>

            <p className="text-[10px] text-muted-foreground/80 italic pt-1">
              * Offer available on eligible repair bookings.
            </p>
          </div>

          <div className="md:col-span-4 text-center md:text-right space-y-4">
            <div className="bg-card/90 border border-border rounded-2xl p-4 text-left shadow-sm inline-block mx-auto md:ml-auto w-full sm:max-w-[240px]">
              <span className="text-[9px] uppercase font-bold text-muted-foreground block">Pickup Charges</span>
              <p className="text-xs font-bold text-foreground mt-1">• Till 5 km: <span className="text-emerald-500">FREE</span></p>
              <p className="text-xs font-bold text-foreground mt-0.5">• 5 - 10 km: <span className="text-amber-500">₹120</span></p>
              <p className="text-xs font-bold text-foreground mt-0.5">• 10 - 15 km: <span className="text-amber-500">₹200</span></p>
              <p className="text-xs font-bold text-foreground mt-0.5">• Beyond 15 km: <span className="text-amber-500">₹300</span></p>
              <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground font-bold">Free Gift:</span>
                <span className="text-emerald-400 font-black">COVER INCLUDED</span>
              </div>
            </div>
            
            <Link
              href="/pickup"
              className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
            >
              <Gift className="h-4 w-4" />
              <span>BOOK PICKUP &amp; DROP</span>
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
            ref={sliderContainerRef}
            onMouseMove={handleSliderMove}
            onTouchMove={handleSliderMove}
            className="relative w-full max-w-xl aspect-[1.25] h-64 sm:h-80 rounded-3xl overflow-hidden border border-border/80 shadow-lg cursor-ew-resize select-none"
          >
            {/* Before (Cracked Screen) */}
            <div className="absolute inset-0 bg-zinc-950 flex items-center justify-center">
              <div className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-lg bg-red-500 text-white text-[9px] font-bold uppercase tracking-wider">
                Before: Cracked screen
              </div>
              <img 
                src="/cracked_phone.png" 
                className="h-full object-cover select-none pointer-events-none" 
                style={{ width: sliderWidth, maxWidth: "none" }}
                alt="Before cracked screen repair"
              />
            </div>

            {/* After (Clean Repaired Glass) - Layer with dynamic slider position width */}
            <div 
              style={{ width: `${sliderPos}%` }}
              className="absolute inset-y-0 left-0 border-r-2 border-cyan-400 overflow-hidden z-20"
            >
              {/* After content (width dynamically matches container offsetWidth in px) */}
              <div className="absolute inset-y-0 left-0 h-full" style={{ width: sliderWidth }}>
                <div className="absolute top-4 right-4 z-10 px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-wider">
                  After: Clean clear display
                </div>
                <img 
                  src="/repaired_phone.png" 
                  className="h-full object-cover select-none pointer-events-none" 
                  style={{ width: sliderWidth, maxWidth: "none" }}
                  alt="After repaired clean display"
                />
              </div>
            </div>

            {/* Slider Handle */}
            <div 
              style={{ left: `${sliderPos}%` }}
              className="absolute inset-y-0 -ml-[1px] w-0.5 bg-cyan-400 pointer-events-none z-30"
            >
              <div className="absolute top-1/2 -translate-y-1/2 -ml-3.5 h-7 w-7 rounded-full bg-cyan-500 text-black shadow-md flex items-center justify-center font-bold text-xs select-none">
                ↔
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DOCUMENT PRINTING & PHOTOCOPY (XEROX) SERVICES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full border-t border-border/40">
        <div className="glass-card rounded-3xl p-8 sm:p-10 border border-blue-500/30 bg-gradient-to-r from-blue-950/20 via-background to-sky-950/20 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Printer className="h-3.5 w-3.5" />
              In-Store Express Document Services
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              High-Speed Document Printing & Photocopy (Xerox)
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Visit our Sector 37C store for instant laser document printing, black & white or full color Xerox copies, document lamination, passport photos, and mobile bill recharges.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-bold text-foreground">
              <div className="p-3 rounded-xl bg-card border border-border/80 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                <span>B&W / Color Laser Printout</span>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border/80 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                <span>High-Speed Xerox Copy</span>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border/80 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>Document Lamination</span>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border/80 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span>Passport Photo & Recharges</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 space-y-4 text-center">
            <div className="p-5 rounded-2xl bg-card border border-border text-left shadow-sm space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 block">Visit Store For Instant Service</span>
              <p className="text-xs font-bold text-foreground">📍 Shop No. 28, Ninex Residency</p>
              <p className="text-[11px] text-muted-foreground">Sector 37C, Gurugram, Haryana 122001</p>
              <p className="text-[11px] text-emerald-500 font-semibold pt-1">🕒 Open Daily: 10:00 AM – 9:00 PM</p>
            </div>
            <a
              href="https://wa.me/919289942313?text=Hi%20Smart%20Care,%20I%20have%20a%20document%20for%20printing/photocopy."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Printer className="h-4 w-4" />
              <span>Send Document via WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* STORE GALLERY SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 w-full border-t border-border/40">
        <div className="text-center space-y-2 max-w-xl mx-auto mb-12">
          <span className="text-[10px] uppercase font-bold text-cyan-500 tracking-wider">Step Inside Our Store</span>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Our Service Center & Accessories Hub</h2>
          <p className="text-xs text-muted-foreground">Take a virtual tour of our actual workshop counter and premium stock shelves in Gurugram.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Item 1: Store Entrance */}
          <div className="glass-card rounded-3xl overflow-hidden border border-border group relative aspect-[3/4] shadow-md hover:shadow-lg transition-all duration-300">
            <img 
              src="/shop_front.png" 
              alt="Smart Care Store Entrance" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
              <span className="text-[9px] uppercase font-bold text-cyan-400 tracking-wider">Main Workshop Entrance</span>
              <h4 className="font-extrabold text-white text-sm mt-0.5">Smart Care & Mobile Point</h4>
              <p className="text-[10px] text-zinc-300 mt-1 leading-normal">Our clean service storefront in Sector 37C, Residency.</p>
            </div>
          </div>

          {/* Item 2: Accessories Shelf */}
          <div className="glass-card rounded-3xl overflow-hidden border border-border group relative aspect-[3/4] shadow-md hover:shadow-lg transition-all duration-300">
            <img 
              src="/shop_shelf.png" 
              alt="Smart Care Accessories Shelf" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
              <span className="text-[9px] uppercase font-bold text-emerald-400 tracking-wider">Premium Accessories Hub</span>
              <h4 className="font-extrabold text-white text-sm mt-0.5">Branded Stock Shelves</h4>
              <p className="text-[10px] text-zinc-300 mt-1 leading-normal">Premium headphones, chargers, adapters, and audio accessories.</p>
            </div>
          </div>

          {/* Item 3: Workshop Desk */}
          <div className="glass-card rounded-3xl overflow-hidden border border-border group relative aspect-[3/4] shadow-md hover:shadow-lg transition-all duration-300">
            <img 
              src="/shop_counter.png" 
              alt="Smart Care Service Desk" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
              <span className="text-[9px] uppercase font-bold text-amber-400 tracking-wider">Print & Xerox services</span>
              <h4 className="font-extrabold text-white text-sm mt-0.5">Printing & Photocopy Desk</h4>
              <p className="text-[10px] text-zinc-300 mt-1 leading-normal">High-speed laser document printing, photocopy (Xerox), and mobile recharges at our Sector 37C store.</p>
            </div>
          </div>

          {/* Item 4: Spare Parts Hook */}
          <div className="glass-card rounded-3xl overflow-hidden border border-border group relative aspect-[3/4] shadow-md hover:shadow-lg transition-all duration-300">
            <img 
              src="/shop_accessories.png" 
              alt="Smart Care Genuine Components" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
              <span className="text-[9px] uppercase font-bold text-purple-400 tracking-wider">Inventory & Hooks</span>
              <h4 className="font-extrabold text-white text-sm mt-0.5">Genuine Accessories Stock</h4>
              <p className="text-[10px] text-zinc-300 mt-1 leading-normal">AAA-grade screen glass, back shells, protectors, and cables ready to swap.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5.5 REQUIREMENT 14: HOMEPAGE B2B BULK ORDERS BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 w-full">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-background to-cyan-950/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="space-y-3 text-center md:text-left max-w-xl relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Building2 className="h-3.5 w-3.5" />
              Corporate & Wholesale B2B Procurement
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
              Need Bulk Quantities?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Get customized pricing for corporate, wholesale and bulk orders. Genuine products with 100% GST invoices & fast regional delivery.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <Link
              href="/corporate-orders"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 text-white font-black text-xs uppercase tracking-wider hover:opacity-95 shadow-xl shadow-purple-500/25 flex items-center gap-2 active:scale-[0.99] transition-all"
            >
              <span>Request a Bulk Quote</span>
              <ArrowRight className="h-4 w-4 stroke-[3]" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. CUSTOMER FEEDBACK & REVIEWS CAROUSEL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 w-full border-t border-border/40">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-1 text-amber-500">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-amber-500 text-amber-500" />)}
          </div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">What Customers Say</h2>
          <p className="text-xs text-muted-foreground font-semibold">5.0★ Google Rating — 27 Reviews</p>
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
                  <Check className="h-3 w-3 stroke-[2.5]" /> Customer Feedback
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
              
              <div className="flex items-center gap-3">
                {/* Mobile Chevrons */}
                <div className="flex sm:hidden gap-1 pb-[1px]">
                  <button 
                    onClick={handlePrevReview} 
                    className="p-1 rounded-lg bg-muted text-foreground border border-border hover:bg-muted/80 transition-colors"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={handleNextReview} 
                    className="p-1 rounded-lg bg-muted text-foreground border border-border hover:bg-muted/80 transition-colors"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
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
          </div>

          {/* Left/Right Desktop controls */}
          <button
            onClick={handlePrevReview}
            className="hidden sm:flex absolute left-[-50px] top-1/2 -translate-y-1/2 p-2 rounded-full bg-background border border-border shadow-md hover:bg-muted text-foreground transition-colors"
            aria-label="Previous Review"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={handleNextReview}
            className="hidden sm:flex absolute right-[-50px] top-1/2 -translate-y-1/2 p-2 rounded-full bg-background border border-border shadow-md hover:bg-muted text-foreground transition-colors"
            aria-label="Next Review"
          >
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </div>
      </section>

      {/* CUSTOM PHONE MODEL ACCESSORY REQUEST SECTION (FORMSUBMIT) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full border-t border-border/40">
        <div className="glass-card rounded-3xl p-8 sm:p-10 border border-emerald-500/30 bg-emerald-500/5 max-w-4xl mx-auto shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Smartphone className="h-3.5 w-3.5" />
              Instant Stock Request
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Can&apos;t Find Accessories for <span className="text-emerald-500">Your Phone Model?</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Request custom drop-tested cases, 9H tempered screen guards, fast chargers, or batteries for any smartphone model. We will source &amp; stock it for you within 24-48 hours.
            </p>
          </div>

          {/* FormSubmit.co Direct Request Form */}
          <form
            action="https://formsubmit.co/chintanmaheshwari714@gmail.com"
            method="POST"
            className="p-6 rounded-2xl bg-card border border-border space-y-4 shadow-md text-foreground"
          >
            <input type="hidden" name="_subject" value="Homepage Customer Phone Model Accessory Request" />
            <input type="hidden" name="_captcha" value="false" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Phone Brand *</label>
                <input
                  type="text"
                  name="brand"
                  placeholder="e.g. Apple, Samsung, OPPO, OnePlus..."
                  className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Exact Phone Model *</label>
                <input
                  type="text"
                  name="phone_model"
                  placeholder="e.g. iPhone 16 Pro, S24 Ultra, Vivo V30..."
                  className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">WhatsApp / Mobile No. *</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="10-digit mobile number"
                  className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Product / Accessory Needed *</label>
              <input
                type="text"
                name="product_type"
                placeholder="e.g. Shockproof Armor Case, 9H Glass Guard, Fast Wall Charger..."
                className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Submit Accessory Stock Request</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 7. CONTACT FORM & GOOGLE MAPS INTEGRATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-24 sm:pb-16 relative z-10 w-full border-t border-border/40 flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Contact details & Map Embed (5 cols) */}
        <div className="lg:col-span-5 w-full space-y-6">
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
                <a href="mailto:enigcononline@gmail.com" className="hover:text-foreground transition-colors mt-0.5 block">enigcononline@gmail.com</a>
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
        <div className="lg:col-span-7 w-full">
          <div className="glass-card rounded-3xl p-5 sm:p-8 border border-border shadow-lg">
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
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 font-medium"
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
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 font-medium"
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
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 font-medium"
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
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Select Issue <span className="text-red-500">*</span></label>
                    <select
                      required
                      value={contactIssue}
                      onChange={(e) => setContactIssue(e.target.value)}
                      className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 font-medium"
                    >
                      <option value="" className="bg-card text-foreground">Choose issue...</option>
                      <option value="broken_screen" className="bg-card text-foreground">Broken Screen Replacement</option>
                      <option value="battery" className="bg-card text-foreground">Battery Drainage / Replacement</option>
                      <option value="charging" className="bg-card text-foreground">Charging / Port Issue</option>
                      <option value="sound" className="bg-card text-foreground">Speaker / Sound static</option>
                      <option value="diagnostics" className="bg-card text-foreground">Unknown Hardware Fault</option>
                      <option value="others" className="bg-card text-foreground">Others</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Message</label>
                    <textarea
                      rows={3}
                      placeholder="Add details about your issue..."
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingContact}
                    className="w-full py-3.5 bg-foreground text-background font-extrabold rounded-xl text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-md"
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
          <p className="text-xs text-muted-foreground">Get quick answers regarding services, locations, and device repairs.</p>
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

      {/* Dynamic Welcome Login/Signup Popup Modal */}
      <AnimatePresence>
        {showAuthPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.4, type: "spring" }}
              className="glass-card max-w-md w-full rounded-3xl p-6 sm:p-8 border border-cyan-500/20 bg-card/90 shadow-2xl relative space-y-6 text-center"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowAuthPopup(false);
                  sessionStorage.setItem("sc_auth_popup_dismissed", "true");
                }}
                className="absolute top-4 right-4 text-xs font-bold text-muted-foreground hover:text-foreground p-2 rounded-xl transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>

              <div className="h-16 w-16 bg-white border border-border/60 rounded-2xl p-2 flex items-center justify-center mx-auto shadow-md">
                <img
                  src="/logo.png"
                  alt="Smart Care Logo"
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Welcome to Smart Care</h2>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  Log in or sign up to schedule doorstep phone pickups, use AI diagnostics helper, and browse premium products inside Gurugram.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <Link
                  href="/login"
                  className="flex w-full justify-center py-3.5 rounded-2xl bg-cyan-500 text-black font-extrabold text-xs uppercase tracking-wider hover:bg-cyan-400 active:scale-[0.99] transition-all shadow-md shadow-cyan-500/10"
                >
                  Log In / Create Account
                </Link>
                <button
                  onClick={() => {
                    setShowAuthPopup(false);
                    sessionStorage.setItem("sc_auth_popup_dismissed", "true");
                  }}
                  className="flex w-full justify-center py-3.5 rounded-2xl border border-border bg-card hover:bg-muted text-foreground font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Continue as Guest
                </button>
              </div>

              <div className="text-[10px] text-muted-foreground/80 flex items-center justify-center gap-1.5 pt-1 border-t border-border/40 font-medium">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Your info is safe, welcome!</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

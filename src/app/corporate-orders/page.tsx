"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, 
  Gift, 
  Award, 
  Users, 
  GraduationCap, 
  Store, 
  Rocket, 
  PackageCheck, 
  Zap, 
  ShieldCheck, 
  Truck, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  PhoneCall, 
  MessageSquare, 
  HelpCircle, 
  Sparkles, 
  Check, 
  AlertCircle,
  Smartphone,
  BatteryCharging,
  Headphones,
  Shield,
  Layers,
  ShoppingBag
} from "lucide-react";
import { MOCK_ACCESSORIES } from "@/lib/accessories";
import { formatINR } from "@/lib/utils";
import { createB2BInquiry, B2BInquiryData } from "@/lib/appwrite";

export default function CorporateOrdersPage() {
  // Form states
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [productCategory, setProductCategory] = useState("Mobile Chargers");
  const [quantity, setQuantity] = useState("100");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [expectedPurchaseDate, setExpectedPurchaseDate] = useState("");
  const [requirements, setRequirements] = useState("");

  // Status & Error states
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedInquiry, setSubmittedInquiry] = useState<B2BInquiryData | null>(null);

  // Set document title dynamically
  useEffect(() => {
    document.title = "Corporate & Bulk Mobile Accessories | Smart Care & Mobile Point";
  }, []);

  // Validation function
  const validateForm = (): boolean => {
    if (!name.trim()) {
      setErrorMsg("Please enter your full name.");
      return false;
    }
    if (!companyName.trim()) {
      setErrorMsg("Please enter your company or business name.");
      return false;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg("Please enter a valid work email address.");
      return false;
    }
    if (!phone.trim() || phone.replace(/[^0-9]/g, "").length < 10) {
      setErrorMsg("Please enter a valid 10-digit phone number.");
      return false;
    }
    if (!quantity || Number(quantity) <= 0) {
      setErrorMsg("Please enter a valid required quantity greater than 0.");
      return false;
    }
    if (!deliveryLocation.trim()) {
      setErrorMsg("Please enter your delivery city or location pin code.");
      return false;
    }

    setErrorMsg(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const result = await createB2BInquiry({
        name: name.trim(),
        companyName: companyName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        product: productCategory,
        quantity: Number(quantity),
        deliveryLocation: deliveryLocation.trim(),
        expectedPurchaseDate: expectedPurchaseDate || undefined,
        requirements: requirements.trim() || undefined,
      });

      setSubmittedInquiry(result);
    } catch (err: any) {
      console.error("B2B Submission error:", err);
      setErrorMsg(err?.message || "Failed to send inquiry. Please try again or chat with us on WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToForm = (category?: string) => {
    if (category) {
      setProductCategory(category);
    }
    const formElement = document.getElementById("bulk-inquiry-form");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  // 8 Target Personas Cards
  const targetPersonas = [
    {
      title: "Corporate Offices",
      icon: Building2,
      desc: "Custom tech gadgets, fast chargers, & desk accessories for employee workspaces.",
      color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5",
    },
    {
      title: "Employee Welcome Kits",
      icon: Gift,
      desc: "Branded chargers, durable cables, & premium phone stands for onboarding kits.",
      color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    },
    {
      title: "Corporate Gifting",
      icon: Award,
      desc: "High-capacity power banks & wireless earbuds for client & festive rewards.",
      color: "text-amber-400 border-amber-500/20 bg-amber-500/5",
    },
    {
      title: "Events & Conferences",
      icon: Users,
      desc: "Event giveaway power banks, custom lanyard cables, & branded accessories.",
      color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5",
    },
    {
      title: "Schools & Colleges",
      icon: GraduationCap,
      desc: "Bulk tablet covers, tempered glass guards, & multi-device charging hubs.",
      color: "text-purple-400 border-purple-500/20 bg-purple-500/5",
    },
    {
      title: "Retailers & Resellers",
      icon: Store,
      desc: "Wholesale mobile accessories with high profit margins & fast regional fulfillment.",
      color: "text-rose-400 border-rose-500/20 bg-rose-500/5",
    },
    {
      title: "Startups & Small Businesses",
      icon: Rocket,
      desc: "Flexible order quantities without rigid minimum order quantity constraints.",
      color: "text-blue-400 border-blue-500/20 bg-blue-500/5",
    },
    {
      title: "Bulk Procurement",
      icon: PackageCheck,
      desc: "GST invoices, institutional billing, & dedicated B2B account support.",
      color: "text-teal-400 border-teal-500/20 bg-teal-500/5",
    },
  ];

  // Bulk Product Categories
  const bulkCategories = [
    { name: "Mobile Chargers", icon: Zap, sampleCount: 15, startingPrice: "₹149", desc: "PD Fast Chargers, GaN Adapters, & Multi-port Wall Plugs" },
    { name: "USB & Type-C Cables", icon: Layers, sampleCount: 20, startingPrice: "₹99", desc: "Braid-shielded Type-C, Lightning, & 100W PD Cables" },
    { name: "Power Banks", icon: BatteryCharging, sampleCount: 12, startingPrice: "₹699", desc: "10,000mAh to 30,000mAh Heavy Duty Power Packs" },
    { name: "Mobile Covers", icon: Smartphone, sampleCount: 45, startingPrice: "₹99", desc: "Armor Shockproof, Clear Crystal, & Vegan Leather Cases" },
    { name: "Screen Protectors", icon: Shield, sampleCount: 30, startingPrice: "₹79", desc: "9H Hardness Tempered Glass & Privacy Screen Guards" },
    { name: "Earphones & Headphones", icon: Headphones, sampleCount: 18, startingPrice: "₹299", desc: "TWS Earbuds, Neckbands, & Noise-Cancelling Headsets" },
    { name: "Mobile Accessories", icon: ShoppingBag, sampleCount: 25, startingPrice: "₹49", desc: "Car Mounts, Desk Stands, Cleaning Kits & OTG Hubs" },
    { name: "Other Electronics", icon: Sparkles, sampleCount: 10, startingPrice: "₹199", desc: "Smartwatches, Bluetooth Speakers & Desk Tech" },
  ];

  // Key Value Proposition Benefits
  const benefits = [
    { title: "Competitive Bulk Pricing", desc: "Tiered wholesale discounts that scale with your order volume.", icon: Zap },
    { title: "100% GST Compliant Invoices", desc: "Input tax credit (ITC) claims with complete business GST billing.", icon: FileText },
    { title: "Flexible Order Quantities", desc: "No rigid minimums—order from 25 units up to 10,000+ units.", icon: PackageCheck },
    { title: "Express Regional Delivery", desc: "Same-day doorstep delivery inside Gurugram & fast shipping across India.", icon: Truck },
    { title: "Tested & Certified Quality", desc: "Tested accessories with manufacturer warranty & instant replacement support.", icon: ShieldCheck },
    { title: "Dedicated B2B Account Manager", desc: "Direct single-point support for custom quotes & purchase orders.", icon: PhoneCall },
  ];

  return (
    <div className="flex-grow bg-background text-foreground space-y-16 py-8">
      
      {/* 2. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4 relative overflow-hidden">
        {/* Background Decorative Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-purple-500/15 via-indigo-500/10 to-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-6 relative z-10 max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-sm">
            <Building2 className="h-4 w-4" />
            Official B2B & Corporate Procurement Portal
          </span>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.15]">
            Bulk & Corporate Orders <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Made Simple
            </span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Get competitive pricing on mobile accessories and electronics for your business, employees, events and bulk requirements.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
            <button
              onClick={() => scrollToForm()}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 text-white font-black text-xs uppercase tracking-wider hover:opacity-95 shadow-xl shadow-purple-500/20 active:scale-[0.99] transition-all flex items-center gap-2"
            >
              <span>Request a Bulk Quote</span>
              <ArrowRight className="h-4 w-4 stroke-[3]" />
            </button>

            <Link
              href="/accessories"
              className="px-8 py-4 rounded-2xl border border-border bg-card/80 hover:bg-muted text-foreground font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              View Products
            </Link>
          </div>

          {/* Quick Metrics Badge */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-border/40 max-w-3xl mx-auto text-left">
            <div className="p-3.5 rounded-2xl bg-card/50 border border-border/40">
              <p className="text-xl font-black text-foreground">500+ Businesses</p>
              <p className="text-[10px] text-muted-foreground font-semibold">Trusted in NCR & Gurugram</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-card/50 border border-border/40">
              <p className="text-xl font-black text-foreground">Up to 45% Off</p>
              <p className="text-[10px] text-muted-foreground font-semibold">Wholesale Bulk Discounts</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-card/50 border border-border/40">
              <p className="text-xl font-black text-foreground">100% GST Invoice</p>
              <p className="text-[10px] text-muted-foreground font-semibold">Full Tax Credit Claim</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-card/50 border border-border/40">
              <p className="text-xl font-black text-foreground">Fast Dispatch</p>
              <p className="text-[10px] text-muted-foreground font-semibold">Doorstep Corporate Delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHO WE SERVE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
            Tailored B2B Solutions
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Built for Businesses of Every Size
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
            Whether you need 50 employee kits or 5,000 event accessories, we provide custom quotes suited to your exact organizational needs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {targetPersonas.map((item, idx) => (
            <div
              key={idx}
              className={`glass-card rounded-3xl p-5 border ${item.color} shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4 group`}
            >
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-2xl bg-card border border-border/60 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="font-extrabold text-sm text-foreground tracking-tight">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>

              <button
                onClick={() => scrollToForm()}
                className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors pt-2"
              >
                <span>Request Quote</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 4. BULK PRODUCTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            Genuine Catalog
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            What Can You Order in Bulk?
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
            Choose from our extensive stock of genuine accessories, wall chargers, drop-tested cases, and high-speed cables.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {bulkCategories.map((cat, idx) => (
            <div
              key={idx}
              className="glass-card rounded-3xl p-6 border border-border bg-card/60 hover:bg-card hover:border-cyan-500/30 transition-all duration-300 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                    <cat.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-extrabold text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded-md">
                    From {cat.startingPrice}/unit
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-foreground">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{cat.desc}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground font-semibold">Bulk MOQ: 25 Units</span>
                <button
                  onClick={() => scrollToForm(cat.name)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-black font-bold text-xs transition-all border border-cyan-500/20"
                >
                  Request Pricing
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. WHY BUY FROM US SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-border bg-gradient-to-br from-purple-950/20 via-background to-cyan-950/20 shadow-2xl space-y-10 relative overflow-hidden">
          <div className="text-center space-y-3 max-w-2xl mx-auto relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              The Smart Care B2B Advantage
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
              Why Choose Smart Care & Mobile Point?
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              We combine physical store reliability in Gurugram with fast B2B fulfillment and transparent wholesale rates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {benefits.map((b, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-card/60 border border-border/60 space-y-2.5 shadow-xs">
                <div className="h-8 w-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <b.icon className="h-4 w-4" />
                </div>
                <h3 className="font-extrabold text-sm text-foreground">{b.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. BULK INQUIRY FORM & SUCCESS CARD SECTION */}
      <section id="bulk-inquiry-form" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        {submittedInquiry ? (
          /* 9. SUCCESS MESSAGE CARD */
          <div className="glass-card rounded-3xl p-8 sm:p-12 border border-emerald-500/30 bg-emerald-500/5 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="h-16 w-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30 shadow-md">
              <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Inquiry Received Successfully!
              </h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                Thank you, <strong className="text-foreground">{submittedInquiry.name}</strong>! Your bulk order inquiry for <strong className="text-emerald-400">{submittedInquiry.companyName}</strong> has been saved in our system. Our B2B account team will contact you shortly with custom pricing.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border text-left max-w-md mx-auto space-y-2 text-xs">
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Inquiry ID:</span>
                <span className="font-mono font-bold text-foreground">{submittedInquiry.$id || "B2B-" + Date.now()}</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Category / Product:</span>
                <span className="font-bold text-foreground">{submittedInquiry.product}</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Quantity:</span>
                <span className="font-bold text-foreground">{submittedInquiry.quantity} Units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-bold text-foreground">{submittedInquiry.deliveryLocation}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/accessories"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-card border border-border hover:bg-muted text-foreground font-bold text-xs uppercase tracking-wider transition-colors text-center"
              >
                Back to Shopping
              </Link>
              
              <a
                href={`https://wa.me/919289942313?text=${encodeURIComponent(
                  `Hi Smart Care B2B Team, I submitted a bulk order inquiry for ${submittedInquiry.companyName} (${submittedInquiry.quantity} units of ${submittedInquiry.product}). Please share the quote.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-500 text-black font-extrabold text-xs uppercase tracking-wider hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        ) : (
          /* BULK INQUIRY FORM */
          <div className="glass-card rounded-3xl p-6 sm:p-10 border border-purple-500/30 bg-card/80 shadow-2xl space-y-8">
            <div className="text-center space-y-2 border-b border-border pb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                Direct B2B Pricing Request
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Request a Bulk Quote
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Fill out your requirement below to receive custom wholesale pricing within 2 business hours.
              </p>
            </div>

            {errorMsg && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>Full Name <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-muted/60 border border-border rounded-xl px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  />
                </div>

                {/* Company Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Company / Organization Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Technologies Pvt Ltd"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-muted/60 border border-border rounded-xl px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  />
                </div>

                {/* Work Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Work Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rahul@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-muted/60 border border-border rounded-xl px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Phone / WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-muted/60 border border-border rounded-xl px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  />
                </div>

                {/* Product / Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Product / Category Required <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    className="w-full bg-muted/60 border border-border rounded-xl px-4 py-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  >
                    <option value="Mobile Chargers">Mobile Chargers & Wall Adapters</option>
                    <option value="USB & Type-C Cables">USB & Type-C Cables</option>
                    <option value="Power Banks">Power Banks (10k - 30k mAh)</option>
                    <option value="Mobile Covers">Mobile Covers & Protective Cases</option>
                    <option value="Screen Protectors">Screen Protectors & Tempered Glass</option>
                    <option value="Earphones & Headphones">Earphones, TWS Earbuds & Headphones</option>
                    <option value="Mobile Accessories">Mobile Accessories & Desk Stands</option>
                    <option value="Other Electronics">Other Consumer Electronics</option>
                  </select>
                </div>

                {/* Quantity Required */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Quantity Required <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 100"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-muted/60 border border-border rounded-xl px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  />
                </div>

                {/* Delivery Location */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Delivery Location / Pin Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gurugram - 122001, Haryana"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    className="w-full bg-muted/60 border border-border rounded-xl px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  />
                </div>

                {/* Expected Purchase Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Expected Purchase Date
                  </label>
                  <input
                    type="date"
                    value={expectedPurchaseDate}
                    onChange={(e) => setExpectedPurchaseDate(e.target.value)}
                    className="w-full bg-muted/60 border border-border rounded-xl px-4 py-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  />
                </div>
              </div>

              {/* Additional Requirements */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Additional Requirements / Specific Branding Details
                </label>
                <textarea
                  rows={3}
                  placeholder="Mention any custom logo printing, specific phone model compatibility, target budget, or delivery timelines..."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  className="w-full bg-muted/60 border border-border rounded-xl p-4 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 text-white font-black text-xs uppercase tracking-wider hover:opacity-95 shadow-xl shadow-purple-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Inquiry to Appwrite...</span>
                  </>
                ) : (
                  <>
                    <PackageCheck className="h-4 w-4" />
                    <span>Submit Bulk Inquiry</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Your information is encrypted & used exclusively for providing custom B2B quotes.</span>
              </p>
            </form>
          </div>
        )}
      </section>

    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { X, Send, Smartphone, CheckCircle2, MessageSquare, AlertCircle, Sparkles } from "lucide-react";
import phoneData from "@/data/phoneModels.json";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

interface ProductRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBrand?: string;
  initialModel?: string;
  initialProductType?: string;
}

const PRODUCT_TYPES = [
  "Shockproof Protective Case",
  "9H Tempered Glass Screen Guard",
  "MagSafe / Clear Case",
  "Camera Lens Guard",
  "Fast Wall Charger (Adapter)",
  "Type-C / Lightning Cable",
  "Phone Battery Replacement",
  "Leather / Premium Flip Cover",
  "Other Accessory"
];

export default function ProductRequestModal({
  isOpen,
  onClose,
  initialBrand = "",
  initialModel = "",
  initialProductType = ""
}: ProductRequestModalProps) {
  const [brand, setBrand] = useState(initialBrand || "Apple");
  const [phoneModel, setPhoneModel] = useState(initialModel || "");
  const [productType, setProductType] = useState(initialProductType || PRODUCT_TYPES[0]);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Sync initial values when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialBrand) setBrand(initialBrand);
      if (initialModel) setPhoneModel(initialModel);
      if (initialProductType) setProductType(initialProductType);
      setIsSubmitted(false);
      setErrorMsg("");
    }
  }, [isOpen, initialBrand, initialModel, initialProductType]);

  const brandsList = phoneData.brands || ["Apple", "Samsung", "OnePlus", "Xiaomi", "Vivo", "Oppo", "Realme", "Google"];
  const brandModelsMap = (phoneData.brandModels as Record<string, Array<{ id: string; name: string }>>) || {};
  const availableModelsForBrand = brandModelsMap[brand] || [];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneModel.trim()) {
      setErrorMsg("Please enter or select your phone model.");
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setErrorMsg("Please enter a valid 10-digit phone/WhatsApp number.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const requestData = {
      id: `REQ-${Date.now()}`,
      brand,
      phone_model: phoneModel.trim(),
      product_type: productType,
      customer_name: customerName.trim() || "Customer",
      phone: phone.trim(),
      email: email.trim(),
      notes: notes.trim(),
      status: "pending",
      created_at: new Date().toISOString()
    };

    try {
      // 1. Save to LocalStorage
      if (typeof window !== "undefined") {
        const existing = JSON.parse(localStorage.getItem("sc_product_requests") || "[]");
        localStorage.setItem("sc_product_requests", JSON.stringify([requestData, ...existing]));
      }

      // 2. Insert into Supabase if configured
      if (isSupabaseConfigured()) {
        try {
          await supabase.from("product_requests").insert([
            {
              brand: requestData.brand,
              phone_model: requestData.phone_model,
              product_type: requestData.product_type,
              customer_name: requestData.customer_name,
              phone: requestData.phone,
              email: requestData.email,
              notes: requestData.notes,
              status: "pending"
            }
          ]);
        } catch (dbErr) {
          console.warn("Supabase insert for product_request skipped or table absent:", dbErr);
        }
      }

      // 3. Trigger FormSubmit.co Submission & Email Notification
      try {
        const formData = new FormData();
        formData.append("name", requestData.customer_name);
        formData.append("phone", requestData.phone);
        formData.append("email", requestData.email || "customer@smartcaremobile.in");
        formData.append("brand", requestData.brand);
        formData.append("phone_model", requestData.phone_model);
        formData.append("product_type", requestData.product_type);
        formData.append("notes", requestData.notes);
        formData.append("_subject", `Product Request: ${requestData.brand} ${requestData.phone_model}`);
        formData.append("_captcha", "false");

        await fetch("https://formsubmit.co/ajax/chintanmaheshwari714@gmail.com", {
          method: "POST",
          body: formData
        });
      } catch (fsErr) {
        console.warn("FormSubmit POST error:", fsErr);
      }

      try {
        await fetch("/api/v1/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "product_request",
            to: email || "enigcononline@gmail.com",
            payload: requestData
          })
        });
      } catch (emailErr) {
        console.warn("Product request email trigger error:", emailErr);
      }

      setIsSubmitted(true);
    } catch (err: any) {
      console.error("Failed to submit product request:", err);
      setErrorMsg(err.message || "Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setIsSubmitted(false);
    setErrorMsg("");
    onClose();
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Smart Care! I submitted a request for ${brand} ${phoneModel} (${productType}). Please let me know when it's in stock.`
  );

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[90dvh] overflow-y-auto bg-card border border-border rounded-3xl p-4 sm:p-7 shadow-2xl space-y-4 sm:space-y-5 relative text-foreground my-auto scrollbar-none">
        
        {isSubmitted ? (
          <div className="text-center space-y-5 py-4 animate-in zoom-in-95 duration-300">
            <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-foreground">Request Received!</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Thank you, <span className="font-bold text-foreground">{customerName || "Customer"}</span>! We have logged your request for{" "}
                <span className="font-bold text-emerald-500">{brand} {phoneModel}</span> ({productType}).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border text-xs text-muted-foreground space-y-2 text-left">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                What happens next?
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Our procurement team in Gurugram will source stock for your phone model.</li>
                <li>We will contact you on <span className="font-bold text-foreground">{phone}</span> via WhatsApp/SMS as soon as it arrives.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={`https://wa.me/919289942313?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <MessageSquare className="h-4 w-4" />
                Chat on WhatsApp Now
              </a>
              <button
                onClick={resetAndClose}
                className="py-3 px-5 rounded-xl bg-muted hover:bg-border text-foreground font-bold text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header & Close Button */}
            <div className="flex justify-between items-start gap-2">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <Smartphone className="h-3.5 w-3.5" />
                  Instant Accessory Request
                </span>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                  Request Product for <span className="text-emerald-500">Your Phone</span>
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Can&apos;t find an accessory for your specific phone model? Fill out this quick form and we&apos;ll stock it for you within 24-48 hours.
                </p>
              </div>
              <button
                onClick={resetAndClose}
                className="p-2 rounded-full bg-muted hover:bg-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0 mt-0.5"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Brand & Phone Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Phone Brand *</label>
                  <select
                    value={brand}
                    onChange={(e) => {
                      setBrand(e.target.value);
                      setPhoneModel("");
                    }}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-base sm:text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {brandsList.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                    <option value="Other">Other Brand</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Exact Phone Model *</label>
                  <input
                    type="text"
                    placeholder="e.g. iPhone 16 Pro, S24 Ultra..."
                    value={phoneModel}
                    onChange={(e) => setPhoneModel(e.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-base sm:text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Product Type */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Type of Product Required *</label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-base sm:text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {PRODUCT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    autoCapitalize="words"
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-base sm:text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">WhatsApp / Mobile No. *</label>
                  <input
                    type="tel"
                    inputMode="tel"
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-base sm:text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Email (Optional) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address (Optional)</label>
                <input
                  type="email"
                  inputMode="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-base sm:text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Special Requests / Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Preferences / Color / Details</label>
                <textarea
                  placeholder="e.g. Matte black case with MagSafe magnet, or Privacy tempered glass..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-base sm:text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Submitting Request...</span>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Product Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

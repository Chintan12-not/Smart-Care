"use client";

import React, { useState, useEffect } from "react";
import { 
  Truck, 
  MapPin, 
  Phone, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  User, 
  Smartphone, 
  Wrench, 
  AlertCircle,
  HelpCircle,
  Check
} from "lucide-react";
import confetti from "canvas-confetti";
import { formatINR, calculatePickupCharge } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function PickupPage() {
  // Form fields
  const [customerName, setCustomerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [alternateNumber, setAlternateNumber] = useState("");
  const [deviceBrand, setDeviceBrand] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [landmark, setLandmark] = useState("");

  // Distance / Pricing state
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [pickupCharge, setPickupCharge] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcError, setCalcError] = useState("");

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submissionData, setSubmissionData] = useState<any>(null);

  // Auto-calculate distance on address blur (or after typing delays)
  const handleAddressBlur = async () => {
    if (!pickupAddress.trim()) return;
    
    setIsCalculating(true);
    setCalcError("");
    
    try {
      const res = await fetch("/api/v1/distance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: pickupAddress })
      });
      
      const data = await res.json();
      if (data.success) {
        setDistanceKm(data.distanceKm);
        setPickupCharge(data.charge);
      } else {
        setCalcError("Could not calculate precise distance. We will estimate it manually.");
        // Fallback to default
        setDistanceKm(6.0);
        setPickupCharge(calculatePickupCharge(6.0));
      }
    } catch (e) {
      console.error(e);
      setCalcError("Network error. Standard charge applied.");
      // Fallback
      setDistanceKm(6.0);
      setPickupCharge(calculatePickupCharge(6.0));
    } finally {
      setIsCalculating(false);
    }
  };

  // Automatic location checker using browser geolocation API
  const handleAutoDetectLocation = () => {
    if (!navigator.geolocation) {
      setCalcError("Geolocation is not supported by your browser.");
      return;
    }

    setIsCalculating(true);
    setCalcError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch("/api/v1/distance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat: latitude, lng: longitude })
          });
          const data = await res.json();
          if (data.success) {
            setDistanceKm(data.distanceKm);
            setPickupCharge(data.charge);
            if (data.address) {
              setPickupAddress(data.address);
            }
          } else {
            setCalcError("Could not calculate precise coordinates distance.");
          }
        } catch (err) {
          console.error(err);
          setCalcError("Network error calculating GPS distance.");
        } finally {
          setIsCalculating(false);
        }
      },
      (error) => {
        console.error(error);
        setCalcError("Permission to access location was denied or timed out.");
        setIsCalculating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !mobileNumber || !deviceBrand || !deviceModel || !pickupAddress || !preferredDate || !preferredTime) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API request to backend/email portal
    setTimeout(() => {
      const payload = {
        customerName,
        mobileNumber,
        alternateNumber,
        deviceBrand,
        deviceModel,
        problemDescription,
        pickupAddress,
        preferredDate,
        preferredTime,
        landmark,
        distanceKm: distanceKm || "TBD",
        pickupCharge: pickupCharge !== null ? pickupCharge : calculatePickupCharge(distanceKm || 6.0),
        submittedAt: new Date().toISOString()
      };

      console.log("Submitting booking request to enigcon2020@gmail.com:", payload);
      setSubmissionData(payload);
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Celebrate
      confetti({
        particleCount: 120,
        spread: 80,
        colors: ["#10b981", "#06b6d4", "#f59e0b"]
      });
    }, 1500);
  };

  const handleReset = () => {
    setCustomerName("");
    setMobileNumber("");
    setAlternateNumber("");
    setDeviceBrand("");
    setDeviceModel("");
    setProblemDescription("");
    setPickupAddress("");
    setPreferredDate("");
    setPreferredTime("");
    setLandmark("");
    setDistanceKm(null);
    setPickupCharge(null);
    setIsSuccess(false);
    setSubmissionData(null);
  };

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold uppercase tracking-wider">
          <Truck className="h-4 w-4" />
          <span>Professional Logistics Portal</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          Free Pickup & Drop Service
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Gurugram&apos;s leading hassle-free smartphone repair pick-and-drop service. We collect from your doorstep, repair using genuine spares, test for quality assurance, and deliver safely back to you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Pricing & Process (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Pickup & Drop Pricing Card */}
          <div className="glass-card rounded-3xl p-6 border border-emerald-500/20 bg-emerald-500/[0.01] relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            <h3 className="font-bold text-lg text-foreground flex items-center gap-2 mb-4">
              <Truck className="h-5 w-5 text-emerald-500" />
              Pickup & Drop Charges
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border/40">
                <span className="text-sm text-foreground font-medium">Within 5 km radius</span>
                <span className="text-base font-extrabold text-emerald-500 uppercase">Free</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/40">
                <span className="text-sm text-foreground font-medium">5 km to 10 km</span>
                <span className="text-base font-extrabold text-amber-500">₹120</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/40">
                <span className="text-sm text-foreground font-medium">10 km to 15 km</span>
                <span className="text-base font-extrabold text-amber-500">₹200</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/40">
                <span className="text-sm text-foreground font-medium">Beyond 15 km</span>
                <span className="text-base font-extrabold text-amber-500">₹300</span>
              </div>
              
              <div className="text-[11px] text-muted-foreground/80 leading-relaxed bg-muted/30 rounded-xl p-3 border border-border/40 space-y-1.5">
                <p className="font-semibold text-foreground flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5 text-emerald-500" />
                  Pricing Note
                </p>
                <p>• Charges cover the secure double-trip logistics of your device.</p>
                <p>• The actual mobile component/labor repair cost is separate.</p>
              </div>
            </div>
          </div>

          {/* How it Works / Timeline */}
          <div className="glass-card rounded-3xl p-6 border border-border space-y-6 shadow-sm">
            <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Our Logistics Process</h3>
            
            <div className="space-y-6 relative pl-6 border-l border-border ml-3">
              <div className="relative">
                <span className="absolute -left-[33px] top-0 h-5 w-5 rounded-full bg-cyan-500 text-black flex items-center justify-center font-bold text-[10px] shadow-sm">1</span>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Step 1: Doorstep Pickup</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Our agent visits your address, runs visual diagnostic verification, and bags your device safely.</p>
                </div>
              </div>
              
              <div className="relative">
                <span className="absolute -left-[33px] top-0 h-5 w-5 rounded-full bg-cyan-500 text-black flex items-center justify-center font-bold text-[10px] shadow-sm">2</span>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Step 2: Workshop Repairs</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Expert technicians disassemble and replace damaged components using premium quality original spares.</p>
                </div>
              </div>
              
              <div className="relative">
                <span className="absolute -left-[33px] top-0 h-5 w-5 rounded-full bg-cyan-500 text-black flex items-center justify-center font-bold text-[10px] shadow-sm">3</span>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Step 3: Quality Check & Pack</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">We perform 21-point software & hardware quality checks and pack the device in anti-static tamper-proof bubble packs.</p>
                </div>
              </div>
              
              <div className="relative">
                <span className="absolute -left-[33px] top-0 h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] shadow-sm">✓</span>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Step 4: Secure Delivery</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Returned safely to your location. Check and test your mobile, and pay via UPI, cash, or card.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Booking Form (7 cols) */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="booking-form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="glass-card rounded-3xl p-8 border border-border shadow-xl space-y-6"
              >
                <div className="border-b border-border/60 pb-4">
                  <h2 className="text-xl font-bold text-foreground">Book Your Doorstep Pickup</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Enter details below. Charges calculate automatically based on your address location.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Customer Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-cyan-500" />
                        Customer Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>

                    {/* Mobile Number */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-cyan-500" />
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 XXXXX XXXXX"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Alternate Number */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground">Alternate Number</label>
                      <input
                        type="tel"
                        placeholder="Alternative contact info"
                        value={alternateNumber}
                        onChange={(e) => setAlternateNumber(e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>

                    {/* Device Brand */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                        <Smartphone className="h-3.5 w-3.5 text-cyan-500" />
                        Device Brand <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Apple, Samsung, OnePlus"
                        value={deviceBrand}
                        onChange={(e) => setDeviceBrand(e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Device Model */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground">Device Model <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. iPhone 15 Pro, Galaxy S24"
                        value={deviceModel}
                        onChange={(e) => setDeviceModel(e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>

                    {/* Landmark */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground">Landmark</label>
                      <input
                        type="text"
                        placeholder="e.g. Near HDFC Bank, Sector 37"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                  </div>

                  {/* Pickup Address & Live Distance Check */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-cyan-500" />
                        Pickup Address <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleAutoDetectLocation}
                        className="text-[10px] text-cyan-500 hover:text-cyan-400 font-bold flex items-center gap-1 transition-colors select-none"
                      >
                        📍 Auto-Detect Location
                      </button>
                    </div>
                    <textarea
                      required
                      rows={2}
                      placeholder="Enter full address details (flat, residency, sector, city) or auto-detect"
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      onBlur={handleAddressBlur}
                      className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 min-h-[60px]"
                    />
                    
                    {/* Live distance status display */}
                    <div className="mt-1">
                      {isCalculating && (
                        <p className="text-[10px] text-cyan-500 flex items-center gap-1 animate-pulse">
                          <span className="h-2.5 w-2.5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                          Calculating distance & applicable charge...
                        </p>
                      )}
                      
                      {!isCalculating && distanceKm !== null && pickupCharge !== null && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3.5 rounded-2xl bg-muted/80 border border-border flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Distance calculated</span>
                            <span className="text-foreground font-semibold">{distanceKm} km from our Sector 37C store</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Pickup & Drop Fee</span>
                            <strong className="text-sm font-black text-emerald-500">{pickupCharge === 0 ? "FREE" : formatINR(pickupCharge)}</strong>
                          </div>
                        </motion.div>
                      )}

                      {calcError && (
                        <p className="text-[10px] text-amber-500 flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {calcError}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Preferred Date */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-cyan-500" />
                        Preferred Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>

                    {/* Preferred Time */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-cyan-500" />
                        Preferred Time <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      >
                        <option value="">Select slot...</option>
                        <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                        <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM</option>
                        <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                        <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                        <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM</option>
                      </select>
                    </div>
                  </div>

                  {/* Problem Description */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                      <Wrench className="h-3.5 w-3.5 text-cyan-500" />
                      Problem Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe what is wrong with your phone (e.g. glass shattered, not turning on, battery draining)..."
                      value={problemDescription}
                      onChange={(e) => setProblemDescription(e.target.value)}
                      className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>

                  {/* Booking submit button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-foreground text-background font-bold rounded-2xl text-xs uppercase tracking-wider hover:opacity-90 shadow-md flex items-center justify-center gap-2 select-none active:scale-[0.99] transition-transform"
                  >
                    {isSubmitting ? (
                      <span className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Truck className="h-4 w-4" />
                        Confirm Booking {pickupCharge !== null ? (pickupCharge === 0 ? "(FREE)" : `(${formatINR(pickupCharge)})`) : ""}
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success-screen"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, type: "spring" }}
                className="glass-card rounded-3xl p-8 border border-emerald-500/20 bg-emerald-500/[0.02] text-center space-y-6 shadow-2xl"
              >
                <div className="h-16 w-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                  <Check className="h-8 w-8 stroke-[3]" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-extrabold text-foreground">Pickup Booked Successfully!</h2>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    We have received your pickup booking request. Details have been logged for our Sector 37C dispatch center, and a copy has been sent to <span className="font-semibold text-foreground">enigcon2020@gmail.com</span>.
                  </p>
                </div>

                {submissionData && (
                  <div className="bg-card border border-border rounded-2xl p-5 text-left max-w-md mx-auto space-y-3.5 text-[11px]">
                    <div className="flex justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">Booking ID</span>
                      <strong className="text-foreground">PKP-{Math.floor(100000 + Math.random() * 900000)}</strong>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">Customer Name</span>
                      <span className="text-foreground font-semibold">{submissionData.customerName}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">Device Model</span>
                      <span className="text-foreground font-semibold">{submissionData.deviceBrand} {submissionData.deviceModel}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">Pickup Schedule</span>
                      <span className="text-foreground font-semibold">{submissionData.preferredDate} at {submissionData.preferredTime}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">Distance / Cost</span>
                      <span className="text-foreground font-semibold">
                        {submissionData.distanceKm} km ({submissionData.pickupCharge === 0 ? "FREE" : formatINR(submissionData.pickupCharge)})
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 rounded-2xl bg-muted border border-border text-foreground font-semibold text-xs transition-colors hover:bg-muted/80"
                  >
                    Book Another Pickup
                  </button>
                  <a
                    href="https://wa.me/919289942313?text=Hi%20Smart%20Care%20%26%20Mobile%20Point,%20I%20just%20booked%20a%20doorstep%20pickup%20service."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-2xl bg-emerald-500 text-white font-semibold text-xs transition-colors hover:bg-emerald-400"
                  >
                    Chat on WhatsApp
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}

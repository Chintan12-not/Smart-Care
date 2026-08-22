"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { formatINR } from "@/lib/utils";
import { 
  ShoppingBag, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  CreditCard, 
  Check, 
  ArrowLeft,
  Lock,
  ChevronRight,
  ShieldCheck,
  Truck,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

export default function BillingPage() {
  const router = useRouter();
  const { cart, getCartTotal, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();

  // Contact / Shipping Info
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("Gurugram");
  const [pincode, setPincode] = useState("122001");
  const [paymentMethod, setPaymentMethod] = useState("razorpay"); // razorpay | cod | whatsapp

  // Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState("");

  // Shipping Fee Logic: ₹50 for Gurgaon / Gurugram, ₹120 for everywhere else
  const isGurgaonAddress = () => {
    const c = city.toLowerCase().trim();
    const p = pincode.trim();
    return c.includes("gurgaon") || c.includes("gurugram") || p.startsWith("122");
  };

  const shippingCharge = isGurgaonAddress() ? 50 : 120;
  const subtotal = getCartTotal();
  const grandTotal = subtotal + shippingCharge;

  // Load Razorpay Script dynamically
  useEffect(() => {
    if (typeof window !== "undefined") {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
      return () => {
        try {
          document.body.removeChild(script);
        } catch (e) {}
      };
    }
  }, []);

  // Prefill details if user logged in
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  // Redirect to accessories if cart empty
  useEffect(() => {
    if (cart.length === 0 && !isSuccess && !authLoading) {
      router.push("/accessories");
    }
  }, [cart, isSuccess, authLoading, router]);

  // Execute DB insert + localstorage + order email dispatch
  const finalizeOrder = async (orderId: string, payMethod: string, paymentInfo?: any) => {
    // 1. Write order to Supabase orders and order_items tables if configured
    if (isSupabaseConfigured() && user) {
      try {
        const dbPaymentMethod = payMethod === "cod" ? "cod" : "online";
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        const { data: newOrder, error: orderError } = await supabase
          .from("orders")
          .insert({
            user_id: user.id,
            status: payMethod === "razorpay" ? "paid" : "pending",
            payment_method: dbPaymentMethod,
            total_amount: grandTotal,
            shipping_address: {
              name: fullName,
              phone: phone,
              email: email,
              address: streetAddress,
              city: city,
              pincode: pincode,
              shipping_charge: shippingCharge,
              subtotal: subtotal,
              razorpay_payment_id: paymentInfo?.razorpay_payment_id || null,
              razorpay_order_id: paymentInfo?.razorpay_order_id || null,
            }
          })
          .select()
          .single();

        if (orderError) throw orderError;

        if (newOrder) {
          const itemsPayload = cart.map(item => {
            const isValidUuid = uuidRegex.test(item.id);
            const dbProductId = isValidUuid ? item.id : "00000000-0000-0000-0000-000000000000";
            return {
              order_id: newOrder.id,
              product_id: dbProductId,
              item_type: "accessory",
              quantity: item.quantity,
              price_per_unit: item.price
            };
          });

          const { error: itemsError } = await supabase
            .from("order_items")
            .insert(itemsPayload);
          
          if (itemsError) throw itemsError;
        }
      } catch (dbErr) {
        console.error("Database order insertion failed, completed via localStorage fallback:", dbErr);
      }
    }

    // 2. Localstorage save backup
    const savedOrders = localStorage.getItem("sc_mock_orders");
    let list = savedOrders ? JSON.parse(savedOrders) : [];
    const newMockOrder = {
      id: orderId,
      created_at: new Date().toISOString(),
      status: payMethod === "razorpay" ? "paid" : "pending",
      payment_method: payMethod,
      subtotal: subtotal,
      shipping_charge: shippingCharge,
      total_amount: grandTotal,
      razorpay_payment_id: paymentInfo?.razorpay_payment_id || null,
      shipping_address: {
        name: fullName,
        phone,
        email,
        address: streetAddress,
        city,
        pincode
      },
      items: cart.map(item => ({
        id: `item_${Math.floor(1000 + Math.random() * 9000)}`,
        product_name: item.name,
        product_image: item.image,
        quantity: item.quantity,
        price: item.price
      }))
    };
    list.unshift(newMockOrder);
    localStorage.setItem("sc_mock_orders", JSON.stringify(list));

    // 3. Dispatch Thanking Email Confirmation to Customer + Admin copies (enigcononline@gmail.com & chintanmaheshwari714@gmail.com)
    fetch("/api/v1/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "accessory",
        to: email,
        payload: {
          order_id: orderId,
          subtotal: subtotal,
          shipping_charge: shippingCharge,
          total_amount: grandTotal,
          payment_method: payMethod === "razorpay" ? "Razorpay Online (Paid)" : payMethod,
          razorpay_payment_id: paymentInfo?.razorpay_payment_id || undefined,
          shippingAddress: {
            name: fullName,
            phone,
            email,
            address: streetAddress,
            city,
            pincode
          },
          items: cart.map(item => ({
            product_name: item.name,
            quantity: item.quantity,
            price: item.price
          }))
        }
      })
    }).catch(err => console.error("Accessory purchase email trigger failed:", err));

    // Celebrate
    confetti({
      particleCount: 150,
      spread: 90,
      colors: ["#06b6d4", "#10b981", "#fbbf24"]
    });

    setCreatedOrderId(orderId);
    clearCart();
    setIsSuccess(true);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !email || !streetAddress || !city || !pincode) {
      alert("Please fill in all delivery details.");
      return;
    }

    // 1. Validate 10-Digit Mobile Number
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      alert("Mobile number must be exactly 10 digits (e.g. 9876543210).");
      return;
    }

    // 2. Validate Email Format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      alert("Please enter a valid email address (e.g. name@example.com).");
      return;
    }

    if (!user) {
      alert("Please log in to place an order.");
      return;
    }

    setIsSubmitting(true);
    const generatedOrderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      if (paymentMethod === "razorpay") {
        // Create order via Razorpay API backend route
        const res = await fetch("/api/v1/razorpay/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: grandTotal,
            receipt: generatedOrderId,
          }),
        });
        const rzpData = await res.json();

        if (!rzpData.success) {
          alert(`Razorpay Order creation issue: ${rzpData.error || "Unable to initialize payment"}`);
          setIsSubmitting(false);
          return;
        }

        const razorpayKey = rzpData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_TOsdFkVaG73hSI";

        const options = {
          key: razorpayKey,
          amount: rzpData.amount || rzpData.order?.amount,
          currency: rzpData.currency || "INR",
          name: "Smart Care & Mobile Point",
          description: `Accessory Order #${generatedOrderId}`,
          image: "https://smartcaremobile.in/logo.png",
          order_id: rzpData.order_id || rzpData.order?.id,
          handler: async function (response: any) {
            try {
              // STEP 3: Verify HMAC-SHA256 Signature with backend
              const verifyRes = await fetch("/api/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });
              const verifyData = await verifyRes.json();

              if (verifyData.success) {
                await finalizeOrder(generatedOrderId, "razorpay", response);
              } else {
                alert(`Payment Verification Failed: ${verifyData.error || "Invalid signature"}`);
                setIsSubmitting(false);
              }
            } catch (vErr: any) {
              console.error("Signature verification endpoint error:", vErr);
              alert("Payment verification error. Please contact store support.");
              setIsSubmitting(false);
            }
          },
          prefill: {
            name: fullName,
            email: email,
            contact: phone,
          },
          theme: {
            color: "#10b981",
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
          console.error("[Razorpay Payment Failed]", response.error);
          alert(`Payment Failed: ${response.error?.description || "Transaction cancelled or declined."}`);
          setIsSubmitting(false);
        });
        rzp.open();
      } else if (paymentMethod === "whatsapp") {
        // WhatsApp direct order
        await finalizeOrder(generatedOrderId, "whatsapp");
        const waText = `Hi Smart Care! I placed order *#${generatedOrderId}* on smartcaremobile.in:
*Items*: ${cart.map(i => `${i.name} (${i.quantity}x)`).join(", ")}
*Subtotal*: ${formatINR(subtotal)}
*Shipping*: ${formatINR(shippingCharge)} (${isGurgaonAddress() ? "Gurugram ₹50" : "Standard ₹120"})
*Total*: ${formatINR(grandTotal)}
*Address*: ${streetAddress}, ${city} - ${pincode}
*Name*: ${fullName} (${phone})`;

        window.open(`https://wa.me/919289942313?text=${encodeURIComponent(waText)}`, "_blank");
      } else {
        // Cash on Delivery
        await finalizeOrder(generatedOrderId, "cod");
      }
    } catch (err: any) {
      console.error("Payment processing error:", err);
      alert(err.message || "Something went wrong during payment processing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <Link href="/accessories" className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Accessories</span>
        </Link>
        <span className="text-xs font-extrabold tracking-wider uppercase text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
          <Lock className="h-3 w-3" />
          256-Bit SSL Encrypted Checkout
        </span>
      </div>

      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="billing-form-wrapper"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Left side: Billing Details Form (7 cols on desktop) */}
            <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-6 order-2 lg:order-1">
              <div className="glass-card rounded-3xl p-5 sm:p-8 border border-border shadow-xl space-y-6 bg-card/40">
                <div className="border-b border-border/60 pb-4">
                  <h1 className="text-xl font-bold text-foreground">Delivery & Shipping Address</h1>
                  <p className="text-xs text-muted-foreground mt-0.5">Enter delivery details for fast shipping.</p>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-emerald-500" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-emerald-500" />
                          Mobile Number (10 Digits)
                        </span>
                        {phone.replace(/\D/g, "").length > 0 && (
                          <span className={`text-[9px] font-bold ${phone.replace(/\D/g, "").length === 10 ? "text-emerald-500" : "text-amber-500"}`}>
                            {phone.replace(/\D/g, "").length}/10 digits
                          </span>
                        )}
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        pattern="[0-9]{10}"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="e.g. 9876543210"
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-emerald-500" />
                      Email Address (Only valid email format)
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rahul@example.com"
                      className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Street Address */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                      Delivery Address
                    </label>
                    <input
                      type="text"
                      required
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="House/Flat No, Building, Street Name"
                      className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    {/* City */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground">City</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Gurugram"
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Pincode */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center justify-between">
                        <span>Pincode</span>
                        <span className="text-[9px] font-bold text-cyan-500">
                          {isGurgaonAddress() ? "Gurugram Pincode (₹50)" : "Other Pincode (₹120)"}
                        </span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="122001"
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Dynamic Pincode Calculated Shipping Fee Badge */}
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center gap-3">
                    <Truck className="h-5 w-5 text-emerald-500 shrink-0" />
                    <div>
                      <span className="font-bold text-foreground block">
                        {isGurgaonAddress() 
                          ? `Gurugram Express Shipping (₹50) — Pincode ${pincode || "122xxx"}` 
                          : `Pan-India Express Shipping (₹120) — Pincode ${pincode || "Other"}`}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {isGurgaonAddress()
                          ? "Same-day / 24-hour doorstep delivery calculated for Gurugram area (₹50 Flat Charge)"
                          : "3-5 business days courier shipping calculated from your Pincode (₹120 Flat Charge)"}
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Payment Details Card */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-border bg-card/40 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <CreditCard className="h-4.5 w-4.5 text-emerald-500" />
                    Select Payment Method
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {/* Razorpay Online */}
                  <label className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all cursor-pointer select-none text-center relative ${paymentMethod === "razorpay" ? "border-emerald-500 bg-emerald-500/[0.04] ring-1 ring-emerald-500" : "border-border bg-muted/20 hover:border-border/80"}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="razorpay"
                      checked={paymentMethod === "razorpay"}
                      onChange={() => setPaymentMethod("razorpay")}
                      className="sr-only"
                    />
                    <span className="text-xl">💳</span>
                    <div>
                      <span className="text-[11px] font-extrabold text-foreground block">Razorpay Online</span>
                      <span className="text-[9px] text-emerald-500 font-semibold block mt-0.5">UPI / Cards / NetBanking</span>
                    </div>
                  </label>

                  {/* COD */}
                  <label className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all cursor-pointer select-none text-center ${paymentMethod === "cod" ? "border-emerald-500 bg-emerald-500/[0.04] ring-1 ring-emerald-500" : "border-border bg-muted/20 hover:border-border/80"}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="sr-only"
                    />
                    <span className="text-xl">💵</span>
                    <div>
                      <span className="text-[11px] font-extrabold text-foreground block">Cash on Delivery</span>
                      <span className="text-[9px] text-muted-foreground block mt-0.5">Pay at Doorstep</span>
                    </div>
                  </label>

                  {/* WhatsApp */}
                  <label className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all cursor-pointer select-none text-center ${paymentMethod === "whatsapp" ? "border-emerald-500 bg-emerald-500/[0.04] ring-1 ring-emerald-500" : "border-border bg-muted/20 hover:border-border/80"}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="whatsapp"
                      checked={paymentMethod === "whatsapp"}
                      onChange={() => setPaymentMethod("whatsapp")}
                      className="sr-only"
                    />
                    <span className="text-xl">💬</span>
                    <div>
                      <span className="text-[11px] font-extrabold text-foreground block">Order via WhatsApp</span>
                      <span className="text-[9px] text-muted-foreground block mt-0.5">Direct Agent Support</span>
                    </div>
                  </label>
                </div>
              </div>

            </form>

            {/* Right side: Order Summary */}
            <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
              <div className="glass-card rounded-3xl p-6 border border-border shadow-md space-y-6 bg-card/40">
                <h3 className="font-extrabold text-sm text-foreground border-b border-border/60 pb-3 flex items-center gap-1.5">
                  <ShoppingBag className="h-4.5 w-4.5 text-emerald-500" />
                  Order Summary
                </h3>

                <div className="divide-y divide-border/40 max-h-60 overflow-y-auto pr-1 space-y-3.5">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-xs pt-3.5 first:pt-0">
                      <div className="min-w-0 pr-4">
                        <p className="font-bold text-foreground truncate">{item.name}</p>
                        <span className="text-[10px] text-muted-foreground">Qty: {item.quantity} × {formatINR(item.price)}</span>
                      </div>
                      <span className="font-extrabold text-foreground shrink-0">{formatINR(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border/60 pt-4 space-y-2.5 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Items Subtotal:</span>
                    <span className="font-bold text-foreground">{formatINR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping Charges ({isGurgaonAddress() ? "Gurugram" : "Standard"}):</span>
                    <span className="font-bold text-emerald-500">{formatINR(shippingCharge)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-border/60 text-sm">
                    <span className="font-extrabold text-foreground">Grand Total:</span>
                    <strong className="text-foreground text-lg font-black text-emerald-500">{formatINR(grandTotal)}</strong>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-emerald-500 text-black font-extrabold rounded-2xl text-xs uppercase tracking-wider hover:bg-emerald-400 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Place Secure Order ({formatINR(grandTotal)})</span>
                      <ChevronRight className="h-4.5 w-4.5 stroke-[3]" />
                    </>
                  )}
                </button>
              </div>

              <div className="glass-card rounded-2xl p-5 border border-border/50 bg-muted/20 flex items-center gap-3">
                <ShieldCheck className="h-8 w-8 text-emerald-500 shrink-0" />
                <div className="text-[10px] text-muted-foreground leading-normal">
                  <strong>Smart Care Guarantee</strong><br/>
                  All orders are dispatched with full tracking and invoice details sent directly to your registered email address.
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success-screen-billing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card rounded-3xl p-8 sm:p-10 border border-emerald-500/30 bg-emerald-500/[0.03] text-center space-y-6 shadow-2xl max-w-lg w-full mx-auto"
          >
            <div className="h-20 w-20 bg-emerald-500 text-black rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
              <Check className="h-10 w-10 stroke-[3]" />
            </div>

            <div className="space-y-3">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Order #{createdOrderId} Verified
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground">
                Thank You For Ordering!
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Thank you for ordering with Smart Care & Mobile Point! You will receive all order details, shipping breakdown, and delivery updates on your registered email (<strong className="text-foreground">{email}</strong>).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border/80 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-bold text-foreground">{createdOrderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery City:</span>
                <span className="font-bold text-foreground">{city} ({isGurgaonAddress() ? "₹50 Local Shipping" : "₹120 Standard Shipping"})</span>
              </div>
              <div className="flex justify-between border-t border-border/40 pt-2">
                <span className="font-bold text-foreground">Total Paid/Amount:</span>
                <span className="font-black text-emerald-500 text-sm">{formatINR(grandTotal)}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => router.push("/dashboard/orders")}
                className="px-6 py-3.5 rounded-2xl bg-emerald-500 text-black font-extrabold text-xs uppercase tracking-wider hover:bg-emerald-400 transition-colors shadow-md"
              >
                Track in Dashboard
              </button>
              <button
                onClick={() => router.push("/accessories")}
                className="px-6 py-3.5 rounded-2xl bg-card border border-border text-foreground font-bold text-xs uppercase tracking-wider hover:bg-muted transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

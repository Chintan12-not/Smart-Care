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
  ShieldCheck
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
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("razorpay"); // razorpay | cod | whatsapp

  // Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState("");

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

  // If cart is empty and not in success state, redirect to accessories
  useEffect(() => {
    if (cart.length === 0 && !isSuccess && !authLoading) {
      router.push("/accessories");
    }
  }, [cart, isSuccess, authLoading, router]);

  // Execute DB insert + localstorage + thank you email dispatch
  const finalizeOrder = async (orderId: string, payMethod: string, paymentInfo?: any) => {
    const orderTotal = getCartTotal();

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
            total_amount: orderTotal,
            shipping_address: {
              name: fullName,
              phone: phone,
              email: email,
              address: streetAddress,
              city: city,
              pincode: pincode,
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
      total_amount: orderTotal,
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

    // 3. Dispatch Thanking Email Confirmation via Resend API endpoint
    fetch("/api/v1/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "accessory",
        to: email,
        payload: {
          total_amount: orderTotal,
          payment_method: payMethod === "razorpay" ? "Razorpay Online (Paid)" : payMethod,
          razorpay_payment_id: paymentInfo?.razorpay_payment_id || undefined,
          shippingAddress: {
            name: fullName,
            phone,
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

    if (!user) {
      alert("Please log in to place an order.");
      return;
    }

    setIsSubmitting(true);
    const orderTotal = getCartTotal();
    const generatedOrderId = `ord_${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      if (paymentMethod === "razorpay") {
        // Create order via Razorpay API backend route
        const res = await fetch("/api/v1/razorpay/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: orderTotal,
            receipt: generatedOrderId,
          }),
        });
        const rzpData = await res.json();

        if (!rzpData.success) {
          alert(`Razorpay Order creation issue: ${rzpData.error || "Unable to initialize payment"}`);
          setIsSubmitting(false);
          return;
        }

        const razorpayKey = rzpData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TO6v5XghH0VsgN";

        const options = {
          key: razorpayKey,
          amount: rzpData.order.amount,
          currency: rzpData.order.currency,
          name: "Smart Care Mobile Point",
          description: `Accessory Order ${generatedOrderId}`,
          order_id: rzpData.order.id,
          prefill: {
            name: fullName,
            email: email,
            contact: phone,
          },
          theme: {
            color: "#06b6d4",
          },
          handler: async function (response: any) {
            console.log("Razorpay Payment Success:", response);
            await finalizeOrder(generatedOrderId, "razorpay", response);
            setIsSubmitting(false);
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
            },
          },
        };

        if (typeof window !== "undefined" && (window as any).Razorpay) {
          const rzp = new (window as any).Razorpay(options);
          rzp.on("payment.failed", function (response: any) {
            alert(`Payment Failed: ${response.error.description}`);
            setIsSubmitting(false);
          });
          rzp.open();
        } else {
          alert("Razorpay payment checkout library is loading. Please try again in 3 seconds.");
          setIsSubmitting(false);
        }
      } else if (paymentMethod === "whatsapp") {
        // Finalize order then open WhatsApp
        await finalizeOrder(generatedOrderId, "whatsapp");
        const whatsappNum = "919289942313";
        const message = `Hello Smart Care! I placed an order ${generatedOrderId} for ${formatINR(orderTotal)}.\nName: ${fullName}\nAddress: ${streetAddress}, ${city} - ${pincode}`;
        window.open(`https://wa.me/${whatsappNum}?text=${encodeURIComponent(message)}`, "_blank");
      } else {
        // COD
        await finalizeOrder(generatedOrderId, "cod");
      }
    } catch (err) {
      console.error("Failed placing order:", err);
      alert("There was an error processing your order. Please try again.");
    } finally {
      if (paymentMethod !== "razorpay") {
        setIsSubmitting(false);
      }
    }
  };


  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Configuring Checkout Details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] max-w-md w-full mx-auto px-4 flex items-center justify-center">
        <div className="glass-card rounded-3xl p-8 border border-border bg-card/60 text-center space-y-6 shadow-xl w-full">
          <div className="h-16 w-16 bg-cyan-500/10 text-cyan-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <Lock className="h-8 w-8" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">Sign In Required to Checkout</h2>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Please log in or sign up to complete your purchase. This securely records your order tracking status in your dashboard.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/login?redirect=/billing"
              className="inline-flex w-full justify-center py-3.5 rounded-2xl bg-cyan-500 text-black font-extrabold text-xs uppercase tracking-wider hover:bg-cyan-400 active:scale-[0.99] transition-all shadow-md"
            >
              Login / Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold group transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to products</span>
        </button>
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
            {/* Left side: Billing Details Form (7 cols on desktop, full width on mobile) */}
            <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-6 order-2 lg:order-1">
              <div className="glass-card rounded-3xl p-5 sm:p-8 border border-border shadow-xl space-y-6 bg-card/40">
                <div className="border-b border-border/60 pb-4">
                  <h2 className="text-xl font-bold text-foreground">Delivery & Billing Details</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Please provide shipping information for accessory dispatch.</p>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-cyan-500" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-cyan-500" />
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-cyan-500" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="johndoe@example.com"
                      className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>

                  {/* Street Address */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-cyan-500" />
                      Delivery Address
                    </label>
                    <input
                      type="text"
                      required
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="House No, Society, Street Name"
                      className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
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
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>

                    {/* Pincode */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground">Pincode</label>
                      <input
                        type="text"
                        required
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="122001"
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment details card */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-border bg-card/40 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <CreditCard className="h-4.5 w-4.5 text-cyan-500" />
                    Select Payment Method
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-500 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                    Test Mode Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {/* Razorpay Online */}
                  <label className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all cursor-pointer select-none text-center relative ${paymentMethod === "razorpay" ? "border-cyan-500 bg-cyan-500/[0.04] ring-1 ring-cyan-500" : "border-border bg-muted/20 hover:border-border/80"}`}>
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
                      <span className="text-[9px] text-cyan-500 font-semibold block mt-0.5">UPI / Cards / NetBanking</span>
                    </div>
                  </label>

                  {/* COD */}
                  <label className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all cursor-pointer select-none text-center ${paymentMethod === "cod" ? "border-cyan-500 bg-cyan-500/[0.04] ring-1 ring-cyan-500" : "border-border bg-muted/20 hover:border-border/80"}`}>
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
                  <label className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all cursor-pointer select-none text-center ${paymentMethod === "whatsapp" ? "border-cyan-500 bg-cyan-500/[0.04] ring-1 ring-cyan-500" : "border-border bg-muted/20 hover:border-border/80"}`}>
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

            {/* Right side: Order Summary (5 cols on desktop, full width on mobile - shown FIRST on mobile) */}
            <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
              <div className="glass-card rounded-3xl p-6 border border-border shadow-md space-y-6 bg-card/40">
                <h3 className="font-extrabold text-sm text-foreground border-b border-border/60 pb-3 flex items-center gap-1.5">
                  <ShoppingBag className="h-4.5 w-4.5 text-cyan-500" />
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
                    <span>Subtotal:</span>
                    <span className="font-bold text-foreground">{formatINR(getCartTotal())}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping Charges:</span>
                    <span className="font-bold text-emerald-500 uppercase">Free Delivery</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-border/60 text-sm">
                    <span className="font-extrabold text-foreground">Order Total:</span>
                    <strong className="text-foreground text-lg font-black text-cyan-500">{formatINR(getCartTotal())}</strong>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-cyan-500 text-black font-extrabold rounded-2xl text-xs uppercase tracking-wider hover:bg-cyan-400 active:scale-[0.99] transition-all shadow-md shadow-cyan-500/10 flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Place Secure Order</span>
                      <ChevronRight className="h-4.5 w-4.5" />
                    </>
                  )}
                </button>
              </div>

              <div className="glass-card rounded-2xl p-5 border border-border/50 bg-muted/20 flex items-center gap-3">
                <ShieldCheck className="h-8 w-8 text-cyan-500 shrink-0" />
                <div className="text-[10px] text-muted-foreground leading-normal">
                  <strong>Smart Care Checkout Trust</strong><br/>
                  Your delivery and billing details are protected. Payment methods are verified and backed by Cash on Delivery options.
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
            className="glass-card rounded-3xl p-8 border border-emerald-500/20 bg-emerald-500/[0.02] text-center space-y-6 shadow-2xl max-w-md w-full mx-auto"
          >
            <div className="h-16 w-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <Check className="h-8 w-8 stroke-[3]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-foreground">Order Placed Successfully!</h2>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Thank you for purchasing! We have registered your order <strong>{createdOrderId}</strong> and sent a confirmation thanking email to <span className="font-semibold text-foreground">{email}</span>.
              </p>
            </div>

            <div className="pt-2 flex justify-center gap-4">
              <button
                onClick={() => router.push("/dashboard/orders")}
                className="px-5 py-3 rounded-2xl bg-cyan-500 text-black font-extrabold text-xs uppercase tracking-wider hover:bg-cyan-400 transition-colors shadow-md shadow-cyan-500/10"
              >
                Track in Dashboard
              </button>
              <button
                onClick={() => router.push("/accessories")}
                className="px-5 py-3 rounded-2xl bg-muted border border-border text-foreground font-bold text-xs uppercase tracking-wider hover:bg-muted/80 transition-colors"
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

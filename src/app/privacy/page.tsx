import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Lock, Eye, FileText, ArrowLeft, Mail, Phone, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Smart Care & Mobile Point Gurugram",
  description: "Privacy Policy for Smart Care & Mobile Point. Read how we protect your personal information, device data confidentiality, and payment security.",
  alternates: {
    canonical: "https://www.smartcaremobile.in/privacy",
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "August 12, 2026";

  return (
    <div className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Top Header */}
      <div className="space-y-3 border-b border-border pb-6">
        <Link href="/" className="inline-flex items-center gap-1 text-xs font-bold text-cyan-500 hover:underline mb-2">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
        </Link>
        <div className="flex items-center gap-2 text-cyan-500">
          <ShieldCheck className="h-6 w-6" />
          <span className="text-xs font-extrabold uppercase tracking-wider">Legal & Compliance</span>
        </div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-muted-foreground">
          Last Updated: <strong className="text-foreground">{lastUpdated}</strong> • Effective for all services at Smart Care & Mobile Point.
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-8 text-xs text-muted-foreground leading-relaxed">
        
        {/* Intro Banner */}
        <div className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Lock className="h-4 w-4" />
            <span>Our Zero-Data-Inspection Commitment</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            At <strong>Smart Care & Mobile Point</strong>, your privacy and device data confidentiality are our top priorities. During hardware screen replacements, battery repairs, or doorstep pickups in Gurugram, our certified technicians strictly perform repair diagnostics without accessing, copying, or inspecting your photos, messages, apps, or private files.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-500" />
            1. Information We Collect
          </h2>
          <p>
            When you request doorstep mobile repairs, order phone accessories, book pickup services, or create a customer account on <strong>smartcaremobile.in</strong>, we collect necessary personal details including:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
            <li><strong>Contact Details:</strong> Your full name, mobile number, email address, and doorstep pickup address in Gurugram or Delhi NCR.</li>
            <li><strong>Device Repair Specs:</strong> Smartphone brand, model number, fault description, and warranty preference.</li>
            <li><strong>Order History & Invoices:</strong> Accessories purchased, billing records, transaction reference IDs, and fulfillment status.</li>
            <li><strong>Technical Analytics:</strong> Anonymized IP addresses, browser types, and device telemetry to optimize user navigation speed and security.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-500" />
            2. How We Use Your Information
          </h2>
          <p>We process your personal information solely for legitimate operational and customer service purposes:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
            <li>To arrange doorstep mobile repair pickups and technician visit scheduling in Gurugram.</li>
            <li>To send automated transactional order confirmations, tracking details, and digital tax invoices via Resend email service to your inbox.</li>
            <li>To provide customer support on WhatsApp (+91 92899 42313) regarding repair progress or accessory availability.</li>
            <li>To process secure online payments via Razorpay integration (Cash on Delivery, UPI, Credit/Debit Cards, NetBanking).</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-500" />
            3. Payment Security & Third-Party Services
          </h2>
          <p>
            We do not store your credit card numbers, debit card PINs, or UPI passwords on our servers. Online payments are securely processed through <strong>Razorpay Standard Web Checkout</strong> using 256-bit SSL encryption and HMAC-SHA256 signature verification.
          </p>
          <p>
            We share minimal essential data only with trusted technology infrastructure providers (Supabase Database, Vercel Hosting, Resend Email Gateway, and Appwrite Services) under strict confidentiality agreements. We never sell, rent, or trade your personal information to third-party marketing brokers.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-500" />
            4. Device Data & Privacy Guarantee
          </h2>
          <p>
            We strongly recommend creating a cloud backup of your device data prior to repair. While hardware screen and battery repairs do not erase internal storage, Smart Care & Mobile Point is not responsible for pre-existing software corruption or data loss caused by severe physical/liquid motherboard damage.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-500" />
            5. Cookies & Tracking
          </h2>
          <p>
            Our website uses essential local browser storage and session cookies to save your active shopping cart items, repair estimate selections, and customer login credentials. You can clear browser cookies at any time through your browser settings.
          </p>
        </section>

        {/* Section 6: Contact */}
        <section className="p-6 rounded-2xl bg-card border border-border space-y-3 mt-6">
          <h2 className="text-sm font-bold text-foreground">Contact Our Data Protection Team</h2>
          <p className="text-muted-foreground">If you have any questions or data requests regarding this Privacy Policy, feel free to contact us:</p>
          <div className="space-y-2 text-xs text-foreground font-semibold">
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-cyan-500" />
              <span>enigcon2020@gmail.com / chintanmaheshwari714@gmail.com</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-emerald-500" />
              <span>+91 92899 42313</span>
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-500" />
              <span>Shop No. 28, Ninex Residency, Sector 37C, Gurugram, Haryana 122001</span>
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}

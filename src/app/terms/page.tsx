import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { FileText, ShieldAlert, CheckCircle2, ArrowLeft, Mail, Phone, MapPin, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions | Smart Care & Mobile Point Gurugram",
  description: "Terms & Conditions for Smart Care & Mobile Point. Learn about our doorstep mobile repair policies, transparent pricing, quality assurance, and customer terms.",
  alternates: {
    canonical: "https://www.smartcaremobile.in/terms",
  },
};

export default function TermsAndConditionsPage() {
  const lastUpdated = "August 22, 2026";

  return (
    <div className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Top Header */}
      <div className="space-y-3 border-b border-border pb-6">
        <Link href="/" className="inline-flex items-center gap-1 text-xs font-bold text-cyan-500 hover:underline mb-2">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
        </Link>
        <div className="flex items-center gap-2 text-cyan-500">
          <Scale className="h-6 w-6" />
          <span className="text-xs font-extrabold uppercase tracking-wider">Terms of Service</span>
        </div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">Terms & Conditions</h1>
        <p className="text-xs text-muted-foreground">
          Last Updated: <strong className="text-foreground">{lastUpdated}</strong> • Governs all service bookings & purchases at Smart Care & Mobile Point.
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-8 text-xs text-muted-foreground leading-relaxed">
        
        {/* Intro Banner */}
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <CheckCircle2 className="h-4 w-4" />
            <span>Smart Care Transparent Service Terms</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            By booking a doorstep repair, purchasing phone accessories, or utilizing in-store document printing services at <strong>Smart Care & Mobile Point</strong> (Shop No. 28, Ninex Residency, Sector 37C, Gurugram), you agree to the terms outlined below.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-500" />
            1. Doorstep Mobile Repair & Pickup Services
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
            <li><strong>Service Coverage:</strong> Doorstep pickup and repair services are provided across all sectors in Gurugram (Sector 37C, Sector 45, DLF Phase 1-5, Sohna Road, Golf Course Road) and select NCR areas.</li>
            <li><strong>Pickup Charges:</strong> Delivery and doorstep logistics charges are clear and communicated upfront based on location distance.</li>
            <li><strong>Diagnostic Approval:</strong> Our experienced technician provides an upfront repair estimate after initial physical inspection. Repairs proceed only upon your explicit approval.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-500" />
            2. Quality Assurance & Device Inspection Terms
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
            <li><strong>Pre & Post Repair Testing:</strong> All replacement components undergo pre-installation testing and post-repair quality checks before customer handoff.</li>
            <li><strong>Physical Inspection & Verification:</strong> Customer devices are inspected for pre-existing liquid corrosion, camera clarity, display touch response, and audio functionality before and after service.</li>
            <li><strong>7-Day Fit Exchange:</strong> Accessories purchased online carry a 7-day hassle-free fit exchange if the case or tempered glass does not match your specific phone model.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-500" />
            3. Customer Data & Pre-Repair Responsibilities
          </h2>
          <p>
            Customers are requested to create a full backup of personal photos, files, and applications prior to handing over devices for hardware servicing. Smart Care is not responsible for data loss caused by pre-existing motherboard liquid corrosion or software failure.
          </p>
          <p>
            To verify touch functionality, screen calibration, camera clarity, and speaker audio after repair completion, customers may be requested to unlock their device in the technician's presence.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-500" />
            4. Pricing, Payments & Invoices
          </h2>
          <p>
            All listed product and service prices are in Indian Rupees (INR ₹) inclusive of applicable taxes. We accept Cash on Delivery (COD), Razorpay Web Checkout, UPI payments (PhonePe, Google Pay, Paytm), and major Credit/Debit cards. 100% GST tax invoices are generated for corporate bulk procurement orders.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-500" />
            5. Governing Law & Jurisdiction
          </h2>
          <p>
            These Terms & Conditions are governed by the laws of India. Any disputes arising out of or related to services rendered by Smart Care & Mobile Point shall be subject to the exclusive jurisdiction of the competent courts in Gurugram, Haryana.
          </p>
        </section>

        {/* Section 6: Contact */}
        <section className="p-6 rounded-2xl bg-card border border-border space-y-3 mt-6">
          <h2 className="text-sm font-bold text-foreground">Need Help Regarding Service Terms?</h2>
          <p className="text-muted-foreground">Our customer support desk is available 7 days a week from 10:00 AM to 09:00 PM:</p>
          <div className="space-y-2 text-xs text-foreground font-semibold">
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-emerald-500" />
              <span>+91 92899 42313</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-cyan-500" />
              <span>enigcononline@gmail.com / chintanmaheshwari714@gmail.com</span>
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

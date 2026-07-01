"use client";

import React from "react";
import { Pricing } from "@/components/ui/pricing";

export default function PricingPage() {
  const plans = [
    {
      name: "Basic Shield",
      price: "0",
      yearlyPrice: "0",
      period: "month",
      features: [
        "Access to AI Health Assistant (General)",
        "Access to AI Mobile Diagnostic helper",
        "Standard repair ticket priority queue",
        "Mock payment checkout simulation"
      ],
      description: "Get general diagnostics advice and schedule standard repair bookings for your devices.",
      buttonText: "Get Started Free",
      href: "/login",
      isPopular: false
    },
    {
      name: "Device Care Plus",
      price: "399",
      yearlyPrice: "319",
      period: "month",
      features: [
        "Priority repair queue & booking dispatch",
        "Free doorstep pick & delivery service",
        "10% discount on all premium accessories",
        "6-months warranty on replaced phone parts",
        "Extended AI Health guidance answers"
      ],
      description: "Ideal plan for active mobile users seeking reliable device warranty assurance and home pickups.",
      buttonText: "Subscribe Now",
      href: "/login",
      isPopular: true
    },
    {
      name: "Smart Care Pro",
      price: "999",
      yearlyPrice: "799",
      period: "month",
      features: [
        "Unlimited diagnostic checks for up to 3 devices",
        "20% discount on all premium accessories",
        "12-months warranty on all repaired screen/motherboard components",
        "Dedicated VIP technician chat hotline",
        "Emergency health guidance warnings VIP"
      ],
      description: "Ultimate shield coverage designed for families and power users managing multiple smartphones.",
      buttonText: "Upgrade to Pro",
      href: "/login",
      isPopular: false
    }
  ];

  return (
    <div className="flex-grow bg-background py-10 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

      <Pricing 
        plans={plans} 
        title="Simple, Transparent Care Plans" 
        description={"Protect your smartphone hardware and gain priority AI health guidance.\nChoose the care package that suits you best."}
      />
    </div>
  );
}

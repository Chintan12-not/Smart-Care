"use client";

import React from "react";
import { Sparkles, ArrowLeft, Cpu, ShieldCheck, Wrench } from "lucide-react";
import Link from "next/link";

export default function MobileAssistantPage() {
  return (
    <div className="flex-grow flex items-center justify-center min-h-[85vh] px-4 relative overflow-hidden bg-background">
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-md w-full glass-card rounded-3xl p-8 border border-border shadow-2xl space-y-8 text-center relative z-10 bg-card/60 backdrop-blur-md">
        
        {/* Animated Icon Ring */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl animate-pulse" />
            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center text-white shadow-lg animate-bounce">
              <Sparkles className="h-8 w-8 animate-spin-slow" />
            </div>
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
            Feature Integrating
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">AI Device Checker</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We are currently integrating our advanced AI smartphone diagnostics module. Very soon, you will be able to perform automated hardware checks and obtain live custom repair estimates!
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="p-3 bg-muted/40 rounded-2xl border border-border/40 text-xs">
            <Cpu className="h-4.5 w-4.5 text-cyan-500 mb-1" />
            <span className="font-bold text-foreground block text-[11px]">Automated Audit</span>
            <span className="text-[10px] text-muted-foreground">Smart hardware analysis</span>
          </div>
          <div className="p-3 bg-muted/40 rounded-2xl border border-border/40 text-xs">
            <Wrench className="h-4.5 w-4.5 text-emerald-500 mb-1" />
            <span className="font-bold text-foreground block text-[11px]">Live Estimates</span>
            <span className="text-[10px] text-muted-foreground">Direct admin sync pricing</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link
            href="/"
            className="w-full py-3 bg-foreground text-background font-bold text-xs rounded-xl hover:opacity-90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-md"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

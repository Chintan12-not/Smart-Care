"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  HeartPulse, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  ArrowUp, 
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  Send 
} from "lucide-react";
import { trackDirectionsClick, trackPhoneClick, trackWhatsAppClick } from "@/lib/analytics";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-card text-foreground border-t border-border mt-auto relative">
      
      {/* Brand Value Trust Badges Banner */}
      <div className="border-b border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-3.5">
              <span className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-500">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-foreground">100% Genuine Products</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Original accessories from verified top-tier brands.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3.5 border-y sm:border-y-0 sm:border-x border-border/80 py-4 sm:py-0 sm:px-6">
              <span className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-foreground">Certified Repairs Support</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Professional hardware support & detailed diagnostics checkups.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3.5">
              <span className="p-3 rounded-2xl bg-purple-500/10 text-purple-500">
                <Truck className="h-6 w-6" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-foreground">Free Doorstep Pickup</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Convenient pickup & drop across Gurugram and Delhi NCR.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-white shadow-sm">
                <HeartPulse className="h-5 w-5" />
              </span>
              <div className="flex flex-col">
                <span className="font-semibold text-base leading-none tracking-tight">Smart Care</span>
                <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase mt-[2px]">
                  & Mobile Point
                </span>
              </div>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your premium destination for smartphone diagnostics, professional repair services, and high-fidelity mobile accessories. Delivering trust and quality support since 2018.
            </p>
          </div>

          {/* Repair Services */}
          <div>
            <h3 className="text-xs font-bold text-foreground tracking-wider uppercase mb-4">Gurugram Repair Services</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/mobile-repair-gurugram" className="text-muted-foreground hover:text-emerald-500 transition-colors">
                  Mobile Repair Gurugram
                </Link>
              </li>
              <li>
                <Link href="/iphone-repair-gurugram" className="text-muted-foreground hover:text-emerald-500 transition-colors">
                  iPhone Repair Gurugram
                </Link>
              </li>
              <li>
                <Link href="/samsung-repair-gurugram" className="text-muted-foreground hover:text-emerald-500 transition-colors">
                  Samsung Repair Gurugram
                </Link>
              </li>
              <li>
                <Link href="/screen-replacement-gurugram" className="text-muted-foreground hover:text-emerald-500 transition-colors">
                  Screen Replacement Gurugram
                </Link>
              </li>
              <li>
                <Link href="/battery-replacement-gurugram" className="text-muted-foreground hover:text-emerald-500 transition-colors">
                  Battery Replacement Gurugram
                </Link>
              </li>
              <li>
                <Link href="/charging-port-repair-gurugram" className="text-muted-foreground hover:text-emerald-500 transition-colors">
                  Charging Port Repair
                </Link>
              </li>
              <li>
                <Link href="/print-xerox-services-gurugram" className="text-muted-foreground hover:text-emerald-500 transition-colors">
                  Print & Xerox Services
                </Link>
              </li>
              <li>
                <Link href="/pickup" className="text-muted-foreground hover:text-emerald-500 transition-colors">
                  Doorstep Pickup & Repair
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xs font-bold text-foreground tracking-wider uppercase mb-4">Contact Info</h3>
            <ul className="space-y-3.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>
                  <a 
                    href="https://maps.app.goo.gl/vuN5QDzjVbjhKDVh7" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    onClick={() => trackDirectionsClick("footer_address")}
                    className="hover:text-foreground transition-colors"
                  >
                    Shop No. 28, Ninex Residency, Sector 37C, Gurugram, Haryana 122001
                  </a>
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-cyan-500 flex-shrink-0" />
                <a 
                  href="tel:+919289942313" 
                  onClick={() => trackPhoneClick("footer_link")}
                  className="hover:text-foreground transition-colors"
                >
                  +91 92899 42313
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <a href="mailto:enigcononline@gmail.com" className="hover:text-foreground transition-colors">enigcononline@gmail.com</a>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground leading-none">Monday–Sunday</p>
                  <p className="text-[10px] mt-1 text-muted-foreground">10:00 AM - 09:00 PM</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter signup */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-foreground tracking-wider uppercase">Newsletter</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Subscribe to get seasonal offers, diagnostic guides, and device optimization tips.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email..."
                className="w-full bg-muted border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity"
                aria-label="Subscribe"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            {subscribed && (
              <p className="text-[10px] text-emerald-500 font-semibold animate-pulse">
                ✓ Successfully subscribed! Check your inbox.
              </p>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-muted-foreground">
          <p>&copy; {currentYear} Smart Care & Mobile Point. All rights reserved.</p>
          <div className="flex gap-4 font-medium">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms & Conditions</Link>
            <Link href="/sitemap" className="hover:text-foreground transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>

      {/* Floating Call & WhatsApp Buttons */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 flex flex-col gap-2.5">
        
        {/* Scroll To Top */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="p-3 sm:p-3.5 rounded-full bg-background/80 backdrop-blur-md border border-border shadow-lg text-foreground hover:bg-muted transition-all select-none hover:-translate-y-0.5"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
          </button>
        )}

        {/* Phone Call */}
        <a
          href="tel:+919289942313"
          onClick={() => trackPhoneClick("floating_button")}
          className="p-3 sm:p-3.5 rounded-full bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 hover:scale-105 transition-transform flex items-center justify-center"
          title="Call Store"
        >
          <Phone className="h-4.5 w-4.5 sm:h-5 sm:w-5 fill-current" />
        </a>

        {/* WhatsApp Chat */}
        <a
          href="https://wa.me/919289942313?text=Hi%20Smart%20Care%20%26%20Mobile%20Point,%20I%20need%20mobile%20repair%20service."
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsAppClick("floating_button")}
          className="p-3 sm:p-3.5 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform flex items-center justify-center"
          title="WhatsApp Support"
        >
          <svg className="h-4.5 w-4.5 sm:h-5 sm:w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>

      </div>
    </footer>
  );
}

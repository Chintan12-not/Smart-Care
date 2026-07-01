import React from "react";
import Link from "next/link";
import { HeartPulse, Mail, Phone, MapPin, Clock } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card text-foreground border-t border-border mt-auto">
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
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your One-Stop Destination for Healthcare & Mobile Solutions. Providing AI health assistance, premium mobile accessories, and professional smartphone repair services.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/health-assistant" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                  AI Health Assistant
                </Link>
              </li>
              <li>
                <Link href="/mobile-assistant" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                  AI Mobile Assistant
                </Link>
              </li>

              <li>
                <Link href="/repair" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                  Mobile Phone Repair
                </Link>
              </li>
              <li>
                <Link href="/accessories" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                  Mobile Accessories Store
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Contact Info</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Sector 15, Dwarka, New Delhi, India</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-cyan-500 flex-shrink-0" />
                <span>+91 99999 99999</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span>support@smartcare.in</span>
              </li>
            </ul>
          </div>

          {/* Working Hours */}
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Working Hours</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Mon - Sat</p>
                  <p className="text-xs">09:00 AM - 09:00 PM</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Sunday</p>
                  <p className="text-xs">Closed</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {currentYear} Smart Care & Mobile Point. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms & Conditions</Link>
            <Link href="/sitemap" className="hover:text-foreground">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

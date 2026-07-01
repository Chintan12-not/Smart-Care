"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HeartPulse, 
  Smartphone, 
  ShoppingBag, 
  Wrench, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  User, 
  Sparkles,
  Search,
  BookOpen,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Handle scrolling border effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync dark mode state with document class list
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
  }, [darkMode]);

  // Read cart size from localStorage mock
  useEffect(() => {
    const checkCart = () => {
      const stored = localStorage.getItem("sc_cart");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCartCount(parsed.length);
        } catch (e) {
          setCartCount(0);
        }
      }
    };
    checkCart();
    window.addEventListener("storage", checkCart);
    return () => window.removeEventListener("storage", checkCart);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "AI Health", href: "/health-assistant", icon: HeartPulse, accent: "text-emerald-500" },
    { name: "AI Device", href: "/mobile-assistant", icon: Sparkles, accent: "text-cyan-500" },
    { name: "Repairs", href: "/repair", icon: Wrench },
    { name: "Accessories", href: "/accessories", icon: Smartphone },
    { name: "Pricing", href: "/pricing", icon: CreditCard },
    { name: "Blog", href: "/blog", icon: BookOpen },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled 
          ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm" 
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                <HeartPulse className="h-5 w-5" />
              </span>
              <div className="flex flex-col">
                <span className="font-semibold text-base leading-none tracking-tight text-foreground bg-clip-text">
                  Smart Care
                </span>
                <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase mt-[2px]">
                  & Mobile Point
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2 items-center">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5",
                    isActive 
                      ? "bg-muted text-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  )}
                >
                  {link.icon && <link.icon className={cn("h-4 w-4", link.accent)} />}
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <Link
              href="/accessories#cart"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted relative transition-colors duration-200"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-emerald-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link
              href="/dashboard"
              className="ml-1 px-4 py-2 rounded-lg bg-foreground text-background font-medium text-xs hover:opacity-90 transition-opacity duration-200 flex items-center gap-1.5 shadow-sm"
            >
              <User className="h-3.5 w-3.5" />
              Dashboard
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <Link
              href="/accessories#cart"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted relative"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-emerald-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden glass-panel border-b border-border absolute w-full top-16 left-0 animate-in slide-in-from-top duration-300">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block px-3 py-3 rounded-lg text-base font-medium flex items-center gap-2.5",
                    isActive 
                      ? "bg-muted text-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  )}
                >
                  {link.icon && <link.icon className={cn("h-5 w-5", link.accent)} />}
                  {link.name}
                </Link>
              );
            })}
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center mt-4 px-4 py-3 rounded-lg bg-foreground text-background font-medium text-sm flex items-center justify-center gap-2"
            >
              <User className="h-4 w-4" />
              User Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

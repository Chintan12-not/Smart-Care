"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
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
  Truck,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import CartDrawer from "@/components/cart/CartDrawer";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  // Safe SSR Theme initialization
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Global event listener to open cart drawer
  useEffect(() => {
    const handleOpenDrawer = () => {
      setIsCartDrawerOpen(true);
    };
    window.addEventListener("open-cart-drawer", handleOpenDrawer);
    return () => window.removeEventListener("open-cart-drawer", handleOpenDrawer);
  }, []);

  // Sync theme status on load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sc_theme");
      if (saved) {
        setDarkMode(saved === "dark");
      } else {
        setDarkMode(false); // Default to clean, bright light mode
      }
    }
  }, []);

  // Handle scrolling border effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync dark mode state with document class list & cache
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      root.classList.remove("light");
      localStorage.setItem("sc_theme", "dark");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      localStorage.setItem("sc_theme", "light");
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
    { name: "Mobile Repair", href: "/mobile-repair-gurugram", icon: Wrench, accent: "text-emerald-500" },
    { name: "Pickup & Drop", href: "/pickup", icon: Truck, accent: "text-amber-500" },
    { name: "Accessories", href: "/accessories", icon: Smartphone },
    { name: "Corporate & Bulk", href: "/corporate-orders", icon: Building2, accent: "text-purple-400" },
    { name: "Blog", href: "/blog", icon: BookOpen },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 bg-background/80 backdrop-blur-xl border-b border-border/40",
        scrolled 
          ? "shadow-[0_2px_20px_-10px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_30px_-15px_rgba(0,0,0,0.6)]" 
          : "border-transparent/30"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2.5 group">
              <img 
                src="/logo.png" 
                alt="Smart Care & Mobile Point Logo" 
                className="h-9 w-auto rounded-xl object-contain shadow-sm group-hover:scale-105 transition-transform duration-300 bg-white p-0.5 border border-border/30"
              />
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
              
              if (link.name === "Accessories") {
                return (
                  <Link
                    key={link.name}
                    href="/accessories"
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all duration-300 flex items-center gap-1.5 shadow-sm border relative group",
                      isActive
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400 shadow-cyan-500/25 scale-105"
                        : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500 hover:text-black hover:border-cyan-400 shadow-sm"
                    )}
                  >
                    <Smartphone className="h-3.5 w-3.5 text-cyan-400 group-hover:text-black" />
                    <span>Accessories</span>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                  </Link>
                );
              }

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5",
                    isActive 
                      ? "bg-muted text-foreground font-bold" 
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

            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted relative transition-colors duration-200"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-emerald-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

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

            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted relative"
              aria-label="Shopping Cart Mobile"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-emerald-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Backdrop & Menu Drawer */}
      {isOpen && (
        <>
          <div 
            onClick={() => setIsOpen(false)} 
            className="md:hidden fixed inset-0 top-16 bg-black/80 backdrop-blur-sm z-[80]"
          />
          <div className="md:hidden fixed top-16 left-0 w-full bg-card dark:bg-[#0a0d14] border-b border-border/80 shadow-2xl z-[90] animate-in slide-in-from-top duration-300 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="p-4 space-y-2.5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                const isAccessories = link.name === "Accessories";

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-extrabold transition-all border min-h-[48px]",
                      isAccessories
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400/40 shadow-lg shadow-cyan-500/20"
                        : isActive 
                          ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/40 shadow-sm" 
                          : "bg-muted/60 dark:bg-zinc-900/80 border-border/60 text-foreground hover:bg-muted"
                    )}
                  >
                    <div className="flex items-center gap-3.5">
                      {link.icon ? (
                        <link.icon className={cn("h-5 w-5 shrink-0", isAccessories ? "text-white" : link.accent || "text-cyan-400")} />
                      ) : (
                        <Sparkles className="h-5 w-5 text-cyan-400 shrink-0" />
                      )}
                      <span className={cn("font-extrabold text-sm tracking-tight", isAccessories ? "text-white" : "text-foreground")}>
                        {link.name}
                      </span>
                    </div>
                    {isAccessories && (
                      <span className="px-2.5 py-0.5 rounded-full bg-white text-black text-[9px] font-black uppercase tracking-wider shadow-sm">
                        Direct Store
                      </span>
                    )}
                  </Link>
                );
              })}
              
              <div className="pt-2 border-t border-border/60">
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-foreground text-background font-extrabold text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition-opacity"
                >
                  <User className="h-4 w-4" />
                  <span>User Dashboard</span>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
      {/* Floating Accessories Direct Store Button (Mobile & Desktop) */}
      {!isOpen && !pathname.startsWith("/accessories") && (
        <Link
          href="/accessories"
          className="fixed bottom-24 right-4 sm:bottom-24 sm:right-6 z-40 px-4 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white font-extrabold text-xs shadow-2xl flex items-center gap-2 border border-cyan-400/50 hover:scale-105 active:scale-95 transition-all duration-300 group backdrop-blur-md animate-bounce"
          title="Open Accessories Store"
        >
          <Smartphone className="h-4 w-4 text-white animate-pulse" />
          <span className="tracking-tight">Accessories Store</span>
          <span className="px-1.5 py-0.5 rounded-md bg-white/25 text-[9px] font-black uppercase text-white shadow-sm">STORE</span>
        </Link>
      )}

      <CartDrawer isOpen={isCartDrawerOpen} onClose={() => setIsCartDrawerOpen(false)} />
    </header>
  );
}

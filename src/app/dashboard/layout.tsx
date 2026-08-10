"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { 
  User, 
  Settings, 
  ShoppingBag, 
  Wrench, 
  LogOut, 
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  // Route protection
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=" + encodeURIComponent(pathname));
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const sidebarLinks = [
    { name: "Overview", href: "/dashboard", icon: User },
    { name: "My Orders", href: "/dashboard/orders", icon: ShoppingBag },
    { name: "Repair History", href: "/dashboard/repairs", icon: Wrench },
    { name: "Saved & Wishlist", href: "/dashboard/saved", icon: Settings },
  ];

  return (
    <div className="flex-grow min-h-screen bg-background border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">

        {/* ── MOBILE LAYOUT: compact user header + horizontal tab bar ── */}
        <div className="md:hidden mb-6 space-y-3">
          {/* User info strip */}
          <div className="flex items-center justify-between glass-card rounded-2xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-base shadow-sm flex-shrink-0">
                {user.full_name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm truncate max-w-[160px]">{user.full_name}</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/10">
                  {user.role}
                </span>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {/* Horizontal scrollable tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all duration-200",
                    isActive
                      ? "bg-foreground text-background shadow-sm"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  <link.icon className="h-3.5 w-3.5" />
                  {link.name}
                </Link>
              );
            })}
            {user.role === "admin" && (
              <Link
                href="/admin"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 bg-cyan-500/10 text-cyan-500 border border-cyan-500/20"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}
          </div>
        </div>

        {/* ── DESKTOP LAYOUT: sidebar + main content grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Sidebar — hidden on mobile, shown on md+ */}
          <aside className="hidden md:block md:col-span-1 space-y-6">
            <div className="glass-card rounded-2xl p-6 shadow-sm border border-border">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  {user.full_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground truncate max-w-[150px]">
                    {user.full_name}
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/10">
                    {user.role}
                  </span>
                </div>
              </div>

              <nav className="space-y-1">
                {sidebarLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200",
                        isActive
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                      )}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.name}
                    </Link>
                  );
                })}

                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-cyan-500 hover:bg-cyan-500/5 transition-colors duration-200"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    Admin Panel
                  </Link>
                )}

                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/5 transition-colors duration-200 mt-4 border-t border-border/50 pt-4"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Dashboard Content */}
          <main className="md:col-span-3 flex flex-col space-y-6">
            {children}
          </main>

        </div>
      </div>
    </div>
  );
}

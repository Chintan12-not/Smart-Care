"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { 
  ShieldCheck, 
  ShoppingBag, 
  Wrench, 
  Database, 
  BarChart3, 
  LogOut,
  ChevronLeft,
  Bell
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  // Strict route protection
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login?redirect=" + encodeURIComponent(pathname));
      } else if (user.role !== "admin") {
        router.push("/dashboard");
      }
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-medium font-sans">Checking administrator status...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  const adminLinks = [
    { name: "Metrics Panel", href: "/admin", icon: BarChart3 },
    { name: "Accessories Catalogue", href: "/admin/accessories", icon: ShoppingBag },
    { name: "Repair Orders", href: "/admin/repairs", icon: Wrench },
  ];

  return (
    <div className="flex-grow min-h-screen bg-background border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Admin Sidebar */}
          <aside className="md:col-span-1 space-y-6">
            <div className="glass-card rounded-2xl p-6 shadow-sm border border-cyan-500/20">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center text-white shadow-sm">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground truncate max-w-[150px]">
                    Admin Hub
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-cyan-500/10 text-cyan-500 border border-cyan-500/15">
                    OVERLORD
                  </span>
                </div>
              </div>

              <nav className="space-y-1">
                {adminLinks.map((link) => {
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

                <Link
                  href="/dashboard"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-emerald-500 hover:bg-emerald-500/5 transition-colors duration-200 mt-4 border-t border-border/50 pt-4"
                >
                  <ChevronLeft className="h-4 w-4" />
                  User Dashboard
                </Link>

                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/5 transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* Admin Main Portal Content */}
          <main className="md:col-span-3 flex flex-col space-y-6">
            {children}
          </main>

        </div>
      </div>
    </div>
  );
}

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
  Bell, 
  CalendarClock 
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <aside className="md:col-span-1 space-y-6">
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

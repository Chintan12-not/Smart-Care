"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { Lock, Mail, User, Shield, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("customer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push(user.role === "admin" ? "/admin" : redirectUrl);
    }
  }, [user, router, redirectUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email) {
      setError("Email is required");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const res = await signIn(email, selectedRole);
        if (res.success) {
          setSuccess(true);
          router.push(selectedRole === "admin" ? "/admin" : redirectUrl);
        } else {
          setError(res.error || "Failed to log in.");
        }
      } else {
        if (!fullName) {
          setError("Full name is required");
          setLoading(false);
          return;
        }
        const res = await signUp(email, fullName, selectedRole);
        if (res.success) {
          setSuccess(true);
          router.push(selectedRole === "admin" ? "/admin" : redirectUrl);
        } else {
          setError(res.error || "Failed to sign up.");
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center min-h-[80vh] px-4 py-12 relative overflow-hidden bg-background">
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Glassmorphic Card */}
      <div className="w-full max-w-md glass-card rounded-3xl p-8 relative z-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 text-emerald-500 mb-4">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            {isLogin ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Access healthcare and mobile diagnostics in one place
          </p>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-muted mb-6">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(""); }}
            className={cn(
              "py-2 text-xs font-semibold rounded-lg transition-all duration-200",
              isLogin 
                ? "bg-card text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(""); }}
            className={cn(
              "py-2 text-xs font-semibold rounded-lg transition-all duration-200",
              !isLogin 
                ? "bg-card text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name (Registration Only) */}
          {!isLogin && (
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-medium text-muted-foreground">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground" />
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-muted border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200"
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium text-muted-foreground">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground" />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-muted border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Demo Testing Role Selector */}
          <div className="space-y-2 border-t border-border/50 pt-4 mt-2">
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-1">
              <Shield className="h-3.5 w-3.5 text-cyan-500" />
              <span>Select Role for Testing & Demo</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["customer", "admin", "technician"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRole(r)}
                  className={cn(
                    "py-1.5 px-2 text-[10px] font-bold rounded-lg uppercase tracking-wider border transition-all duration-200",
                    selectedRole === r
                      ? "bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-emerald-500/50 text-foreground"
                      : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || authLoading}
            className="w-full mt-6 bg-foreground text-background font-semibold py-3 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-md"
          >
            {loading ? (
              <span className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {isLogin ? "Sign In" : "Sign Up"}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={
      <div className="flex-grow flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </React.Suspense>
  );
}

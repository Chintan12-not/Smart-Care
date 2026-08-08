"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { Lock, Mail, User, Shield, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, signIn, signUp, signInWithGoogle, loading: authLoading } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
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
        const res = await signIn(email, password || undefined, selectedRole);
        if (res.success) {
          setSuccess(true);
        } else {
          setError(res.error || "Failed to log in.");
        }
      } else {
        if (!fullName) {
          setError("Full name is required");
          setLoading(false);
          return;
        }
        const res = await signUp(email, password || undefined, fullName, phone || undefined, selectedRole);
        if (res.success) {
          setSuccess(true);
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

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || "Failed to connect to Google.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during Google Auth.");
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

          {/* Phone Number (Registration Only) */}
          {!isLogin && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <label htmlFor="phone" className="text-xs font-medium text-muted-foreground">Phone Number</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-xs text-muted-foreground font-bold font-mono">+91</span>
                <input
                  id="phone"
                  type="tel"
                  placeholder="92899 42313"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-muted border border-border rounded-xl py-2.5 pl-12 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 font-semibold"
                />
              </div>
            </div>
          )}

          {/* Password (Optional for OTP, required for credentials) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-xs font-medium text-muted-foreground">Password</label>
              {isLogin && <span className="text-[10px] text-muted-foreground/80">(Leave blank for magic OTP)</span>}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground" />
              <input
                id="password"
                type="password"
                placeholder={isLogin ? "•••••••• (or verify via email)" : "Create a password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-muted border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200"
              />
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

          {/* Divider */}
          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-x-0 h-[1px] bg-border/80" />
            <span className="relative px-3 bg-card text-[10px] uppercase font-bold text-muted-foreground tracking-wider select-none">
              Or continue with
            </span>
          </div>

          {/* Social Auth Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading || authLoading}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/70 transition-all duration-200 active:scale-[0.98] text-xs font-bold text-foreground"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
            
            <button
              type="button"
              disabled={true}
              title="Apple Sign-In placeholder"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border bg-muted/10 opacity-50 cursor-not-allowed text-xs font-bold text-muted-foreground"
            >
              <svg className="h-4 w-4 fill-current animate-pulse" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.51-.62.71-1.16 1.85-1.02 2.96 1.11.09 2.26-.55 2.97-1.41z"/>
              </svg>
              Apple
            </button>
          </div>
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

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { 
  auth as firebaseAuth, 
  isFirebaseConfigured, 
  googleProvider, 
  appleProvider 
} from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from "firebase/auth";

export type UserRole = "customer" | "admin" | "staff" | "technician" | "delivery";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  preferred_language: string;
  addresses: any[];
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password?: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password?: string, fullName?: string, phone?: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithApple: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = (email: string) => {
    if (!email) return false;
    const clean = email.toLowerCase().trim();
    return clean === "admin@example.com" || 
           clean === "chintanmaheshwari12@gmail.com" || 
           clean === "chintanmaheshwari714@gmail.com" ||
           clean === "enigcononline@gmail.com" ||
           clean === "enigcon2020@gmail.com" ||
           clean === "smart.care313@gmail.com" ||
           clean === "maheshwari.shailesh74@gmail.com" ||
           clean.startsWith("admin@") ||
           clean.startsWith("admin.") ||
           clean.includes("admin");
  };

  // Sync session from Firebase Auth if configured, otherwise load from mock localStorage session
  useEffect(() => {
    if (isFirebaseConfigured()) {
      const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
        if (firebaseUser) {
          let profileData: Partial<UserProfile> = {};
          
          if (isSupabaseConfigured()) {
            try {
              const { data: profile, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", firebaseUser.uid)
                .single();

              if (profile) {
                profileData = profile;
              }
            } catch (e) {
              console.error("Supabase profile sync error during Firebase login:", e);
            }
          }

          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            full_name: profileData.full_name || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Smart User",
            phone: profileData.phone || firebaseUser.phoneNumber || undefined,
            role: isAdmin(firebaseUser.email || "") ? "admin" : ((profileData.role as UserRole) || "customer"),
            preferred_language: profileData.preferred_language || "en",
            addresses: profileData.addresses || [],
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      
      return () => unsubscribe();
    } else {
      // Fallback: Read mock session from localStorage
      const mockSession = localStorage.getItem("sc_session");
      if (mockSession) {
        try {
          setUser(JSON.parse(mockSession));
        } catch (e) {
          setUser(null);
        }
      }
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password?: string, role: UserRole = "customer") => {
    setLoading(true);
    if (isFirebaseConfigured()) {
      try {
        if (!password) {
          throw new Error("Password is required for email login with Firebase.");
        }
        await signInWithEmailAndPassword(firebaseAuth, email, password);
        return { success: true };
      } catch (e: any) {
        setLoading(false);
        return { success: false, error: e.message || "Login failed" };
      }
    } else {
      // Mock log in instantly
      const resolvedRole = isAdmin(email) ? "admin" : role;
      const mockUser: UserProfile = {
        id: "mock-user-uuid-" + resolvedRole,
        email,
        full_name: email.split("@")[0].toUpperCase() || "Jane Doe",
        role: resolvedRole as UserRole,
        phone: "+91 98765 43210",
        preferred_language: "en",
        addresses: [
          { id: "1", name: "Home", city: "New Delhi", pin: "110075", address: "A-54, Sector 12, Dwarka" }
        ],
      };
      localStorage.setItem("sc_session", JSON.stringify(mockUser));
      setUser(mockUser);
      setLoading(false);
      return { success: true };
    }
  };

  const signUp = async (email: string, password?: string, fullName?: string, phone?: string, role: UserRole = "customer") => {
    setLoading(true);
    const resolvedRole = isAdmin(email) ? "admin" : role;

    if (isFirebaseConfigured()) {
      try {
        if (!password) {
          throw new Error("Password is required for registration with Firebase.");
        }
        const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);

        // Auto-create profiles database row in Supabase
        if (isSupabaseConfigured() && credential.user) {
          try {
            const { error: profileError } = await supabase
              .from("profiles")
              .insert([{
                id: credential.user.uid,
                full_name: fullName || email.split("@")[0],
                phone: phone || null,
                role: resolvedRole,
                preferred_language: "en",
                addresses: []
              }]);
            if (profileError) throw profileError;
          } catch (dbErr) {
            console.error("Profile creation error during signup:", dbErr);
          }
        }

        // Send thanking welcome email
        fetch("/api/v1/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "welcome",
            to: email,
            payload: { name: fullName || email.split("@")[0] }
          })
        }).then(async (res) => {
          const data = await res.json();
          if (data.success) {
            console.log("[Auth] Welcome email sent to:", email);
          } else {
            console.warn("[Auth] Welcome email failed:", data.error, data.hint || "");
          }
        }).catch(err => console.error("[Auth] Welcome email trigger failed:", err));

        return { success: true };
      } catch (e: any) {
        setLoading(false);
        return { success: false, error: e.message || "Sign up failed" };
      }
    } else {
      // Mock Sign Up
      const mockUser: UserProfile = {
        id: "mock-user-uuid-" + resolvedRole,
        email,
        full_name: fullName || email.split("@")[0],
        role: resolvedRole as UserRole,
        phone: phone || "+91 99999 88888",
        preferred_language: "en",
        addresses: [],
      };
      localStorage.setItem("sc_session", JSON.stringify(mockUser));
      setUser(mockUser);
      setLoading(false);

      // Send thanking welcome email
      fetch("/api/v1/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "welcome",
          to: email,
          payload: { name: fullName || email.split("@")[0] }
        })
      }).then(async (res) => {
        const data = await res.json();
        if (data.success) {
          console.log("[Auth] Mock welcome email sent to:", email);
        } else {
          console.warn("[Auth] Mock welcome email failed:", data.error, data.hint || "");
        }
      }).catch(err => console.error("[Auth] Welcome email trigger failed:", err));

      return { success: true };
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    if (isFirebaseConfigured()) {
      try {
        const credential = await signInWithPopup(firebaseAuth, googleProvider);

        // Auto-create database profile for OAuth user
        if (isSupabaseConfigured() && credential.user) {
          try {
            const { data: existing } = await supabase
              .from("profiles")
              .select("id")
              .eq("id", credential.user.uid)
              .single();

            const resolvedRole = isAdmin(credential.user.email || "") ? "admin" : "customer";

            if (!existing) {
              await supabase
                .from("profiles")
                .insert([{
                  id: credential.user.uid,
                  full_name: credential.user.displayName || credential.user.email?.split("@")[0] || "Smart User",
                  phone: credential.user.phoneNumber || null,
                  role: resolvedRole,
                  preferred_language: "en",
                  addresses: []
                }]);

              // Dispatch welcome email upon first Google login registration
              if (credential.user.email) {
                fetch("/api/v1/email", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    type: "welcome",
                    to: credential.user.email,
                    payload: { name: credential.user.displayName || credential.user.email.split("@")[0] }
                  })
                }).then(async (res) => {
                  const data = await res.json();
                  if (data.success) {
                    console.log("[Auth] Google welcome email sent to:", credential.user.email);
                  } else {
                    console.warn("[Auth] Google welcome email failed:", data.error, data.hint || "");
                  }
                }).catch(err => console.error("[Auth] Welcome email trigger failed:", err));
              }
            }
          } catch (dbErr) {
            console.error("OAuth profile validation failed:", dbErr);
          }
        }
        return { success: true };
      } catch (e: any) {
        setLoading(false);
        return { success: false, error: e.message || "Google sign in failed" };
      }
    } else {
      // Mock login as Google user
      const googleUser: UserProfile = {
        id: "mock-google-user",
        email: "google.user@example.com",
        full_name: "Google Customer",
        role: "customer",
        phone: "+91 99887 76655",
        preferred_language: "en",
        addresses: [],
      };
      localStorage.setItem("sc_session", JSON.stringify(googleUser));
      setUser(googleUser);
      setLoading(false);
      return { success: true };
    }
  };

  const signInWithApple = async () => {
    setLoading(true);
    if (isFirebaseConfigured()) {
      try {
        await signInWithPopup(firebaseAuth, appleProvider);
        return { success: true };
      } catch (e: any) {
        setLoading(false);
        return { success: false, error: e.message || "Apple sign in failed" };
      }
    } else {
      // Mock login as Apple user
      const appleUser: UserProfile = {
        id: "mock-apple-user",
        email: "apple.user@example.com",
        full_name: "Apple Customer",
        role: "customer",
        phone: "+91 98888 77777",
        preferred_language: "en",
        addresses: [],
      };
      localStorage.setItem("sc_session", JSON.stringify(appleUser));
      setUser(appleUser);
      setLoading(false);
      return { success: true };
    }
  };

  const signOut = async () => {
    setLoading(true);
    if (isFirebaseConfigured()) {
      await firebaseSignOut(firebaseAuth);
    } else {
      localStorage.removeItem("sc_session");
    }
    setUser(null);
    setLoading(false);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { success: false, error: "Not logged in" };
    
    const updatedUser = { ...user, ...updates };

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({
            full_name: updatedUser.full_name,
            phone: updatedUser.phone,
            preferred_language: updatedUser.preferred_language,
            addresses: updatedUser.addresses,
          })
          .eq("id", user.id);

        if (error) throw error;
        setUser(updatedUser);
        return { success: true };
      } catch (e: any) {
        return { success: false, error: e.message || "Failed to update profile" };
      }
    } else {
      localStorage.setItem("sc_session", JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signInWithApple, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

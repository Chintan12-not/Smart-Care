"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

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
  signIn: (email: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, fullName: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync session from Supabase if configured, otherwise load from mock localStorage session
  useEffect(() => {
    const initializeAuth = async () => {
      if (isSupabaseConfigured()) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Fetch profile
            const { data: profile, error } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (profile) {
              setUser({
                id: session.user.id,
                email: session.user.email || "",
                full_name: profile.full_name,
                phone: profile.phone,
                role: profile.role,
                preferred_language: profile.preferred_language || "en",
                addresses: profile.addresses || [],
              });
            } else {
              // Create default profile if not exists
              const defaultProfile: UserProfile = {
                id: session.user.id,
                email: session.user.email || "",
                full_name: session.user.user_metadata.full_name || "Smart User",
                role: "customer",
                preferred_language: "en",
                addresses: [],
              };
              setUser(defaultProfile);
            }
          }
        } catch (e) {
          console.error("Auth initialization error", e);
        }
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
      }
      setLoading(false);
    };

    initializeAuth();

    // Listen to Supabase auth state updates if configured
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (profile) {
              setUser({
                id: session.user.id,
                email: session.user.email || "",
                full_name: profile.full_name,
                phone: profile.phone,
                role: profile.role,
                preferred_language: profile.preferred_language || "en",
                addresses: profile.addresses || [],
              });
            }
          } else {
            setUser(null);
          }
          setLoading(false);
        }
      );
      return () => subscription.unsubscribe();
    }
  }, []);

  const signIn = async (email: string, role: UserRole = "customer") => {
    setLoading(true);
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: false,
          },
        });
        if (error) throw error;
        return { success: true };
      } catch (e: any) {
        setLoading(false);
        return { success: false, error: e.message || "OTP request failed" };
      }
    } else {
      // Mock log in instantly
      const mockUser: UserProfile = {
        id: "mock-user-uuid-" + role,
        email,
        full_name: email.split("@")[0].toUpperCase() || "Jane Doe",
        role: role,
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

  const signUp = async (email: string, fullName: string, role: UserRole = "customer") => {
    setLoading(true);
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: "temporary-secure-password-123!", // passwordless preferred later
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
        return { success: true };
      } catch (e: any) {
        setLoading(false);
        return { success: false, error: e.message || "Sign up failed" };
      }
    } else {
      // Mock Sign Up
      const mockUser: UserProfile = {
        id: "mock-user-uuid-" + role,
        email,
        full_name: fullName,
        role: role,
        phone: "+91 99999 88888",
        preferred_language: "en",
        addresses: [],
      };
      localStorage.setItem("sc_session", JSON.stringify(mockUser));
      setUser(mockUser);
      setLoading(false);
      return { success: true };
    }
  };

  const signOut = async () => {
    setLoading(true);
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
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
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateProfile }}>
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

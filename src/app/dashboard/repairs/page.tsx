"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { Wrench, Calendar, DollarSign, Clock, HelpCircle, ArrowRight, ShieldCheck, Gift } from "lucide-react";
import Link from "next/link";
import { formatINR } from "@/lib/utils";

interface TrackingEvent {
  status: string;
  notes: string;
  timestamp: string;
}

interface Repair {
  id: string;
  created_at: string;
  device_model: string;
  issue_description: string;
  status: string;
  estimate_cost: number | null;
  estimate_time: string | null;
  warranty_months: number;
  warranty_expiry: string | null;
  freePhoneCover?: boolean;
  free_phone_cover?: boolean;
  tracking_history?: TrackingEvent[];
}

export default function RepairsPage() {
  const { user } = useAuth();
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchRepairs = async () => {
      setLoading(true);
      if (isSupabaseConfigured()) {
        try {
          const { data: dbRepairs, error } = await supabase
            .from("repairs")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (error) throw error;
          setRepairs(dbRepairs || []);
        } catch (e) {
          console.error("Error fetching repairs:", e);
        }
      } else {
        // Fallback: load mock repairs from localStorage
        const mockRepairsData = localStorage.getItem("sc_mock_repairs");
        if (mockRepairsData) {
          setRepairs(JSON.parse(mockRepairsData));
        } else {
          // Set a default mock repair for demonstration
          const defaultMockRepairs: Repair[] = [
            {
              id: "rep_mock987",
              created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              device_model: "iPhone 15 Pro",
              issue_description: "Cracked screen replacement & battery replacement requested",
              status: "repairing",
              estimate_cost: 12500.00,
              estimate_time: "1-2 Business Days",
              warranty_months: 6,
              warranty_expiry: null,
              tracking_history: [
                {
                  status: "booked",
                  notes: "Repair request registered online. Pick up scheduled.",
                  timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                  status: "picked_up",
                  notes: "Device picked up by our service agent Shailesh.",
                  timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
                },
                {
                  status: "inspecting",
                  notes: "Screen damage and battery degradation confirmed. Preparing components.",
                  timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
                },
                {
                  status: "repairing",
                  notes: "Our technician is installing the OEM screen glass replacement.",
                  timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
                }
              ]
            }
          ];
          localStorage.setItem("sc_mock_repairs", JSON.stringify(defaultMockRepairs));
          setRepairs(defaultMockRepairs);
        }
      }
      setLoading(false);
    };

    fetchRepairs();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Define status steps
  const statusSteps = [
    { label: "Booked", value: "booked" },
    { label: "Picked Up", value: "picked_up" },
    { label: "Inspecting", value: "inspecting" },
    { label: "Repairing", value: "repairing" },
    { label: "Repaired", value: "repaired" },
    { label: "Out for Delivery", value: "out_for_delivery" },
    { label: "Delivered", value: "delivered" }
  ];

  const getStepIndex = (status: string) => {
    return statusSteps.findIndex(s => s.value === status.toLowerCase());
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "booked":
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
      case "picked_up":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "inspecting":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "repairing":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "repaired":
        return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
      case "out_for_delivery":
        return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
      case "delivered":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10">
          <Wrench className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Repair History</h2>
          <p className="text-xs text-muted-foreground">Booked jobs, real-time tracking, and device service logs</p>
        </div>
      </div>

      {repairs.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-border flex flex-col items-center justify-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <Wrench className="h-8 w-8" />
          </div>
          <div className="max-w-sm">
            <h3 className="font-semibold text-foreground text-base">No active repair bookings</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Your device repair history is currently empty. Need a screen replacement, battery swap, or diagnostics?
            </p>
          </div>
          <Link
            href="/pickup"
            className="px-6 py-2.5 bg-foreground text-background text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            Book a Phone Repair
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {repairs.map((repair) => {
            const currentStep = getStepIndex(repair.status);
            
            return (
              <div key={repair.id} className="glass-card rounded-2xl border border-border p-6 space-y-6">
                
                {/* Top header row */}
                <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-border/50">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Device Model</span>
                    <h3 className="text-lg font-bold text-foreground mt-0.5">{repair.device_model}</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-lg">{repair.issue_description}</p>
                    
                    {(repair.freePhoneCover || repair.free_phone_cover || repair.issue_description?.includes("FREE PHONE COVER")) && (
                      <span className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wider">
                        <Gift className="h-3 w-3 text-emerald-400" /> FREE PHONE COVER: Included
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 text-right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(repair.status)}`}>
                      {repair.status.replace("_", " ").toUpperCase()}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">Job ID: {repair.id}</span>
                  </div>
                </div>

                {/* Stepped progress bar */}
                <div className="hidden lg:block w-full">
                  <div className="flex items-center justify-between relative px-2">
                    {/* Background Progress bar line */}
                    <div className="absolute top-4 left-0 right-0 h-1 bg-muted -z-10 rounded-full">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                        style={{ width: `${(Math.max(0, currentStep) / (statusSteps.length - 1)) * 100}%` }}
                      />
                    </div>

                    {statusSteps.map((step, idx) => {
                      const isCompleted = idx < currentStep;
                      const isCurrent = idx === currentStep;
                      
                      return (
                        <div key={step.value} className="flex flex-col items-center">
                          <div 
                            className={`h-9 w-9 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                              isCompleted 
                                ? "bg-emerald-500 border-emerald-500 text-white" 
                                : isCurrent 
                                  ? "bg-background border-emerald-500 text-emerald-500 scale-110 shadow-lg ring-4 ring-emerald-500/10" 
                                  : "bg-muted border-border text-muted-foreground"
                            }`}
                          >
                            {idx + 1}
                          </div>
                          <span className={`text-[10px] font-semibold mt-2 ${isCurrent ? "text-emerald-500 font-bold" : "text-muted-foreground"}`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Basic Mobile Progress Indicator */}
                <div className="lg:hidden flex items-center justify-between bg-muted/30 px-4 py-3 rounded-xl border border-border/50 text-xs">
                  <span className="text-muted-foreground font-medium">Tracking Status:</span>
                  <span className="font-bold text-emerald-500">
                    Step {currentStep + 1} of {statusSteps.length} ({statusSteps[currentStep]?.label})
                  </span>
                </div>

                {/* Pricing & Estimation Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-muted/20 p-4 rounded-xl border border-border/40 text-xs">
                  <div className="flex items-center gap-2.5">
                    <DollarSign className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <div>
                      <span className="text-muted-foreground block font-medium">Estimated Cost</span>
                      <span className="font-bold text-foreground">
                        {repair.estimate_cost ? formatINR(repair.estimate_cost) : "Under Review"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <div>
                      <span className="text-muted-foreground block font-medium">Estimated Time</span>
                      <span className="font-semibold text-foreground">
                        {repair.estimate_time || "Pending Inspection"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <div>
                      <span className="text-muted-foreground block font-medium">Quality Check</span>
                      <span className="font-semibold text-foreground">
                        Quality Verified
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tracking logs */}
                {repair.tracking_history && repair.tracking_history.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">Tracking Logs</h4>
                    <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-border/60">
                      {repair.tracking_history.map((log, index) => (
                        <div key={index} className="flex gap-4 items-start pl-6 relative">
                          <div className={`absolute left-[5px] top-[6px] h-2.5 w-2.5 rounded-full border border-background ${index === repair.tracking_history!.length - 1 ? 'bg-emerald-500 ring-4 ring-emerald-500/10' : 'bg-muted-foreground'}`} />
                          <div className="text-xs space-y-0.5">
                            <span className="font-semibold text-foreground block capitalize">{log.status.replace("_", " ")}</span>
                            <p className="text-muted-foreground">{log.notes}</p>
                            <span className="text-[10px] text-muted-foreground/80 font-mono block">
                              {new Date(log.timestamp).toLocaleString("en-IN", {
                                hour: "numeric",
                                minute: "numeric",
                                hour12: true,
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

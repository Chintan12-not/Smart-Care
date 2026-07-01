"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Wrench, 
  Smartphone, 
  MapPin, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Send, 
  ShieldCheck, 
  Info,
  CheckCircle2,
  AlertCircle,
  MessageSquare
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { formatINR, calculateRepairEstimate } from "@/lib/utils";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

interface RepairTicket {
  id: string;
  deviceModel: string;
  issue: string;
  pickupMethod: string;
  estimate: { cost: number; time: string };
  status: "booked" | "picked_up" | "inspecting" | "repairing" | "repaired" | "delivered";
  createdAt: string;
}

const ISSUES = [
  { value: "broken_screen", label: "Broken Display / Glass Replacement", defaultCost: 2499 },
  { value: "battery_drain", label: "Battery Drains Fast / Replacement", defaultCost: 1299 },
  { value: "charging_port", label: "Not Charging / Charging Port Fault", defaultCost: 999 },
  { value: "speaker_issue", label: "Speaker / Mic Not Working", defaultCost: 899 },
  { value: "heating_slow", label: "Overheating / Constant Lagging", defaultCost: 699 },
  { value: "liquid_damage", label: "Liquid / Water Damage Diagnosis", defaultCost: 1499 },
];

export default function RepairPage() {
  const { user } = useAuth();
  
  // States
  const [deviceModel, setDeviceModel] = useState("");
  const [selectedIssue, setSelectedIssue] = useState("broken_screen");
  const [pickupMethod, setPickupMethod] = useState("doorstep");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  
  const [activeTicket, setActiveTicket] = useState<RepairTicket | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Chat States
  const [messages, setMessages] = useState<Array<{ sender: "user" | "technician"; text: string; time: string }>>([
    { sender: "technician", text: "Hello! I am your assigned technician, Rahul. Let me know if you have any questions about your device diagnostic test.", time: "Just now" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load existing mock repair ticket from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("sc_active_repair");
    if (stored) {
      try {
        setActiveTicket(JSON.parse(stored));
      } catch (e) {
        setActiveTicket(null);
      }
    }
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const currentEstimate = calculateRepairEstimate(
    ISSUES.find((i) => i.value === selectedIssue)?.label || ""
  );

  const handleBookRepair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceModel) return;

    setSubmitting(true);

    setTimeout(() => {
      const ticket: RepairTicket = {
        id: "REP-" + Math.floor(1000 + Math.random() * 9000),
        deviceModel,
        issue: ISSUES.find((i) => i.value === selectedIssue)?.label || "Other Issue",
        pickupMethod,
        estimate: currentEstimate,
        status: "booked",
        createdAt: new Date().toLocaleDateString(),
      };

      localStorage.setItem("sc_active_repair", JSON.stringify(ticket));
      setActiveTicket(ticket);
      setBookingConfirmed(true);
      setSubmitting(false);

      confetti({
        particleCount: 80,
        spread: 60,
        colors: ["#06b6d4", "#10b981"]
      });
    }, 1800);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: chatInput, time: "Just now" }]);
    const userText = chatInput;
    setChatInput("");

    // Simulate technician reply
    setTimeout(() => {
      let reply = "I am looking into this. Your device parts are ready in our central inventory.";
      if (userText.toLowerCase().includes("status") || userText.toLowerCase().includes("track")) {
        reply = "We are currently preparing to inspect the core motherboard module. I will update the timeline status shortly.";
      } else if (userText.toLowerCase().includes("cost") || userText.toLowerCase().includes("price")) {
        reply = `The estimated cost matches your booking quote: ${formatINR(activeTicket?.estimate.cost || 1499)}. No hidden fees apply.`;
      }
      setMessages((prev) => [...prev, { sender: "technician", text: reply, time: "Just now" }]);
    }, 1500);
  };

  const handleResetRepair = () => {
    localStorage.removeItem("sc_active_repair");
    setActiveTicket(null);
    setBookingConfirmed(false);
    setDeviceModel("");
  };

  // Timeline steps
  const steps = [
    { key: "booked", label: "Order Booked", desc: "Repair appointment scheduled." },
    { key: "picked_up", label: "Device Picked Up", desc: "Handed over to delivery agent." },
    { key: "inspecting", label: "Inspecting", desc: "Diagnostic testing by technician." },
    { key: "repairing", label: "Repairing", desc: "Replacing parts in workshop." },
    { key: "repaired", label: "Repaired & Tested", desc: "Full quality assurance check." },
    { key: "delivered", label: "Delivered", desc: "Device returned to user." },
  ];

  const getStepIndex = (status: string) => {
    return steps.findIndex((s) => s.key === status);
  };

  const currentStepIndex = activeTicket ? getStepIndex(activeTicket.status) : -1;

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Smartphone Repair Portal
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-normal">
          Book door-step pickups, view real-time diagnostic progress, and chat directly with your dedicated service technician.
        </p>
      </div>

      {activeTicket ? (
        /* ================= TRACK REPAIR SECTION ================= */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Timeline & Ticket Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Ticket Info Card */}
            <div className="glass-card rounded-2xl p-6 border border-cyan-500/20 bg-cyan-500/[0.01] flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-cyan-500 tracking-wider">Active Repair Job</span>
                <h3 className="font-bold text-foreground text-lg">{activeTicket.deviceModel}</h3>
                <p className="text-xs text-muted-foreground">Issue: {activeTicket.issue} | Created: {activeTicket.createdAt}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold">Estimated Cost</span>
                  <span className="text-base font-extrabold text-foreground">{formatINR(activeTicket.estimate.cost)}</span>
                </div>
                <button
                  onClick={handleResetRepair}
                  className="px-3 py-1.5 rounded-lg border border-border text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50"
                >
                  New Booking
                </button>
              </div>
            </div>

            {/* Progress Timeline */}
            <div className="glass-card rounded-2xl p-8 border border-border space-y-6">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-cyan-500" />
                Live Repair Tracker
              </h3>
              
              <div className="relative pl-6 border-l border-border/80 space-y-8 ml-3">
                {steps.map((step, idx) => {
                  const isCompleted = idx < currentStepIndex;
                  const isActive = idx === currentStepIndex;
                  
                  return (
                    <div key={step.key} className="relative">
                      {/* Node Bullet */}
                      <span className={cn(
                        "absolute -left-[31px] top-0 h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                        isCompleted 
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : isActive
                          ? "bg-cyan-500 border-cyan-500 text-white animate-pulse"
                          : "bg-card border-border text-muted-foreground"
                      )}>
                        {isCompleted && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </span>

                      <div className="space-y-0.5">
                        <h4 className={cn(
                          "text-xs font-bold transition-colors",
                          isActive ? "text-cyan-500 text-sm" : isCompleted ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {step.label}
                        </h4>
                        <p className="text-[11px] text-muted-foreground">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Technician Chat Widget */}
          <div className="glass-card rounded-2xl border border-border flex flex-col h-[60vh] overflow-hidden shadow-sm">
            {/* Chat header */}
            <div className="px-5 py-3.5 border-b border-border bg-muted/40 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold text-xs">
                R
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Rahul (Technician)</h4>
                <span className="text-[9px] text-emerald-500 font-semibold block">Online & Assigned</span>
              </div>
            </div>

            {/* Chat Feed */}
            <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-muted/10">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2 text-xs leading-normal",
                    msg.sender === "user"
                      ? "bg-foreground text-background font-medium ml-auto"
                      : "bg-card border border-border text-foreground"
                  )}
                >
                  {msg.text}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Chat input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-card">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask Rahul a question..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-grow bg-muted border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="p-2 rounded-lg bg-foreground text-background disabled:opacity-50 transition-opacity"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </div>

        </div>
      ) : (
        /* ================= BOOK REPAIR FORM ================= */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Column */}
          <form onSubmit={handleBookRepair} className="lg:col-span-2 glass-card rounded-2xl p-8 border border-border space-y-6">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2 border-b border-border/50 pb-3">
              <Wrench className="h-4.5 w-4.5 text-cyan-500" />
              Schedule Repair Appointment
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Brand & Model */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Device Model</label>
                <div className="relative">
                  <Smartphone className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="e.g. iPhone 14 Pro, OnePlus 11"
                    value={deviceModel}
                    onChange={(e) => setDeviceModel(e.target.value)}
                    required
                    className="w-full bg-muted border border-border rounded-xl py-3 pl-11 pr-4 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Issue Category */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Select Issue Type</label>
                <select
                  value={selectedIssue}
                  onChange={(e) => setSelectedIssue(e.target.value)}
                  className="w-full bg-muted border border-border rounded-xl px-3.5 py-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  {ISSUES.map((issue) => (
                    <option key={issue.value} value={issue.value}>
                      {issue.label}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Pickup Method */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-muted-foreground block">Pickup / Drop-off Preference</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPickupMethod("doorstep")}
                  className={cn(
                    "p-4 rounded-xl border text-left flex flex-col gap-1 transition-all",
                    pickupMethod === "doorstep"
                      ? "bg-cyan-500/5 border-cyan-500/60"
                      : "bg-muted/40 border-border hover:bg-muted"
                  )}
                >
                  <strong className="text-xs font-bold text-foreground">Free Doorstep Pickup</strong>
                  <span className="text-[10px] text-muted-foreground">Agent visits your home for pickup.</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPickupMethod("store_drop")}
                  className={cn(
                    "p-4 rounded-xl border text-left flex flex-col gap-1 transition-all",
                    pickupMethod === "store_drop"
                      ? "bg-cyan-500/5 border-cyan-500/60"
                      : "bg-muted/40 border-border hover:bg-muted"
                  )}
                >
                  <strong className="text-xs font-bold text-foreground">Store Drop-off</strong>
                  <span className="text-[10px] text-muted-foreground">Drop at our Sector 15 Kendra.</span>
                </button>
              </div>
            </div>

            {/* Shipping Address (Doorstep pickup) */}
            {pickupMethod === "doorstep" && (
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Pickup Address</label>
                <textarea
                  placeholder="Street details, building, sector, pin code"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none min-h-[60px]"
                />
              </div>
            )}

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground">Diagnostic details / Notes (Optional)</label>
              <textarea
                placeholder="Include details about drop history, minor glitches, speaker static, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none min-h-[60px]"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-foreground text-background font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:opacity-90 shadow-sm uppercase tracking-wider"
            >
              {submitting ? (
                <span className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Wrench className="h-4 w-4" />
                  Confirm Repair Booking
                </>
              )}
            </button>
          </form>

          {/* Pricing Quote Column */}
          <div className="space-y-6">
            
            {/* Estimate Summary */}
            <div className="glass-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <Info className="h-4.5 w-4.5 text-cyan-500" />
                Live Price Estimate
              </h3>
              
              <div className="space-y-3 font-medium text-xs">
                <div className="flex justify-between pb-2.5 border-b border-border/50">
                  <span className="text-muted-foreground">Selected Issue:</span>
                  <span className="text-foreground text-right max-w-[150px] truncate">
                    {ISSUES.find((i) => i.value === selectedIssue)?.label.split(" / ")[0]}
                  </span>
                </div>
                <div className="flex justify-between pb-2.5 border-b border-border/50">
                  <span className="text-muted-foreground">Technician diagnostic fee:</span>
                  <span className="text-emerald-500 font-semibold">FREE (With repair)</span>
                </div>
                <div className="flex justify-between pb-2.5 border-b border-border/50">
                  <span className="text-muted-foreground">Estimated turn-around:</span>
                  <span className="text-foreground">{currentEstimate.time}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-muted-foreground text-sm">Estimated Total Cost:</span>
                  <strong className="text-foreground text-base font-extrabold">{formatINR(currentEstimate.cost)}</strong>
                </div>
              </div>
            </div>

            {/* Quality badge card */}
            <div className="glass-card rounded-2xl p-6 border border-emerald-500/10 bg-emerald-500/[0.01] space-y-3.5">
              <div className="flex items-center gap-2 text-emerald-500">
                <ShieldCheck className="h-5 w-5" />
                <h4 className="font-bold text-xs">Smart Care Assurance</h4>
              </div>
              <ul className="space-y-2.5 text-[11px] text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>3-Months Warranty on replaced parts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Certified technicians using quality equipment.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>No-fix-no-fee safety policy.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

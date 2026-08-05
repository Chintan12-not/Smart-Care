"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Send, 
  Wrench, 
  Smartphone, 
  ChevronRight, 
  Info, 
  Zap, 
  ShieldCheck,
  Cpu,
  RotateCcw,
  Star,
  Check
} from "lucide-react";
import { cn, calculateRepairEstimate, formatINR } from "@/lib/utils";
import Link from "next/link";

interface Message {
  role: "user" | "model";
  content: string;
  estimate?: { cost: number; time: string };
  suggestRepair?: boolean;
}

const TROUBLESHOOT_PRESETS = [
  { text: "My phone isn't charging.", label: "Charging Issue" },
  { text: "My battery drains fast.", label: "Battery Drain" },
  { text: "My display is broken.", label: "Broken Screen" },
  { text: "My phone is heating up.", label: "Overheating" },
  { text: "My speaker isn't working.", label: "Speaker Issue" },
];

export default function MobileAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content: "Hello! I am your AI Mobile Assistant. Let me help diagnose your smartphone hardware issues and estimate repair costs instantly. \n\nSelect a common issue below or describe your problem in detail.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Append user message
    const userMsg: Message = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/v1/ai/mobile/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await response.json();
      
      if (data.success && data.data?.message) {
        // Calculate dynamically matching estimate
        const estimate = calculateRepairEstimate(textToSend);
        
        // Flag to display repair booking buttons
        const suggestRepair = true;

        setMessages((prev) => [
          ...prev, 
          { 
            role: "model", 
            content: data.data.message,
            estimate,
            suggestRepair
          }
        ]);
      } else {
        setMessages((prev) => [...prev, { role: "model", content: "Apologies, I encountered an issue processing your diagnostic query. Please try again." }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "model", content: "Connection timeout occurred. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  // Keyword-based local products recommendation compiler
  const getProductRecommendations = (text: string) => {
    const textLower = text.toLowerCase();
    const recommendations = [];
    
    if (textLower.includes("charge") || textLower.includes("charger") || textLower.includes("port") || textLower.includes("cable") || textLower.includes("not charging")) {
      recommendations.push({
        id: "acc-1",
        name: "UltraCharge 30W Dual Port Fast Charger",
        price: 1499,
        image: "/placeholder_acc.png"
      });
      recommendations.push({
        id: "acc-2",
        name: "DuraThread Type-C Braided Cable (2m)",
        price: 499,
        image: "/placeholder_acc.png"
      });
    }
    
    if (textLower.includes("battery") || textLower.includes("drain") || textLower.includes("heating") || textLower.includes("hot") || textLower.includes("lag")) {
      recommendations.push({
        id: "acc-6",
        name: "PowerVolt 20000mAh Power Bank (22.5W)",
        price: 1999,
        image: "/placeholder_acc.png"
      });
    }

    if (textLower.includes("screen") || textLower.includes("glass") || textLower.includes("display") || textLower.includes("crack") || textLower.includes("scratch") || textLower.includes("broken")) {
      recommendations.push({
        id: "acc-3",
        name: "ArmorGlass Tempered Glass Screen Protector",
        price: 799,
        image: "/placeholder_acc.png"
      });
      recommendations.push({
        id: "acc-4",
        name: "AeroShield Clear Case with MagSafe",
        price: 1199,
        image: "/placeholder_acc.png"
      });
    }

    return recommendations;
  };

  const handleResetChat = () => {
    setMessages([
      {
        role: "model",
        content: "Hello! I am your AI Mobile Assistant. Let me help diagnose your smartphone hardware issues and estimate repair costs instantly. \n\nSelect a common issue below or describe your problem in detail.",
      },
    ]);
  };

  return (
    <div className="flex-grow flex flex-col md:flex-row max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
      
      {/* Sidebar: Diagnostic Guidelines */}
      <div className="w-full md:w-80 space-y-6 flex-shrink-0">
        
        {/* Cost & Speed Info Card */}
        <div className="glass-card rounded-2xl p-6 border border-border space-y-4">
          <div className="flex items-center gap-2 text-cyan-500">
            <ShieldCheck className="h-5 w-5" />
            <h3 className="font-bold text-sm">Genuine Spare Parts</h3>
          </div>
          <div className="space-y-3.5 text-xs text-muted-foreground leading-normal">
            <p>
              Our technicians use **OEM-grade premium components** for screen, battery, and camera replacements, ensuring maximum reliability.
            </p>
            <div className="border-t border-border/50 pt-3 flex justify-between items-center">
              <div>
                <span className="text-[9px] uppercase font-bold text-cyan-500 tracking-wider">
                  Diagnostics fee
                </span>
                <p className="text-emerald-500 font-bold mt-0.5">FREE</p>
              </div>
              <button
                onClick={handleResetChat}
                className="p-2 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground flex items-center gap-1"
                title="Reset conversation"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold">Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Diagnostic Presets List */}
        <div className="glass-card rounded-2xl p-6 border border-border space-y-3.5">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="h-4 w-4 text-cyan-500" />
            Troubleshooting Shortcuts
          </h3>
          <div className="flex flex-col gap-2">
            {TROUBLESHOOT_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handleSendMessage(preset.text)}
                className="w-full text-left px-3.5 py-3 rounded-xl bg-muted/40 hover:bg-muted text-xs font-semibold text-foreground border border-border/40 hover:border-border transition-all flex items-center justify-between"
              >
                <span>{preset.label}</span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Main Diagnostic Chat Hub */}
      <div className="flex-grow glass-card rounded-3xl border border-border flex flex-col h-[70vh] overflow-hidden shadow-sm">
        
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-card/50">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </span>
            <div>
              <h2 className="font-bold text-foreground text-sm">AI Mobile Assistant</h2>
              <span className="inline-flex items-center gap-1 text-[10px] text-cyan-500 font-semibold uppercase tracking-wider">
                Hardware Diagnostics
              </span>
            </div>
          </div>
        </div>

        {/* Chat Feed */}
        <div className="flex-grow p-6 overflow-y-auto space-y-5 bg-muted/20">
          {messages.map((msg, index) => {
            const recommendations = msg.role === "model" ? getProductRecommendations(msg.content) : [];
            
            return (
              <div key={index} className="space-y-3">
                <div
                  className={cn(
                    "flex flex-col max-w-[85%] rounded-2xl px-4 py-3.5 text-sm leading-relaxed animate-in fade-in duration-200",
                    msg.role === "user"
                      ? "self-end bg-foreground text-background font-medium ml-auto"
                      : "bg-card border border-border text-foreground self-start"
                  )}
                >
                  <div className="whitespace-pre-line text-xs md:text-sm">
                    {msg.content}
                  </div>
                </div>

                {/* Display Estimate Widget inside chat block */}
                {msg.role === "model" && msg.estimate && (
                  <div className="flex flex-col gap-3.5 max-w-[85%] rounded-2xl p-4 bg-gradient-to-r from-cyan-500/5 to-emerald-500/5 border border-cyan-500/15 self-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-cyan-500 uppercase tracking-wider">
                      <Wrench className="h-4 w-4" />
                      <span>Instant Repair Quote Estimate</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold border-y border-border/50 py-2.5 my-1">
                      <div>
                        <span className="text-muted-foreground text-[10px] block uppercase">Estimated Cost:</span>
                        <strong className="text-foreground text-sm font-extrabold">{formatINR(msg.estimate.cost)}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-[10px] block uppercase">Service Duration:</span>
                        <strong className="text-foreground text-sm font-extrabold">{msg.estimate.time}</strong>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href="/repair"
                        className="px-4 py-2.5 rounded-xl bg-foreground text-background text-[10px] font-bold hover:opacity-90 transition-opacity flex items-center gap-1 shadow-sm uppercase tracking-wider"
                      >
                        Book Doorstep Repair
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                )}

                {/* Display compatible products recommendations inside chat feed */}
                {msg.role === "model" && recommendations.length > 0 && (
                  <div className="space-y-2 max-w-[85%] self-start animate-in fade-in duration-300">
                    <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest block">
                      Recommended Accessories for this issue:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {recommendations.map(p => (
                        <div key={p.id} className="p-3 rounded-2xl bg-card border border-border flex items-center justify-between gap-3 hover:border-cyan-500/20 transition-all">
                          <div className="flex items-center gap-2 truncate">
                            <div className="h-9 w-9 rounded-lg bg-muted border border-border/80 overflow-hidden flex items-center justify-center flex-shrink-0">
                              <img src={p.image} alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder_acc.png'; }} />
                            </div>
                            <div className="truncate">
                              <h4 className="font-bold text-[10px] text-foreground truncate">{p.name}</h4>
                              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{formatINR(p.price)}</p>
                            </div>
                          </div>
                          <Link href={`/accessories/${p.id}`} className="p-1 rounded-lg bg-muted border border-border/80 text-muted-foreground hover:text-foreground">
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {loading && (
            <div className="bg-card border border-border text-foreground self-start rounded-2xl px-4 py-3 text-sm max-w-[150px] flex items-center gap-2">
              <span className="h-2 w-2 bg-cyan-500 rounded-full animate-bounce" />
              <span className="h-2 w-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="h-2 w-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input panel */}
        <div className="p-4 border-t border-border bg-card/30">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Describe your device issue (e.g. My phone screen is cracked)..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-grow bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-3 rounded-xl bg-foreground text-background disabled:opacity-50 transition-opacity hover:opacity-90 flex items-center justify-center"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}

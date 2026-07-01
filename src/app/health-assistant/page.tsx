"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  HeartPulse, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  Languages, 
  ShieldAlert, 
  HelpCircle, 
  AlertTriangle,
  MapPin,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "model";
  content: string;
  isEmergency?: boolean;
}

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi (हिंदी)" },
  { code: "gu", name: "Gujarati (ગુજરાતી)" },
  { code: "pb", name: "Punjabi (ਪੰਜਾਬੀ)" },
  { code: "ta", name: "Tamil (தமிழ்)" },
  { code: "te", name: "Telugu (తెలుగు)" },
  { code: "mr", name: "Marathi (मराठी)" },
  { code: "bn", name: "Bengali (বাংলা)" },
  { code: "ml", name: "Malayalam (മലയാളം)" },
  { code: "kn", name: "Kannada (ಕನ್ನಡ)" },
  { code: "ur", name: "Urdu (اردو)" },
];

const SUGGESTIONS = [
  { text: "Suggest lifestyle tips to manage high blood pressure.", label: "Hypertension Tips" },
  { text: "How can I improve my sleep quality?", label: "Sleep Hygiene" },
  { text: "What are some general dietary recommendations for joint health?", label: "Joint Health" },
  { text: "Tips for managing screen-induced eye strain.", label: "Eye Care" },
];

export default function HealthAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content: "Namaste! I am your AI Health Assistant. I can help guide you with general wellness advice, nutrition tips, and health education. \n\n*Note: I am not a doctor and do not diagnose illnesses. In case of emergency, please consult a physician immediately.*",
    },
  ]);
  const [input, setInput] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isRecording, setIsRecording] = useState(false);
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
      const response = await fetch("/api/v1/ai/health/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend, language: selectedLanguage }),
      });

      const data = await response.json();
      
      if (data.success && data.data?.message) {
        const isEmergency = data.data.message.includes("EMERGENCY WARNING");
        setMessages((prev) => [...prev, { role: "model", content: data.data.message, isEmergency }]);
      } else {
        setMessages((prev) => [...prev, { role: "model", content: "Apologies, I encountered an issue processing that query. Please try again." }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "model", content: "Network error occurred. Please check your internet connection." }]);
    } finally {
      setLoading(false);
    }
  };

  // Simulate speech recording
  const handleVoiceToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      // Mock captured voice query
      setInput("Generic alternatives for Paracetamol 650mg");
    } else {
      setIsRecording(true);
      setErrorState("");
    }
  };

  const [errorState, setErrorState] = useState("");

  return (
    <div className="flex-grow flex flex-col md:flex-row max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
      
      {/* Sidebar: Health Warnings & Multi-language Selection */}
      <div className="w-full md:w-80 space-y-6 flex-shrink-0">
        
        {/* Language selector */}
        <div className="glass-card rounded-2xl p-6 border border-border space-y-3">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Languages className="h-4 w-4 text-emerald-500" />
            Language / भाषा / மொழி
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Safety Warnings Card */}
        <div className="glass-card rounded-2xl p-6 border border-red-500/10 bg-red-500/[0.02] space-y-4">
          <div className="flex items-center gap-2 text-red-500">
            <ShieldAlert className="h-5 w-5" />
            <h3 className="font-bold text-sm">Medical Safety Guards</h3>
          </div>
          <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
            <p className="flex gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span><strong>No Diagnoses:</strong> The assistant helps describe conditions but does not diagnose illnesses.</span>
            </p>
            <p className="flex gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span><strong>No Prescriptions:</strong> It will never advise on or prescribe schedule prescription drugs.</span>
            </p>
            <p className="border-t border-red-500/10 pt-3 text-[11px] font-semibold text-foreground">
              Always consult a licensed doctor for personalized medical assessments.
            </p>
          </div>
        </div>

      </div>

      {/* Main Chat Workspace */}
      <div className="flex-grow glass-card rounded-3xl border border-border flex flex-col h-[70vh] overflow-hidden shadow-sm">
        
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-card/50">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <HeartPulse className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-bold text-foreground text-sm">AI Health Assistant</h2>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500 font-semibold uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                Online & Secure
              </span>
            </div>
          </div>
        </div>

        {/* Chat Feed */}
        <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-muted/20">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={cn(
                "flex flex-col max-w-[85%] rounded-2xl px-4 py-3.5 text-sm leading-relaxed",
                msg.role === "user"
                  ? "self-end bg-foreground text-background font-medium ml-auto"
                  : msg.isEmergency
                  ? "bg-red-500/10 border border-red-500/20 text-red-500"
                  : "bg-card border border-border text-foreground"
              )}
            >
              <div className="whitespace-pre-line text-xs md:text-sm">
                {msg.content}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="bg-card border border-border text-foreground self-start rounded-2xl px-4 py-3 text-sm max-w-[150px] flex items-center gap-2">
              <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce" />
              <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Active Speech Waveform Indicator */}
        {isRecording && (
          <div className="px-6 py-3 border-t border-border bg-emerald-500/5 flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider flex items-center gap-1.5">
              <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
              Listening to voice input...
            </span>
            <div className="flex gap-1 items-center h-4">
              <span className="w-1 bg-emerald-500 h-2 rounded animate-bounce [animation-duration:0.6s]" />
              <span className="w-1 bg-emerald-500 h-4 rounded animate-bounce [animation-duration:0.4s]" />
              <span className="w-1 bg-emerald-500 h-3 rounded animate-bounce [animation-duration:0.8s]" />
              <span className="w-1 bg-emerald-500 h-1 rounded animate-bounce [animation-duration:0.5s]" />
            </div>
          </div>
        )}

        {/* Input panel & suggestions */}
        <div className="p-4 border-t border-border bg-card/30 space-y-4">
          
          {/* Quick Suggestions */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((sug) => (
                <button
                  key={sug.label}
                  onClick={() => handleSendMessage(sug.text)}
                  className="px-3 py-1.5 rounded-full border border-border text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
                >
                  {sug.label}
                </button>
              ))}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="flex gap-2"
          >
            <button
              type="button"
              onClick={handleVoiceToggle}
              className={cn(
                "p-3 rounded-xl border border-border transition-all duration-200",
                isRecording 
                  ? "bg-red-500 text-white border-red-600 animate-pulse" 
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              )}
              title="Voice Input Simulator"
            >
              {isRecording ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
            </button>

            <input
              type="text"
              placeholder="Ask about symptoms, generic medicines, side effects..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-grow bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
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

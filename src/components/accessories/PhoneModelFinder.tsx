"use client";

import React, { useState } from "react";
import { Smartphone, ChevronRight, Search, Sparkles, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import phoneData from "@/data/phoneModels.json";

// Brand Logo SVG/Emoji badges
const BRAND_METADATA: Record<string, { logoText: string; color: string; bg: string }> = {
  Apple: { logoText: "🍎", color: "text-zinc-100", bg: "from-zinc-800 to-zinc-950" },
  Samsung: { logoText: "📱", color: "text-blue-400", bg: "from-blue-900/40 to-blue-950/60" },
  OnePlus: { logoText: "🔴", color: "text-red-400", bg: "from-red-900/40 to-red-950/60" },
  Google: { logoText: "🌐", color: "text-emerald-400", bg: "from-emerald-900/40 to-emerald-950/60" },
  Xiaomi: { logoText: "🍊", color: "text-amber-400", bg: "from-amber-900/40 to-amber-950/60" },
  Vivo: { logoText: "💧", color: "text-cyan-400", bg: "from-cyan-900/40 to-cyan-950/60" },
  OPPO: { logoText: "☘️", color: "text-green-400", bg: "from-green-900/40 to-green-950/60" },
  Realme: { logoText: "⚡", color: "text-yellow-400", bg: "from-yellow-900/40 to-yellow-950/60" },
  POCO: { logoText: "🟡", color: "text-yellow-500", bg: "from-yellow-900/40 to-amber-950/60" },
  Redmi: { logoText: "💥", color: "text-rose-400", bg: "from-rose-900/40 to-rose-950/60" },
};

interface PhoneModelFinderProps {
  onSelectModel?: (brand: string, model: string) => void;
  isCompact?: boolean;
}

export default function PhoneModelFinder({ onSelectModel, isCompact = false }: PhoneModelFinderProps) {
  const router = useRouter();

  const [selectedBrand, setSelectedBrand] = useState<string>("Apple");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const brands = phoneData.brands;
  const brandModelsMap = phoneData.brandModels as Record<string, Array<{ id: string; name: string; series: string }>>;

  const currentModels = brandModelsMap[selectedBrand] || [];

  const filteredModels = currentModels.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.series.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBrandClick = (brand: string) => {
    setSelectedBrand(brand);
    setSelectedModel("");
    setSearchQuery("");
  };

  const handleModelSelect = (modelName: string) => {
    setSelectedModel(modelName);
    if (onSelectModel) {
      onSelectModel(selectedBrand, modelName);
    } else {
      router.push(`/accessories?brand=${encodeURIComponent(selectedBrand)}&model=${encodeURIComponent(modelName)}`);
    }
  };

  const handleExploreClick = () => {
    const modelToPass = selectedModel || (currentModels[0]?.name ?? "");
    if (onSelectModel) {
      onSelectModel(selectedBrand, modelToPass);
    } else {
      router.push(`/accessories?brand=${encodeURIComponent(selectedBrand)}&model=${encodeURIComponent(modelToPass)}`);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 select-none">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
          Phone Cases & Accessories Made For Your Exact Model
        </span>

        <h2 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
          Find the <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Perfect Accessories</span> for Your Phone
        </h2>

        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Choose your exact brand & phone model to explore custom-fit cases, tempered glass screen guards, fast chargers & premium cables from ₹99.
        </p>
      </div>

      {/* Main Glass Card Finder Widget */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/30 bg-gradient-to-b from-indigo-950/30 via-background to-background shadow-2xl space-y-6 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Step 1: Pick Your Brand */}
        <div className="space-y-3 relative z-10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-xs border border-indigo-500/30">
              1
            </div>
            <div>
              <h3 className="font-black text-foreground text-sm flex items-center gap-2">
                <span>Pick your phone brand below</span>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  {brands.length} Brands Available
                </span>
              </h3>
              <p className="text-[11px] text-muted-foreground">Select your phone manufacturer to list matching models.</p>
            </div>
          </div>

          {/* Brands Horizontal Scroll / Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
            {brands.map((b) => {
              const isSelected = selectedBrand === b;
              const meta = BRAND_METADATA[b] || { logoText: "📱", color: "text-foreground", bg: "from-muted to-card" };
              const count = (brandModelsMap[b] || []).length;

              return (
                <button
                  key={b}
                  onClick={() => handleBrandClick(b)}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between group active:scale-[0.98] ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-500/15 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500"
                      : "border-border/60 bg-card/60 hover:bg-muted/60 hover:border-border"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl shrink-0">{meta.logoText}</span>
                    <div className="truncate">
                      <span className="font-extrabold text-xs text-foreground block truncate">{b}</span>
                      <span className="text-[9px] text-muted-foreground font-semibold block">{count} models</span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="h-5 w-5 rounded-full bg-indigo-500 text-black flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Pick Your Model */}
        <div className="space-y-3.5 pt-2 border-t border-border/50 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-black text-xs border border-purple-500/30">
                2
              </div>
              <div>
                <h3 className="font-black text-foreground text-sm">
                  Select your <span className="text-indigo-400 font-black">{selectedBrand}</span> model
                </h3>
                <p className="text-[11px] text-muted-foreground">Type to search or choose your model below.</p>
              </div>
            </div>

            {/* Model Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${selectedBrand} models...`}
                className="w-full bg-muted/60 border border-border/80 rounded-xl pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Model Chips Grid */}
          <div className="max-h-56 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {filteredModels.length === 0 ? (
              <div className="col-span-full py-8 text-center text-xs text-muted-foreground">
                No {selectedBrand} model matching "{searchQuery}". Try a different keyword.
              </div>
            ) : (
              filteredModels.map((m) => {
                const isSelected = selectedModel === m.name;
                return (
                  <button
                    key={m.id + m.name}
                    onClick={() => handleModelSelect(m.name)}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all text-left truncate flex items-center justify-between ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-500 text-black shadow-md font-black"
                        : "border-border/60 bg-muted/30 text-foreground hover:bg-muted/80 hover:border-border"
                    }`}
                    title={m.name}
                  >
                    <span className="truncate">{m.name}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 shrink-0 stroke-[3] ml-1" />}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Step 3: Explore Button */}
        <div className="pt-3 border-t border-border/50 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground text-center sm:text-left">
            {selectedModel ? (
              <span>Selected: <strong className="text-indigo-400 font-extrabold">{selectedBrand} {selectedModel}</strong></span>
            ) : (
              <span>Showing all <strong>{selectedBrand}</strong> compatible cases & accessories.</span>
            )}
          </div>

          <button
            onClick={handleExploreClick}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white font-black text-xs uppercase tracking-wider hover:opacity-95 shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>Show Accessories for {selectedModel || selectedBrand}</span>
            <ChevronRight className="h-4 w-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
}

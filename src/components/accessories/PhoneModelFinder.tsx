"use client";

import React, { useState } from "react";
import { Smartphone, ChevronRight, Search, Check, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import phoneData from "@/data/phoneModels.json";

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
      <div className="text-center space-y-2.5">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          <Smartphone className="h-3.5 w-3.5" />
          Model-Specific Compatibility Finder
        </span>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Find Accessories Built for <span className="text-emerald-500">Your Phone</span>
        </h2>

        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Select your brand and model below to view custom-fit covers, drop-tested cases, tempered glass & chargers.
        </p>
      </div>

      {/* Main Glass Card Configurator */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-border bg-card shadow-xl space-y-6">
        
        {/* Step 1: Pick Brand */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold flex items-center justify-center border border-emerald-500/20">
                1
              </span>
              <h3 className="font-bold text-foreground text-sm">Select Phone Brand</h3>
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">
              {phoneData.allModels.length} Models Supported Across {brands.length} Brands
            </span>
          </div>

          {/* Brands Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {brands.map((b) => {
              const isSelected = selectedBrand === b;
              const count = (brandModelsMap[b] || []).length;

              return (
                <button
                  key={b}
                  onClick={() => handleBrandClick(b)}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between group active:scale-[0.98] ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-500/10 shadow-sm ring-1 ring-emerald-500 text-foreground"
                      : "border-border/80 bg-muted/30 text-foreground hover:bg-muted/70 hover:border-border"
                  }`}
                >
                  <div className="min-w-0">
                    <span className="font-extrabold text-xs block truncate">{b}</span>
                    <span className="text-[10px] text-muted-foreground font-medium block">{count} models</span>
                  </div>
                  {isSelected && (
                    <div className="h-4 w-4 rounded-full bg-emerald-500 text-black flex items-center justify-center shrink-0">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Select Model */}
        <div className="space-y-3.5 pt-4 border-t border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-sky-500/10 text-sky-500 text-xs font-bold flex items-center justify-center border border-sky-500/20">
                2
              </span>
              <h3 className="font-bold text-foreground text-sm">
                Choose <span className="text-emerald-500 font-extrabold">{selectedBrand}</span> Model
              </h3>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${selectedBrand} models...`}
                className="w-full bg-muted/50 border border-border/80 rounded-xl pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          {/* Model Chips Grid */}
          <div className="max-h-52 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {filteredModels.length === 0 ? (
              <div className="col-span-full py-8 text-center text-xs text-muted-foreground">
                No {selectedBrand} model matching "{searchQuery}". Try typing another model name.
              </div>
            ) : (
              filteredModels.map((m) => {
                const isSelected = selectedModel === m.name;
                return (
                  <button
                    key={m.id + m.name}
                    onClick={() => handleModelSelect(m.name)}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all text-left truncate flex items-center justify-between ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500 text-black font-extrabold shadow-sm"
                        : "border-border/60 bg-muted/20 text-foreground hover:bg-muted/70 hover:border-border"
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
        <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground text-center sm:text-left font-medium">
            {selectedModel ? (
              <span>Selected: <strong className="text-emerald-500 font-bold">{selectedBrand} {selectedModel}</strong></span>
            ) : (
              <span>Browse compatible accessories for <strong>{selectedBrand}</strong></span>
            )}
          </div>

          <button
            onClick={handleExploreClick}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-foreground text-background hover:bg-foreground/90 font-extrabold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
          >
            <span>Show Accessories for {selectedModel || selectedBrand}</span>
            <ChevronRight className="h-4 w-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
}

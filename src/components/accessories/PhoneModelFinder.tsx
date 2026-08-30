"use client";

import React, { useState } from "react";
import { Smartphone, ChevronRight, Search, Check, Sparkles, RotateCcw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import phoneData from "@/data/phoneModels.json";

interface PhoneModelFinderProps {
  onSelectModel?: (brand: string, model: string) => void;
  isCompact?: boolean;
  initialBrand?: string;
  initialModel?: string;
  availableBrands?: string[];
}

export default function PhoneModelFinder({
  onSelectModel,
  isCompact = false,
  initialBrand = "Apple",
  initialModel = "",
  availableBrands
}: PhoneModelFinderProps) {
  const router = useRouter();

  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand || "Apple");
  const [selectedModel, setSelectedModel] = useState<string>(initialModel || "");
  const [searchQuery, setSearchQuery] = useState<string>("");

  React.useEffect(() => {
    if (initialBrand) setSelectedBrand(initialBrand);
    if (initialModel !== undefined) setSelectedModel(initialModel);
  }, [initialBrand, initialModel]);

  const rawBrands = availableBrands && availableBrands.length > 0 ? availableBrands : phoneData.brands;
  // Ensure unique case-preserved brand list memoized
  const brands = React.useMemo(() => Array.from(new Set([...rawBrands, ...phoneData.brands])), [rawBrands]);
  const brandModelsMap = phoneData.brandModels as Record<string, Array<{ id: string; name: string; series: string }>>;

  const currentModels = React.useMemo(() => brandModelsMap[selectedBrand] || [], [brandModelsMap, selectedBrand]);

  const filteredModels = React.useMemo(() => {
    if (!searchQuery) return currentModels;
    const query = searchQuery.toLowerCase();
    return currentModels.filter(m =>
      m.name.toLowerCase().includes(query) ||
      m.series.toLowerCase().includes(query)
    );
  }, [currentModels, searchQuery]);

  const handleBrandClick = (brand: string) => {
    setSelectedBrand(brand);
    setSelectedModel("");
    setSearchQuery("");
    if (onSelectModel) {
      onSelectModel(brand, "");
    }
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
    if (onSelectModel) {
      onSelectModel(selectedBrand, selectedModel);
    } else {
      if (selectedModel) {
        router.push(`/accessories?brand=${encodeURIComponent(selectedBrand)}&model=${encodeURIComponent(selectedModel)}`);
      } else {
        router.push(`/accessories?brand=${encodeURIComponent(selectedBrand)}`);
      }
    }
  };

  const handleClearSelection = () => {
    setSelectedBrand("Apple");
    setSelectedModel("");
    setSearchQuery("");
    if (onSelectModel) {
      onSelectModel("", "");
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
          Select your brand and model below to view custom-fit covers, drop-tested cases, tempered glass &amp; chargers.
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
            <div className="flex items-center gap-3">
              {(selectedModel || searchQuery) && (
                <button
                  onClick={handleClearSelection}
                  className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 text-[11px] font-bold border border-red-500/20 flex items-center gap-1 transition-all"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Clear Selection</span>
                </button>
              )}
              <span className="text-[11px] text-muted-foreground font-medium hidden sm:inline">
                {phoneData.allModels.length} Models Supported Across {brands.length} Brands
              </span>
            </div>
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
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="w-full bg-muted/50 border border-border/80 rounded-xl pl-9 pr-8 py-2 text-base sm:text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                  title="Clear search text"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
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
          <div className="text-xs text-muted-foreground text-center sm:text-left font-medium flex items-center gap-2">
            {selectedModel ? (
              <>
                <span>Selected: <strong className="text-emerald-500 font-bold">{selectedBrand} {selectedModel}</strong></span>
                <button
                  onClick={handleClearSelection}
                  className="text-[10px] text-red-400 hover:text-red-300 font-bold underline flex items-center gap-0.5 ml-1"
                  title="Clear selected model"
                >
                  <X className="h-3 w-3" />
                  Clear
                </button>
              </>
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

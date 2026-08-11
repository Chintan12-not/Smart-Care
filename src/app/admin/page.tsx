"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { 
  Plus, 
  Trash2, 
  ShoppingBag, 
  ArrowLeft, 
  Database, 
  CheckCircle, 
  XCircle, 
  Tag, 
  DollarSign, 
  Layers, 
  Box, 
  Star,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Info,
  Building2,
  Phone,
  Mail,
  MessageSquare,
  Search,
  Filter,
  Eye,
  FileText
} from "lucide-react";
import Link from "next/link";
import { formatINR, cn } from "@/lib/utils";
import phoneData from "@/data/phoneModels.json";
import { getB2BInquiries, updateB2BInquiryStatus, B2BInquiryData } from "@/lib/appwrite";

interface DbAccessory {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  stock_quantity: number;
  rating_avg: number;
  reviews_count: number;
  images: string[];
  is_active: boolean;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  // Db connection states
  const [products, setProducts] = useState<DbAccessory[]>([]);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState("case");
  const [brand, setBrand] = useState("Apple");
  const [customBrand, setCustomBrand] = useState("");
  const [targetModel, setTargetModel] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("50");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<"accessories" | "estimator" | "b2b">("accessories");

  // B2B Inquiries States (Appwrite Backend)
  const [b2bInquiries, setB2bInquiries] = useState<B2BInquiryData[]>([]);
  const [b2bLoading, setB2bLoading] = useState(false);
  const [b2bSearch, setB2bSearch] = useState("");
  const [b2bStatusFilter, setB2bStatusFilter] = useState("All");
  const [selectedB2bInquiry, setSelectedB2bInquiry] = useState<B2BInquiryData | null>(null);

  const loadB2bInquiries = async () => {
    setB2bLoading(true);
    try {
      const data = await getB2BInquiries();
      setB2bInquiries(data);
    } catch (e) {
      console.error("Failed to load B2B inquiries:", e);
    } finally {
      setB2bLoading(false);
    }
  };

  // Estimator Configuration States
  interface EstimatorConfig {
    id?: string;
    brand: string;
    multiplier: number;
    screen_base_price: number;
    battery_base_price: number;
    speaker_base_price: number;
    diagnostics_base_price: number;
    other_base_price: number;
  }

  const [configs, setConfigs] = useState<EstimatorConfig[]>([]);
  const [estBrand, setEstBrand] = useState("");
  const [estMultiplier, setEstMultiplier] = useState("1.0");
  const [estScreen, setEstScreen] = useState("2499");
  const [estBattery, setEstBattery] = useState("1299");
  const [estSpeaker, setEstSpeaker] = useState("899");
  const [estDiagnostics, setEstDiagnostics] = useState("699");
  const [estOther, setEstOther] = useState("999");
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [estimatorSubmitting, setEstimatorSubmitting] = useState(false);
  const [showSqlAlert, setShowSqlAlert] = useState(false);

  // Route protection
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login?redirect=/admin");
      } else if (user.role !== "admin") {
        router.push("/dashboard");
      }
    }
  }, [user, authLoading, router]);

  // Load products from Supabase
  const loadProducts = async () => {
    if (!isSupabaseConfigured()) {
      setDbError("Supabase keys are not configured in environment variables.");
      return;
    }
    setDbLoading(true);
    setDbError(null);
    try {
      const { data, error } = await supabase
        .from("accessories")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      setDbError(err.message || "Failed to load products from database.");
    } finally {
      setDbLoading(false);
    }
  };

  const loadEstimatorConfigs = async () => {
    if (!isSupabaseConfigured()) return;
    setDbLoading(true);
    setDbError(null);
    setShowSqlAlert(false);
    try {
      const { data, error } = await supabase
        .from("repair_estimator_config")
        .select("*")
        .order("brand", { ascending: true });

      if (error) {
        if (error.message.includes("relation") || error.message.includes("public.repair_estimator_config")) {
          setShowSqlAlert(true);
          const local = localStorage.getItem("sc_estimator_config");
          if (local) {
            setConfigs(JSON.parse(local));
          } else {
            const defaults = [
              { brand: "Apple", multiplier: 1.8, screen_base_price: 2499, battery_base_price: 1299, speaker_base_price: 899, diagnostics_base_price: 699, other_base_price: 999 },
              { brand: "Samsung", multiplier: 1.4, screen_base_price: 2499, battery_base_price: 1299, speaker_base_price: 899, diagnostics_base_price: 699, other_base_price: 999 }
            ];
            setConfigs(defaults);
          }
        } else {
          throw error;
        }
      } else {
        setConfigs(data || []);
        localStorage.setItem("sc_estimator_config", JSON.stringify(data || []));
      }
    } catch (err: any) {
      setDbError(err.message || "Failed to load pricing estimator configurations.");
    } finally {
      setDbLoading(false);
    }
  };

  const handleAddConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!estBrand || !estMultiplier) {
      setDbError("Please enter a brand name and a pricing multiplier.");
      return;
    }

    setEstimatorSubmitting(true);
    setDbError(null);
    setActionSuccess(null);

    const payload = {
      brand: estBrand.trim(),
      multiplier: parseFloat(estMultiplier) || 1.0,
      screen_base_price: parseFloat(estScreen) || 2499.00,
      battery_base_price: parseFloat(estBattery) || 1299.00,
      speaker_base_price: parseFloat(estSpeaker) || 899.00,
      diagnostics_base_price: parseFloat(estDiagnostics) || 699.00,
      other_base_price: parseFloat(estOther) || 999.00,
    };

    if (isSupabaseConfigured() && !showSqlAlert) {
      try {
        const { error } = await supabase
          .from("repair_estimator_config")
          .upsert(payload, { onConflict: "brand" });

        if (error) throw error;
        setActionSuccess(`Pricing configuration for brand '${estBrand}' successfully saved to Supabase!`);
        
        // Reset form
        setEstBrand("");
        setEstMultiplier("1.0");
        setEstScreen("2499");
        setEstBattery("1299");
        setEstSpeaker("899");
        setEstDiagnostics("699");
        setEstOther("999");
        setEditingConfigId(null);
        
        loadEstimatorConfigs();
      } catch (err: any) {
        setDbError(err.message || "Failed to save configuration to Supabase.");
      } finally {
        setEstimatorSubmitting(false);
      }
    } else {
      // Offline/Local fallback
      try {
        const local = localStorage.getItem("sc_estimator_config");
        let list = local ? JSON.parse(local) : [];
        const index = list.findIndex((c: any) => c.brand.toLowerCase() === estBrand.toLowerCase());
        if (index > -1) {
          list[index] = payload;
        } else {
          list.push(payload);
        }
        localStorage.setItem("sc_estimator_config", JSON.stringify(list));
        setConfigs(list);
        setActionSuccess(`Pricing configuration for brand '${estBrand}' saved locally!`);
        
        setEstBrand("");
        setEstMultiplier("1.0");
        setEstScreen("2499");
        setEstBattery("1299");
        setEstSpeaker("899");
        setEstDiagnostics("699");
        setEstOther("999");
        setEditingConfigId(null);
      } catch (err: any) {
        setDbError(err.message || "Failed to save locally.");
      } finally {
        setEstimatorSubmitting(false);
      }
    }
  };

  const handleDeleteConfig = async (brandName: string) => {
    setDbError(null);
    setActionSuccess(null);

    if (isSupabaseConfigured() && !showSqlAlert) {
      try {
        const { error } = await supabase
          .from("repair_estimator_config")
          .delete()
          .eq("brand", brandName);

        if (error) throw error;
        setActionSuccess(`Pricing config for '${brandName}' successfully deleted.`);
        loadEstimatorConfigs();
      } catch (err: any) {
        setDbError(err.message || "Failed to delete config from database.");
      }
    } else {
      const local = localStorage.getItem("sc_estimator_config");
      if (local) {
        let list = JSON.parse(local);
        const filtered = list.filter((c: any) => c.brand !== brandName);
        localStorage.setItem("sc_estimator_config", JSON.stringify(filtered));
        setConfigs(filtered);
        setActionSuccess(`Pricing config for '${brandName}' removed from local storage.`);
      }
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      loadProducts();
      loadEstimatorConfigs();
      loadB2bInquiries();
    }
  }, [user]);

  // Add accessory handler
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalBrand = brand === "other" ? customBrand.trim() : brand;
    if (!name || !price || !finalBrand) {
      setDbError("Please fill out all required fields.");
      return;
    }

    setSubmitting(true);
    setDbError(null);
    setActionSuccess(null);

    const priceNum = parseFloat(price);
    const stockNum = parseInt(stockQuantity) || 0;
    
    // Fallback default image or clean input list
    const imagesArray = imageUrl.trim() ? [imageUrl.trim()] : ["/placeholder_acc.png"];

    const finalModel = targetModel && targetModel !== "Universal / All Models" ? targetModel : "";

    const specs: Record<string, string> = {
      "Brand": finalBrand,
    };
    if (finalModel) {
      specs["Compatible Model"] = finalModel;
    } else {
      specs["Compatibility"] = "Universal / All Models";
    }

    let finalTitle = name.trim();
    if (finalModel && !finalTitle.toLowerCase().includes(finalModel.toLowerCase())) {
      finalTitle = `${finalTitle} (${finalModel})`;
    }

    try {
      const { data, error } = await supabase
        .from("accessories")
        .insert([
          {
            name: finalTitle,
            category,
            brand: finalBrand,
            price: priceNum,
            stock_quantity: stockNum,
            description: description || null,
            images: imagesArray,
            is_active: isActive,
            rating_avg: 4.8,
            reviews_count: 15,
            specifications: specs
          }
        ])
        .select();

      if (error) throw error;

      setActionSuccess(`Product "${finalTitle}" added successfully!`);
      // Reset form
      setName("");
      setPrice("");
      setTargetModel("");
      setStockQuantity("50");
      setDescription("");
      setImageUrl("");
      setIsActive(true);

      // Reload
      loadProducts();
    } catch (err: any) {
      setDbError(err.message || "Failed to add product.");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle active status
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setDbError(null);
    setActionSuccess(null);
    try {
      const { error } = await supabase
        .from("accessories")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      setActionSuccess("Product status updated successfully.");
      loadProducts();
    } catch (err: any) {
      setDbError(err.message || "Failed to update product status.");
    }
  };

  // Delete product handler
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this product from Supabase?")) return;

    setDbError(null);
    setActionSuccess(null);
    try {
      const { error } = await supabase
        .from("accessories")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setActionSuccess("Product deleted successfully.");
      loadProducts();
    } catch (err: any) {
      setDbError(err.message || "Failed to delete product from database.");
    }
  };

  const filteredB2bInquiries = b2bInquiries.filter((inquiry) => {
    const matchesSearch =
      inquiry.name.toLowerCase().includes(b2bSearch.toLowerCase()) ||
      inquiry.companyName.toLowerCase().includes(b2bSearch.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(b2bSearch.toLowerCase()) ||
      inquiry.phone.toLowerCase().includes(b2bSearch.toLowerCase()) ||
      inquiry.product.toLowerCase().includes(b2bSearch.toLowerCase());

    const matchesStatus = b2bStatusFilter === "All" || inquiry.status === b2bStatusFilter;

    return matchesSearch && matchesStatus;
  });

  if (authLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 pt-8 border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation & Status Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="p-2 rounded-xl bg-muted border border-border hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Admin Control Center</h1>
            </div>
            <p className="text-xs text-muted-foreground pl-10">Manage database entries for Smart Care & Mobile Point shop catalog.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pl-10 sm:pl-0">
            {isSupabaseConfigured() ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/25">
                <CheckCircle className="h-3.5 w-3.5" />
                Supabase Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-wider border border-red-500/25">
                <XCircle className="h-3.5 w-3.5" />
                Supabase Offline
              </span>
            )}
            <span className="px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-500 text-[10px] font-bold uppercase tracking-wider border border-cyan-500/25">
              Admin Access
            </span>
          </div>
        </div>

        {/* Global Notifications */}
        {dbError && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs font-semibold leading-relaxed flex items-start gap-2 animate-in fade-in duration-200">
            <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>{dbError}</p>
          </div>
        )}
        {actionSuccess && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl text-xs font-semibold leading-relaxed flex items-start gap-2 animate-in fade-in duration-200">
            <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>{actionSuccess}</p>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex border-b border-border gap-4 my-2">
          <button
            onClick={() => setActiveTab("accessories")}
            className={cn(
              "pb-3 text-sm font-bold uppercase tracking-wider transition-all duration-200 border-b-2 px-2",
              activeTab === "accessories"
                ? "border-cyan-500 text-cyan-500"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Shop Accessories
          </button>
          <button
            onClick={() => setActiveTab("estimator")}
            className={cn(
              "pb-3 text-sm font-bold uppercase tracking-wider transition-all duration-200 border-b-2 px-2",
              activeTab === "estimator"
                ? "border-cyan-500 text-cyan-500"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            AI Checker Pricing
          </button>
          <button
            onClick={() => {
              setActiveTab("b2b");
              loadB2bInquiries();
            }}
            className={cn(
              "pb-3 text-sm font-bold uppercase tracking-wider transition-all duration-200 border-b-2 px-2 flex items-center gap-1.5",
              activeTab === "b2b"
                ? "border-purple-500 text-purple-400 font-extrabold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Building2 className="h-4 w-4 text-purple-400" />
            <span>B2B Bulk Inquiries ({b2bInquiries.length})</span>
          </button>
        </div>

        {activeTab === "accessories" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Side (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-card rounded-3xl p-6 border border-border shadow-md space-y-6 bg-card">
              <div className="flex items-center gap-2 text-cyan-500 border-b border-border/60 pb-3">
                <Plus className="h-5 w-5" />
                <h2 className="font-bold text-sm uppercase tracking-wider">Add Accessory Product</h2>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-4">
                
                {/* Product Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5 text-cyan-500" />
                    Product Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 20W USB-C Fast Charger"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 font-semibold"
                  />
                </div>

                {/* Category & Brand */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5 text-cyan-500" />
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 font-semibold"
                    >
                      <option value="case">Cases & Covers</option>
                      <option value="tempered_glass">Tempered Glass</option>
                      <option value="charger">Charger & Power</option>
                      <option value="audio">Audio & Sound</option>
                      <option value="power_bank">Power Bank</option>
                      <option value="other">Other Accessories</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                      <Box className="h-3.5 w-3.5 text-cyan-500" />
                      Brand <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={brand}
                      onChange={(e) => {
                        setBrand(e.target.value);
                        setTargetModel("");
                      }}
                      className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 font-semibold"
                    >
                      {phoneData.brands.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                      <option value="other">Other / Custom Brand</option>
                    </select>
                  </div>
                </div>

                {/* Custom Brand Input (if Other selected) */}
                {brand === "other" && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Custom Brand Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anker, Belkin, Boat"
                      value={customBrand}
                      onChange={(e) => setCustomBrand(e.target.value)}
                      className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 font-semibold"
                    />
                  </div>
                )}

                {/* Compatible Phone Model Selection from Excel dataset */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-cyan-500" />
                    Target Compatible Model (608 Models Dataset)
                  </label>
                  <select
                    value={targetModel}
                    onChange={(e) => setTargetModel(e.target.value)}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 font-semibold"
                  >
                    <option value="">Universal / All {brand !== "other" ? brand : ""} Models</option>
                    {brand !== "other" && ((phoneData.brandModels as any)[brand] || []).map((m: any) => (
                      <option key={m.id + m.name} value={m.name}>
                        {brand} {m.name} ({m.series} Series)
                      </option>
                    ))}
                  </select>
                  <p className="text-[9px] text-muted-foreground">
                    Selecting an exact model automatically tags the accessory for customer search & filter matching.
                  </p>
                </div>

                {/* Price & Stock */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5 text-cyan-500" />
                      Price (INR) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      placeholder="e.g. 1499"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                      <Box className="h-3.5 w-3.5 text-cyan-500" />
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 50"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 font-semibold"
                    />
                  </div>
                </div>

                {/* Image URL */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-cyan-500" />
                    Product Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="e.g. https://example.com/charger.png"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 font-semibold"
                  />
                  <p className="text-[9px] text-muted-foreground/80 pl-1">Leave empty to use generic fallback mock image placeholder.</p>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-cyan-500" />
                    Specifications & Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Premium quality charger with safety features and intelligent auto cut-off..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 font-medium placeholder:text-muted-foreground/60"
                  />
                </div>

                {/* Active Checkbox */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className="text-cyan-500 hover:opacity-90 transition-opacity"
                  >
                    {isActive ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8 text-muted-foreground" />}
                  </button>
                  <div>
                    <span className="text-xs font-bold text-foreground block">Is Active / Listed</span>
                    <span className="text-[9px] text-muted-foreground">Visible on the client-facing accessories page.</span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-foreground hover:opacity-90 disabled:opacity-50 text-background font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 mt-4 shadow-sm"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving to Supabase...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Insert into Supabase
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* List Side (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-card rounded-3xl p-6 border border-border shadow-md space-y-4 bg-card">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2 text-cyan-500">
                  <ShoppingBag className="h-5 w-5" />
                  <h2 className="font-bold text-sm uppercase tracking-wider">Catalog Database Entries ({products.length})</h2>
                </div>
                <button 
                  onClick={loadProducts}
                  className="px-2.5 py-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground text-[10px] font-bold uppercase tracking-wider border border-border"
                >
                  Refresh
                </button>
              </div>

              {dbLoading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
                  <span className="text-xs font-medium">Querying accessories list...</span>
                </div>
              ) : products.length === 0 ? (
                <div className="py-20 text-center bg-muted/10 border border-dashed border-border rounded-2xl space-y-3">
                  <Database className="h-8 w-8 text-muted-foreground/60 mx-auto" />
                  <p className="text-xs text-muted-foreground font-semibold">No products found in Supabase.</p>
                  <p className="text-[10px] text-muted-foreground/80 max-w-sm mx-auto">Fill out the form on the left to insert your first catalog items. It will instantly show up on the shop page!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {products.map((prod) => (
                    <div 
                      key={prod.id} 
                      className="p-3.5 rounded-2xl bg-muted/30 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-cyan-500/20 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-card border border-border/80 overflow-hidden flex items-center justify-center flex-shrink-0 relative">
                          <img 
                            src={prod.images && prod.images.length > 0 ? prod.images[0] : "/placeholder_acc.png"} 
                            alt="" 
                            className="h-full w-full object-cover" 
                            onError={(e) => { e.currentTarget.src = '/placeholder_acc.png'; }}
                          />
                        </div>
                        <div className="truncate space-y-0.5">
                          <h4 className="font-bold text-xs text-foreground truncate max-w-[250px]">{prod.name}</h4>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="font-semibold uppercase text-cyan-500">{prod.brand}</span>
                            <span>•</span>
                            <span className="capitalize">{prod.category.replace("_", " ")}</span>
                            <span>•</span>
                            <span>Stock: <strong className="text-foreground">{prod.stock_quantity}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/50">
                        <span className="font-extrabold text-xs text-foreground">{formatINR(prod.price)}</span>
                        
                        <div className="flex items-center gap-1.5">
                          {/* Toggle Active status */}
                          <button
                            onClick={() => handleToggleActive(prod.id, prod.is_active)}
                            className={`p-1.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider transition-colors ${
                              prod.is_active 
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/25 hover:bg-emerald-500/20" 
                                : "bg-red-500/10 text-red-500 border-red-500/25 hover:bg-red-500/20"
                            }`}
                            title="Toggle catalog visibility"
                          >
                            {prod.is_active ? "Active" : "Inactive"}
                          </button>

                          {/* Delete from Supabase */}
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 text-red-500 transition-colors"
                            title="Delete permanently"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
        )}

        {activeTab === "estimator" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Column (5 cols) */}
            <div className="lg:col-span-5 space-y-6 animate-in fade-in duration-300">
              <div className="glass-card rounded-3xl p-6 border border-border shadow-md space-y-6 bg-card">
                <div className="flex items-center gap-2 text-cyan-500 border-b border-border/60 pb-3">
                  <Plus className="h-5 w-5" />
                  <h2 className="font-bold text-sm uppercase tracking-wider">Configure Brand Pricing</h2>
                </div>

                <form onSubmit={handleAddConfig} className="space-y-4">
                  {/* Brand Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">
                      Brand Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apple, Samsung, OnePlus"
                      value={estBrand}
                      onChange={(e) => setEstBrand(e.target.value)}
                      className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 font-semibold"
                    />
                  </div>

                  {/* Multiplier */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">
                      Pricing Multiplier <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="5.0"
                      required
                      value={estMultiplier}
                      onChange={(e) => setEstMultiplier(e.target.value)}
                      className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 font-semibold"
                    />
                  </div>

                  {/* Base Prices Header */}
                  <h3 className="text-[10px] uppercase font-bold text-cyan-500 border-t border-border/40 pt-3">
                    Repair Issue Base Costs (₹)
                  </h3>

                  {/* Screen & Battery */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground">Screen Repair</label>
                      <input
                        type="number"
                        required
                        value={estScreen}
                        onChange={(e) => setEstScreen(e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground">Battery Swap</label>
                      <input
                        type="number"
                        required
                        value={estBattery}
                        onChange={(e) => setEstBattery(e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 font-semibold"
                      />
                    </div>
                  </div>

                  {/* Speaker & Diagnostics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground">Speaker / Mic</label>
                      <input
                        type="number"
                        required
                        value={estSpeaker}
                        onChange={(e) => setEstSpeaker(e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground">Diagnostics</label>
                      <input
                        type="number"
                        required
                        value={estDiagnostics}
                        onChange={(e) => setEstDiagnostics(e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 font-semibold"
                      />
                    </div>
                  </div>

                  {/* Other General Issues */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Other Issues Base Price</label>
                    <input
                      type="number"
                      required
                      value={estOther}
                      onChange={(e) => setEstOther(e.target.value)}
                      className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 font-semibold"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={estimatorSubmitting}
                    className="w-full mt-4 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2.5 rounded-xl transition-all duration-200 text-xs shadow-md flex items-center justify-center gap-2"
                  >
                    {estimatorSubmitting ? (
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Save Brand Config"
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* List Column (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {showSqlAlert && (
                <div className="glass-card rounded-3xl p-6 border border-amber-500/25 bg-amber-500/5 space-y-3">
                  <div className="flex items-center gap-2 text-amber-500">
                    <Info className="h-5 w-5" />
                    <h3 className="font-bold text-xs uppercase tracking-wider">Supabase Table Config</h3>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    The <code>repair_estimator_config</code> table does not exist in your Supabase database yet. Local configurations will be used instead.
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed border-t border-amber-500/10 pt-2 font-mono text-[9px] whitespace-pre-wrap select-all">
{`CREATE TABLE IF NOT EXISTS public.repair_estimator_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand TEXT NOT NULL UNIQUE,
    multiplier NUMERIC(4,2) NOT NULL DEFAULT 1.0,
    screen_base_price NUMERIC(10,2) NOT NULL DEFAULT 2499.00,
    battery_base_price NUMERIC(10,2) NOT NULL DEFAULT 1299.00,
    speaker_base_price NUMERIC(10,2) NOT NULL DEFAULT 899.00,
    diagnostics_base_price NUMERIC(10,2) NOT NULL DEFAULT 699.00,
    other_base_price NUMERIC(10,2) NOT NULL DEFAULT 999.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.repair_estimator_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select" ON public.repair_estimator_config FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.repair_estimator_config FOR ALL USING (true);`}
                  </p>
                </div>
              )}

              <div className="glass-card rounded-3xl p-6 border border-border bg-card shadow-md space-y-4">
                <div className="flex justify-between items-center border-b border-border/60 pb-3">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-cyan-500">Configured Brands ({configs.length})</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground font-bold">
                        <th className="py-2.5 px-2">Brand</th>
                        <th className="py-2.5 px-2">Multiplier</th>
                        <th className="py-2.5 px-2">Screen</th>
                        <th className="py-2.5 px-2">Battery</th>
                        <th className="py-2.5 px-2">Diagnostics</th>
                        <th className="py-2.5 px-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {configs.map((c) => (
                        <tr key={c.brand} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-2 font-bold text-foreground">{c.brand}</td>
                          <td className="py-3 px-2 text-cyan-500 font-bold">{c.multiplier}x</td>
                          <td className="py-3 px-2 text-muted-foreground">₹{c.screen_base_price}</td>
                          <td className="py-3 px-2 text-muted-foreground">₹{c.battery_base_price}</td>
                          <td className="py-3 px-2 text-muted-foreground">₹{c.diagnostics_base_price}</td>
                          <td className="py-3 px-2 text-right">
                            <button
                              onClick={() => {
                                setEstBrand(c.brand);
                                setEstMultiplier(c.multiplier.toString());
                                setEstScreen(c.screen_base_price.toString());
                                setEstBattery(c.battery_base_price.toString());
                                setEstSpeaker(c.speaker_base_price.toString());
                                setEstDiagnostics(c.diagnostics_base_price.toString());
                                setEstOther(c.other_base_price.toString());
                              }}
                              className="text-cyan-500 hover:underline mr-3 font-semibold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteConfig(c.brand)}
                              className="text-red-500 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 10. B2B CORPORATE INQUIRIES TAB */}
        {activeTab === "b2b" && (
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 border border-purple-500/30 bg-card shadow-md space-y-6">
              
              {/* Header Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-4">
                <div>
                  <h2 className="font-extrabold text-lg text-foreground flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-purple-400" />
                    <span>Corporate & Bulk Order Inquiries</span>
                    <span className="text-xs font-bold text-purple-400 uppercase bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                      Appwrite B2B Database
                    </span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Manage real-time customer bulk quotes, update pipeline statuses, and initiate direct customer contact.
                  </p>
                </div>

                <button
                  onClick={loadB2bInquiries}
                  className="px-4 py-2 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 text-xs font-bold transition-all flex items-center gap-1.5 self-start md:self-auto"
                >
                  <Loader2 className={`h-3.5 w-3.5 ${b2bLoading ? "animate-spin" : ""}`} />
                  <span>Refresh Inquiries</span>
                </button>
              </div>

              {/* Search & Status Filter Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8 relative">
                  <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={b2bSearch}
                    onChange={(e) => setB2bSearch(e.target.value)}
                    placeholder="Search by customer name, company, email, phone, or product..."
                    className="w-full bg-muted/60 border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                  />
                </div>

                <div className="sm:col-span-4 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                  <select
                    value={b2bStatusFilter}
                    onChange={(e) => setB2bStatusFilter(e.target.value)}
                    className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500 font-bold"
                  >
                    <option value="All">All Statuses ({b2bInquiries.length})</option>
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Quotation Sent">Quotation Sent</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="PO Received">PO Received</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Inquiries Table */}
              <div className="overflow-x-auto">
                {b2bLoading ? (
                  <div className="py-16 text-center text-xs text-muted-foreground space-y-2">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-400 mx-auto" />
                    <p>Fetching B2B inquiries from Appwrite database...</p>
                  </div>
                ) : filteredB2bInquiries.length === 0 ? (
                  <div className="py-16 text-center text-xs text-muted-foreground bg-muted/20 border border-border/40 rounded-2xl">
                    No B2B inquiries match your search or filter.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-3">Customer</th>
                        <th className="py-3 px-3">Company</th>
                        <th className="py-3 px-3">Product Required</th>
                        <th className="py-3 px-3">Quantity</th>
                        <th className="py-3 px-3">Location</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Date</th>
                        <th className="py-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {filteredB2bInquiries.map((inquiry) => {
                        const statusClass = 
                          inquiry.status === "New" ? "bg-purple-500/10 text-purple-400 border-purple-500/30 font-black" :
                          inquiry.status === "Contacted" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" :
                          inquiry.status === "Quotation Sent" ? "bg-blue-500/10 text-blue-400 border-blue-500/30" :
                          inquiry.status === "PO Received" || inquiry.status === "Completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                          inquiry.status === "Cancelled" ? "bg-red-500/10 text-red-400 border-red-500/30" :
                          "bg-amber-500/10 text-amber-400 border-amber-500/30";

                        return (
                          <tr key={inquiry.$id || inquiry.email + inquiry.createdAt} className="hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-3">
                              <span className="font-extrabold text-foreground block">{inquiry.name}</span>
                              <span className="text-[10px] text-muted-foreground block">{inquiry.phone}</span>
                            </td>
                            <td className="py-3 px-3 font-semibold text-foreground">{inquiry.companyName}</td>
                            <td className="py-3 px-3 font-semibold text-cyan-400">{inquiry.product}</td>
                            <td className="py-3 px-3 font-extrabold text-foreground">{inquiry.quantity} Pcs</td>
                            <td className="py-3 px-3 text-muted-foreground truncate max-w-[120px]">{inquiry.deliveryLocation}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase border font-bold ${statusClass}`}>
                                {inquiry.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-muted-foreground text-[10px]">
                              {inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleDateString("en-IN") : "Recent"}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => setSelectedB2bInquiry(inquiry)}
                                className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-bold text-[11px] border border-purple-500/20 transition-all flex items-center gap-1 ml-auto"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>Details</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 11. INQUIRY DETAILS MODAL FOR ADMIN */}
        {selectedB2bInquiry && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-xl bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="flex justify-between items-start border-b border-border pb-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                    B2B Inquiry Details
                  </span>
                  <h3 className="text-lg font-black text-foreground mt-1">{selectedB2bInquiry.companyName}</h3>
                  <p className="text-xs text-muted-foreground">ID: {selectedB2bInquiry.$id || "Appwrite-Doc"}</p>
                </div>
                <button
                  onClick={() => setSelectedB2bInquiry(null)}
                  className="p-1.5 rounded-xl bg-muted text-muted-foreground hover:text-foreground"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              {/* Detail Sections */}
              <div className="space-y-4 text-xs">
                
                {/* Customer Section */}
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 space-y-2">
                  <h4 className="font-extrabold text-foreground uppercase tracking-wider text-[10px] text-purple-400">
                    Customer Information
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Name</span>
                      <span className="font-bold text-foreground block">{selectedB2bInquiry.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Work Email</span>
                      <a href={`mailto:${selectedB2bInquiry.email}`} className="font-bold text-cyan-400 hover:underline block truncate">
                        {selectedB2bInquiry.email}
                      </a>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Phone Number</span>
                      <a href={`tel:${selectedB2bInquiry.phone}`} className="font-bold text-foreground hover:underline block">
                        {selectedB2bInquiry.phone}
                      </a>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Company</span>
                      <span className="font-bold text-foreground block">{selectedB2bInquiry.companyName}</span>
                    </div>
                  </div>
                </div>

                {/* Requirement Section */}
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 space-y-2">
                  <h4 className="font-extrabold text-foreground uppercase tracking-wider text-[10px] text-cyan-400">
                    Order Requirement
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Product / Category</span>
                      <span className="font-extrabold text-foreground block">{selectedB2bInquiry.product}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Required Quantity</span>
                      <span className="font-black text-purple-400 block text-sm">{selectedB2bInquiry.quantity} Units</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Delivery Location</span>
                      <span className="font-bold text-foreground block">{selectedB2bInquiry.deliveryLocation}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Expected Date</span>
                      <span className="font-bold text-foreground block">
                        {selectedB2bInquiry.expectedPurchaseDate || "Not Specified"}
                      </span>
                    </div>
                  </div>
                  {selectedB2bInquiry.requirements && (
                    <div className="pt-2 border-t border-border/40 mt-2">
                      <span className="text-muted-foreground block text-[10px]">Additional Notes / Branding</span>
                      <p className="font-medium text-foreground bg-card p-2.5 rounded-xl border border-border/40 mt-1 leading-relaxed">
                        {selectedB2bInquiry.requirements}
                      </p>
                    </div>
                  )}
                </div>

                {/* Tracking & Status Update Section */}
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 space-y-3">
                  <h4 className="font-extrabold text-foreground uppercase tracking-wider text-[10px] text-amber-400">
                    Status & Pipeline Control
                  </h4>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground font-semibold">Change Inquiry Status:</span>
                    <select
                      value={selectedB2bInquiry.status}
                      onChange={async (e) => {
                        const newStat = e.target.value as B2BInquiryData["status"];
                        if (selectedB2bInquiry.$id) {
                          await updateB2BInquiryStatus(selectedB2bInquiry.$id, newStat);
                          setSelectedB2bInquiry({ ...selectedB2bInquiry, status: newStat });
                          loadB2bInquiries();
                        }
                      }}
                      className="bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground font-extrabold focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Quotation Sent">Quotation Sent</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="PO Received">PO Received</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <a
                    href={`tel:${selectedB2bInquiry.phone}`}
                    className="py-3 rounded-xl bg-card border border-border hover:bg-muted text-foreground font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="h-4 w-4 text-cyan-400" />
                    <span>Call</span>
                  </a>

                  <a
                    href={`mailto:${selectedB2bInquiry.email}?subject=${encodeURIComponent(
                      `Bulk Order Quotation - ${selectedB2bInquiry.product} (${selectedB2bInquiry.companyName})`
                    )}`}
                    className="py-3 rounded-xl bg-card border border-border hover:bg-muted text-foreground font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Mail className="h-4 w-4 text-indigo-400" />
                    <span>Email</span>
                  </a>

                  <a
                    href={`https://wa.me/${selectedB2bInquiry.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `Hi ${selectedB2bInquiry.name}, this is Smart Care & Mobile Point regarding your bulk inquiry for ${selectedB2bInquiry.quantity} units of ${selectedB2bInquiry.product}. Here is your custom quotation:`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 rounded-xl bg-emerald-500 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-400 transition-colors shadow-sm"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>WhatsApp</span>
                  </a>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

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
  FileText,
  ToggleLeft,
  ToggleRight,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { formatINR } from "@/lib/utils";

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
  const [category, setCategory] = useState("charger");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("50");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    if (user && user.role === "admin") {
      loadProducts();
    }
  }, [user]);

  // Add accessory handler
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !brand) {
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

    try {
      const { data, error } = await supabase
        .from("accessories")
        .insert([
          {
            name,
            category,
            brand,
            price: priceNum,
            stock_quantity: stockNum,
            description: description || null,
            images: imagesArray,
            is_active: isActive,
            rating_avg: 4.5,
            reviews_count: 12,
            specifications: {}
          }
        ])
        .select();

      if (error) throw error;

      setActionSuccess("Product added successfully!");
      // Reset form
      setName("");
      setBrand("");
      setPrice("");
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
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Accessories Admin Control Center</h1>
            </div>
            <p className="text-xs text-muted-foreground pl-10">Manage database entries for Smart Care & Mobile Point shop catalog.</p>
          </div>

          <div className="flex items-center gap-3 pl-10 sm:pl-0">
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

        {/* Grid split */}
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
                      <option value="charger">Charger & Power</option>
                      <option value="case">Cases & Covers</option>
                      <option value="tempered_glass">Tempered Glass</option>
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
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apple, Anker"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 font-semibold"
                    />
                  </div>
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

      </div>
    </div>
  );
}

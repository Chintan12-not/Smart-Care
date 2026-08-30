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
  Pencil,
  Save,
  FileText,
  Check,
  Smartphone,
  X,
  Gift,
  Truck
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
  original_price?: number | null;
  stock_quantity: number;
  in_stock?: boolean;
  is_on_sale?: boolean;
  rating_avg: number;
  reviews_count: number;
  images: string[];
  description?: string | null;
  specifications?: Record<string, string>;
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
  const [compatibleModels, setCompatibleModels] = useState(""); // e.g. "iPhone 13, iPhone 15, iPhone 15 Plus"
  const [modelSearchQuery, setModelSearchQuery] = useState("");
  const [modelBrandTab, setModelBrandTab] = useState<string>("Apple");

  // Sync model brand tab when main brand dropdown changes
  useEffect(() => {
    if (brand && brand !== "other" && (phoneData.brands as string[]).includes(brand)) {
      setModelBrandTab(brand);
    }
  }, [brand]);

  // Multi-Brand Model Selector helper logic
  const selectedModelsList = compatibleModels ? compatibleModels.split(",").map(s => s.trim()).filter(Boolean) : [];
  
  const currentTabModels = (phoneData.brandModels as Record<string, Array<{ id: string; name: string; series: string }>>)[modelBrandTab] || [];
  
  const filteredBrandModels = currentTabModels.filter(m =>
    m.name.toLowerCase().includes(modelSearchQuery.toLowerCase())
  );

  const toggleModelSelection = (modelName: string) => {
    if (selectedModelsList.includes(modelName)) {
      const nextList = selectedModelsList.filter(m => m !== modelName);
      setCompatibleModels(nextList.join(", "));
    } else {
      const nextList = [...selectedModelsList, modelName];
      setCompatibleModels(nextList.join(", "));
    }
  };

  const selectAllCurrentBrandModels = () => {
    const allNames = currentTabModels.map(m => m.name);
    const combined = Array.from(new Set([...selectedModelsList, ...allNames]));
    setCompatibleModels(combined.join(", "));
  };

  const clearSelectedModels = () => {
    setCompatibleModels("");
  };
  const [colorInput, setColorInput] = useState(""); // e.g. "Teal Blue, Matte Black, Clear"
  const [material, setMaterial] = useState("Thermoplastic Polyurethane"); // e.g. TPU, Tempered Glass, Nylon
  const [warranty, setWarranty] = useState(""); // e.g. "6 Months Smart Care Replacement Warranty"
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState(""); // Optional MRP strike price (e.g. 499)
  const [stockQuantity, setStockQuantity] = useState("50");
  const [inStock, setInStock] = useState(true); // In Stock / Out of Stock
  const [isOnSale, setIsOnSale] = useState(false); // Put on Sale toggle
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]); // Up to 10 image URLs/data URLs!
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isGeneratingAiDesc, setIsGeneratingAiDesc] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Pre-fill form for editing an existing product
  const handleStartEditProduct = (prod: DbAccessory) => {
    setEditingProductId(prod.id);
    setName(prod.name);
    setCategory(prod.category || "case");
    setBrand(prod.brand || "Apple");
    setPrice(String(prod.price || ""));
    
    const specs = prod.specifications || {};
    setOriginalPrice(prod.original_price ? String(prod.original_price) : (specs.original_price || ""));
    setStockQuantity(String(prod.stock_quantity ?? 50));
    setInStock(prod.in_stock ?? (specs.in_stock !== undefined ? specs.in_stock === "true" : true));
    setIsOnSale(prod.is_on_sale ?? (specs.is_on_sale !== undefined ? specs.is_on_sale === "true" : false));
    setDescription(prod.description || "");
    setImageUrls(prod.images && prod.images.length > 0 ? prod.images : []);
    setIsActive(prod.is_active);
    
    setCompatibleModels(specs["Compatible Phone Models"] || specs["Compatible Model"] || "");
    setColorInput(specs["Colour"] || "");
    setMaterial(specs["Material"] || "Thermoplastic Polyurethane");
    setWarranty(specs["Warranty"] || "");

    // Scroll smoothly to form top
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setName("");
    setPrice("");
    setOriginalPrice("");
    setTargetModel("");
    setCompatibleModels("");
    setColorInput("");
    setMaterial("Thermoplastic Polyurethane");
    setWarranty("");
    setStockQuantity("50");
    setInStock(true);
    setIsOnSale(false);
    setDescription("");
    setImageUrls([]);
    setIsActive(true);
  };

  // File Upload Handler (Select Image Files directly!)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 10 - imageUrls.filter(Boolean).length;
    if (remainingSlots <= 0) {
      alert("Maximum 10 images limit reached.");
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        if (base64Url) {
          setImageUrls((prev) => [...prev.filter(Boolean), base64Url].slice(0, 10));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // AI Description Generator
  const handleGenerateAiDescription = async () => {
    if (!name) {
      alert("Please enter a Product Title first.");
      return;
    }
    setIsGeneratingAiDesc(true);
    setDbError(null);
    try {
      const res = await fetch("/api/v1/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          brand: brand === "other" ? customBrand : brand,
          targetModel: compatibleModels || targetModel
        })
      });
      const data = await res.json();
      if (data.success && data.description) {
        setDescription(data.description);
        setActionSuccess("✨ AI Description generated successfully!");
      }
    } catch (e: any) {
      console.error("AI description generator error:", e);
    } finally {
      setIsGeneratingAiDesc(false);
    }
  };

  // Tab State
  const [activeTab, setActiveTab] = useState<"accessories" | "estimator" | "b2b" | "orders">("accessories");

  // Customer Orders States
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [repairBookings, setRepairBookings] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);

  const loadCustomerOrders = async () => {
    setOrdersLoading(true);
    let dbOrders: any[] = [];
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && data) {
          dbOrders = data;
        }
      } catch (e) {
        console.error("DB orders load error:", e);
      }
    }

    let localOrders: any[] = [];
    const stored = localStorage.getItem("sc_mock_orders");
    if (stored) {
      try {
        localOrders = JSON.parse(stored);
      } catch (e) {}
    }

    const combinedMap = new Map<string, any>();
    localOrders.forEach(o => combinedMap.set(o.id, o));
    dbOrders.forEach(o => combinedMap.set(o.id, o));

    const merged = Array.from(combinedMap.values()).sort(
      (a, b) => new Date(b.created_at || Date.now()).getTime() - new Date(a.created_at || Date.now()).getTime()
    );

    setCustomerOrders(merged);
    
    // Also load pickup repair bookings
    let dbRepairs: any[] = [];
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from("repairs")
          .select("*")
          .order("created_at", { ascending: false });
        if (data) dbRepairs = data;
      } catch (e) {}
    }

    let localRepairs: any[] = [];
    const storedRepairs = localStorage.getItem("sc_mock_repairs");
    if (storedRepairs) {
      try { localRepairs = JSON.parse(storedRepairs); } catch (e) {}
    }

    const repairsMap = new Map<string, any>();
    localRepairs.forEach(r => repairsMap.set(r.id, r));
    dbRepairs.forEach(r => repairsMap.set(r.id, r));

    setRepairBookings(Array.from(repairsMap.values()));
    setOrdersLoading(false);
  };

  const handleMarkDelivered = async (orderId: string) => {
    try {
      if (isSupabaseConfigured()) {
        await supabase
          .from("orders")
          .update({ status: "delivered" })
          .eq("id", orderId);
      }

      const stored = localStorage.getItem("sc_mock_orders");
      if (stored) {
        try {
          const list = JSON.parse(stored);
          const updatedList = list.map((o: any) => 
            o.id === orderId ? { ...o, status: "delivered" } : o
          );
          localStorage.setItem("sc_mock_orders", JSON.stringify(updatedList));
        } catch (e) {}
      }

      setActionSuccess(`Order #${orderId} marked as Delivered!`);
      loadCustomerOrders();
    } catch (e: any) {
      setDbError(e.message || "Failed to update order status.");
    }
  };

  const handleSendDeliveredEmail = async (order: any) => {
    const targetEmail = order.shipping_address?.email || order.email;
    if (!targetEmail) {
      alert("No customer email found for this order.");
      return;
    }

    setSendingEmailId(order.id);
    setDbError(null);
    setActionSuccess(null);

    try {
      const res = await fetch("/api/v1/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "delivered",
          to: targetEmail,
          payload: {
            order_id: order.id,
            customerName: order.shipping_address?.name || "Valued Customer",
            total_amount: order.total_amount,
            shippingAddress: order.shipping_address
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Automated Thank You email sent via Resend to ${targetEmail}!`);
      } else {
        setDbError(data.error || "Failed to send email via Resend.");
      }
    } catch (e: any) {
      setDbError(e.message || "Email dispatch failed.");
    } finally {
      setSendingEmailId(null);
    }
  };

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
    const originalPriceNum = originalPrice ? parseFloat(originalPrice) : null;
    const stockNum = parseInt(stockQuantity) || 0;
    
    // Clean and filter valid up to 10 images
    const validImages = imageUrls.map(url => url.trim()).filter(Boolean);
    const imagesArray = validImages.length > 0 ? validImages.slice(0, 10) : ["https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80"];

    const finalModel = targetModel && targetModel !== "Universal / All Models" ? targetModel : "";

    const specs: Record<string, string> = {
      "Brand": finalBrand,
      "Compatible Phone Models": compatibleModels.trim() || targetModel || "Universal / All Models",
      "Colour": colorInput.trim() || "Multi-Color / Clear",
      "Material": material.trim() || "Thermoplastic Polyurethane",
      "Warranty": warranty.trim() || "Smart Care Quality Standard",
      "original_price": originalPriceNum ? String(originalPriceNum) : "",
      "in_stock": String(inStock),
      "is_on_sale": String(isOnSale)
    };

    let finalTitle = name.trim();
    if (targetModel && !finalTitle.toLowerCase().includes(targetModel.toLowerCase())) {
      finalTitle = `${finalTitle} (${targetModel})`;
    }

    let insertedDbId: string | null = null;

    try {
      if (isSupabaseConfigured()) {
        const fullPayload: any = {
          name: finalTitle,
          category,
          brand: finalBrand,
          price: priceNum,
          original_price: originalPriceNum,
          stock_quantity: stockNum,
          in_stock: inStock,
          is_on_sale: isOnSale,
          description: description || null,
          images: imagesArray,
          is_active: isActive,
          rating_avg: 4.8,
          reviews_count: 15,
          specifications: specs
        };

        const basePayload: any = {
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
        };

        if (editingProductId) {
          // UPDATE existing product
          const { error: err1 } = await supabase
            .from("accessories")
            .update(fullPayload)
            .eq("id", editingProductId);

          if (err1) {
            console.warn("Full payload update failed, using base payload fallback:", err1.message);
            const { error: err2 } = await supabase
              .from("accessories")
              .update(basePayload)
              .eq("id", editingProductId);
            if (err2) throw err2;
          }
        } else {
          // INSERT new product
          const { data: insData, error: err1 } = await supabase.from("accessories").insert([fullPayload]).select();

          if (err1) {
            console.warn("Full payload insert failed, using base payload fallback:", err1.message);
            const { data: insData2, error: err2 } = await supabase.from("accessories").insert([basePayload]).select();
            if (err2) throw err2;
            if (insData2 && insData2[0]) insertedDbId = String(insData2[0].id);
          } else if (insData && insData[0]) {
            insertedDbId = String(insData[0].id);
          }
        }
      }

      // LocalStorage backup update
      const local = localStorage.getItem("sc_custom_accessories");
      let list = local ? JSON.parse(local) : [];

      const newItem = {
        id: editingProductId || insertedDbId || `acc-custom-${Date.now()}`,
        name: finalTitle,
        category,
        brand: finalBrand,
        price: priceNum,
        originalPrice: originalPriceNum,
        inStock,
        isOnSale,
        warranty: warranty.trim(),
        colors: colorInput.split(",").map(c => c.trim()).filter(Boolean),
        compatibleModels: compatibleModels.trim() || targetModel,
        material: material.trim(),
        description: description || "",
        image: imagesArray[0],
        images: imagesArray,
        rating: 4.9,
        reviewsCount: 18,
        specifications: specs
      };

      if (editingProductId) {
        list = list.map((item: any) => item.id === editingProductId ? newItem : item);
      } else {
        list.unshift(newItem);
      }
      localStorage.setItem("sc_custom_accessories", JSON.stringify(list));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("sc-products-updated"));
      }

      setActionSuccess(editingProductId ? `Product "${finalTitle}" updated successfully!` : `Product "${finalTitle}" added successfully!`);
      
      // Reset form
      setEditingProductId(null);
      setName("");
      setPrice("");
      setOriginalPrice("");
      setTargetModel("");
      setCompatibleModels("");
      setColorInput("");
      setMaterial("Thermoplastic Polyurethane");
      setWarranty("");
      setStockQuantity("50");
      setInStock(true);
      setIsOnSale(false);
      setDescription("");
      setImageUrls([]);
      setIsActive(true);
      setInStock(true);
      setIsOnSale(false);
      setDescription("");
      setImageUrls([]);
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
        <div className="flex border-b border-border gap-2 sm:gap-4 my-2 overflow-x-auto scrollbar-none pb-1">
          <button
            onClick={() => setActiveTab("accessories")}
            className={cn(
              "pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 border-b-2 px-2.5 sm:px-3 whitespace-nowrap shrink-0",
              activeTab === "accessories"
                ? "border-cyan-500 text-cyan-500 font-extrabold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Shop Accessories
          </button>
          <button
            onClick={() => setActiveTab("estimator")}
            className={cn(
              "pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 border-b-2 px-2.5 sm:px-3 whitespace-nowrap shrink-0",
              activeTab === "estimator"
                ? "border-cyan-500 text-cyan-500 font-extrabold"
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
              "pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 border-b-2 px-2.5 sm:px-3 flex items-center gap-1.5 whitespace-nowrap shrink-0",
              activeTab === "b2b"
                ? "border-purple-500 text-purple-400 font-extrabold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Building2 className="h-4 w-4 text-purple-400" />
            <span>B2B Bulk Inquiries ({b2bInquiries.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("orders");
              loadCustomerOrders();
            }}
            className={cn(
              "pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 border-b-2 px-2.5 sm:px-3 flex items-center gap-1.5 whitespace-nowrap shrink-0",
              activeTab === "orders"
                ? "border-emerald-500 text-emerald-400 font-extrabold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <ShoppingBag className="h-4 w-4 text-emerald-400" />
            <span>Customer Orders ({customerOrders.length})</span>
          </button>
        </div>

        {activeTab === "accessories" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Side (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-card rounded-3xl p-6 border border-border shadow-md space-y-6 bg-card">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2 text-cyan-500">
                  {editingProductId ? <Pencil className="h-5 w-5 text-amber-500" /> : <Plus className="h-5 w-5" />}
                  <h2 className="font-bold text-sm uppercase tracking-wider">
                    {editingProductId ? "Edit Accessory Product" : "Add Accessory Product"}
                  </h2>
                </div>

                {editingProductId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors text-[10px] font-bold uppercase tracking-wider"
                  >
                    Cancel Edit
                  </button>
                )}
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

                {/* Dynamic Multi-Brand & Multi-Model Compatible Devices Selector */}
                <div className="space-y-3.5 p-4 bg-muted/40 border border-border/80 rounded-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                    <div>
                      <label className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                        <Smartphone className="h-4 w-4 text-cyan-500" />
                        <span>Compatible Devices (Multi-Brand & Multi-Model Support)</span>
                      </label>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Select models across multiple brands (e.g. Samsung + Apple + OnePlus)</p>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-2">
                      {currentTabModels.length > 0 && (
                        <button
                          type="button"
                          onClick={selectAllCurrentBrandModels}
                          className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-500 text-[10px] font-bold hover:bg-cyan-500/20 transition-all"
                        >
                          Select All {modelBrandTab} ({currentTabModels.length})
                        </button>
                      )}
                      {selectedModelsList.length > 0 && (
                        <button
                          type="button"
                          onClick={clearSelectedModels}
                          className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-bold hover:bg-red-500/20 transition-all"
                        >
                          Clear All ({selectedModelsList.length})
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Brand Filter Tabs Bar */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Filter Models by Smartphone Brand:</span>
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {(phoneData.brands as string[]).map((b) => {
                        const isActiveTab = modelBrandTab === b;
                        const countInTab = (phoneData.brandModels as Record<string, Array<any>>)[b]?.length || 0;
                        return (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setModelBrandTab(b)}
                            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold whitespace-nowrap transition-all ${
                              isActiveTab
                                ? "bg-cyan-500 text-black border-cyan-500 shadow-sm"
                                : "bg-card border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            }`}
                          >
                            {b} ({countInTab})
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Selected Badges Bar */}
                  {selectedModelsList.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Selected Compatible Models ({selectedModelsList.length}):</span>
                      <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-card border border-border rounded-xl">
                        {selectedModelsList.map((m) => (
                          <span
                            key={m}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                          >
                            <span>{m}</span>
                            <button
                              type="button"
                              onClick={() => toggleModelSelection(m)}
                              className="hover:text-red-400 p-0.5 rounded-full"
                              title="Remove model"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Model Search Bar */}
                  {currentTabModels.length > 0 && (
                    <div className="relative">
                      <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder={`Search ${modelBrandTab} models (e.g. S24, A55, iPhone 15)...`}
                        value={modelSearchQuery}
                        onChange={(e) => setModelSearchQuery(e.target.value)}
                        className="w-full bg-card border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                  )}

                  {/* Model Select Chips Grid */}
                  {currentTabModels.length > 0 && (
                    <div className="max-h-48 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
                      {filteredBrandModels.length === 0 ? (
                        <div className="col-span-full py-4 text-center text-xs text-muted-foreground">
                          No {modelBrandTab} model matching "{modelSearchQuery}"
                        </div>
                      ) : (
                        filteredBrandModels.map((m) => {
                          const isSelected = selectedModelsList.includes(m.name);
                          return (
                            <button
                              key={m.id + m.name}
                              type="button"
                              onClick={() => toggleModelSelection(m.name)}
                              className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all text-left truncate flex items-center justify-between ${
                                isSelected
                                  ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 font-bold"
                                  : "bg-card border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                              }`}
                              title={m.name}
                            >
                              <span className="truncate">{m.name}</span>
                              {isSelected && <Check className="h-3 w-3 shrink-0 stroke-[3] text-emerald-500 ml-1" />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* Manual Raw String Field */}
                  <div className="pt-2 border-t border-border/40 space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                      <FileText className="h-3 w-3 text-cyan-500" />
                      Comma Separated Compatible Devices String
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Galaxy S24 Ultra, iPhone 15 Pro, Universal / All Models"
                      value={compatibleModels}
                      onChange={(e) => setCompatibleModels(e.target.value)}
                      className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 font-semibold"
                    />
                  </div>
                </div>

                {/* Color Options & Material */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Colors */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-cyan-500" />
                      Color Options (Comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Blue, Black, Clear, Teal"
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 font-semibold"
                    />
                  </div>

                  {/* Material */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                      <Box className="h-3.5 w-3.5 text-cyan-500" />
                      Material
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Thermoplastic Polyurethane"
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 font-semibold"
                    />
                  </div>
                </div>

                {/* Optional Custom Warranty */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                    Optional Product Highlights
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Premium Material, Tested Quality, Fast Charging Compatible"
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value)}
                    className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                  />
                </div>

                {/* Price, Original Strike MRP, & Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Selling Price */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                      Selling Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      placeholder="e.g. 199"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-base md:text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                    />
                  </div>

                  {/* Original / MRP Strike Price */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5 text-amber-500" />
                      Original MRP (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 499"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-base md:text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                    />
                  </div>

                  {/* Stock Quantity */}
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
                      className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-base md:text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 font-semibold"
                    />
                  </div>
                </div>

                {/* Stock Status & Sale Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-muted/40 border border-border/50">
                  {/* In Stock / Out of Stock */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-foreground block">Stock Availability</span>
                      <span className="text-[9px] text-muted-foreground">{inStock ? "In Stock (Available)" : "Out of Stock"}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInStock(!inStock)}
                      className={cn("text-lg min-h-[44px] flex items-center", inStock ? "text-emerald-500" : "text-red-500")}
                    >
                      {inStock ? <ToggleRight className="h-8 w-8 text-emerald-500" /> : <ToggleLeft className="h-8 w-8 text-red-500" />}
                    </button>
                  </div>

                  {/* Put on Sale Toggle */}
                  <div className="flex items-center justify-between sm:border-l border-border/50 sm:pl-3 pt-2 sm:pt-0 border-t sm:border-t-0">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-foreground block">🔥 Put on Sale</span>
                      <span className="text-[9px] text-muted-foreground">{isOnSale ? "Sale Badge Active" : "Regular Price"}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsOnSale(!isOnSale)}
                      className="text-lg min-h-[44px] flex items-center"
                    >
                      {isOnSale ? <ToggleRight className="h-8 w-8 text-amber-500" /> : <ToggleLeft className="h-8 w-8 text-muted-foreground" />}
                    </button>
                  </div>
                </div>

                {/* Product Images Direct Upload & URL Input (Up to 10 Images) */}
                <div className="space-y-3 border-t border-border/50 pt-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-cyan-500" />
                      Product Images (Upload Files or Paste URLs - Max 10)
                    </label>
                    <span className="text-[10px] text-cyan-400 font-bold">{imageUrls.length} / 10</span>
                  </div>

                  {/* File Upload Box */}
                  <div className="p-4 rounded-2xl bg-muted/30 border border-dashed border-cyan-500/40 hover:border-cyan-500 transition-colors text-center cursor-pointer">
                    <label className="cursor-pointer block space-y-1">
                      <Plus className="h-6 w-6 text-cyan-400 mx-auto" />
                      <span className="text-xs font-bold text-foreground block">Click to Select & Upload Image Files</span>
                      <span className="text-[10px] text-muted-foreground block">Upload photo files directly from your mobile/PC gallery (PNG, JPG, WEBP)</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Images Thumbnails & Links List */}
                  {imageUrls.length > 0 && (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {imageUrls.map((url, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          {url ? (
                            <img src={url} alt="" className="h-8 w-8 rounded-lg object-cover flex-shrink-0 border border-border" />
                          ) : (
                            <span className="text-[10px] font-bold text-muted-foreground w-4 text-center">{idx + 1}</span>
                          )}
                          <input
                            type="text"
                            placeholder={`Image ${idx + 1} URL or Base64`}
                            value={url.length > 50 ? `${url.substring(0, 45)}...` : url}
                            onChange={(e) => {
                              const newArr = [...imageUrls];
                              newArr[idx] = e.target.value;
                              setImageUrls(newArr);
                            }}
                            className="flex-grow bg-muted border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 font-medium truncate"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImageUrls(imageUrls.filter((_, i) => i !== idx));
                            }}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {imageUrls.length < 10 && (
                    <button
                      type="button"
                      onClick={() => setImageUrls([...imageUrls, ""])}
                      className="w-full py-2 bg-muted/60 border border-dashed border-border hover:border-cyan-500 text-cyan-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Image URL Input ({imageUrls.length}/10)</span>
                    </button>
                  )}
                </div>

                {/* Description & AI Auto Generator */}
                <div className="space-y-1.5 border-t border-border/50 pt-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5 text-cyan-500" />
                      Specifications & Description
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateAiDescription}
                      disabled={isGeneratingAiDesc}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-[10px] font-bold flex items-center gap-1"
                    >
                      <Loader2 className={cn("h-3 w-3", isGeneratingAiDesc && "animate-spin")} />
                      <span>✨ Auto-Generate Description (AI)</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Click ✨ Auto-Generate Description (AI) or type custom description..."
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
                    {isActive ? <ToggleRight className="h-8 w-8 text-emerald-500" /> : <ToggleLeft className="h-8 w-8 text-muted-foreground" />}
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
                  className={cn(
                    "w-full py-3 hover:opacity-90 disabled:opacity-50 font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 mt-4 shadow-sm",
                    editingProductId 
                      ? "bg-amber-500 text-black hover:bg-amber-400" 
                      : "bg-foreground text-background"
                  )}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving to Database...
                    </>
                  ) : editingProductId ? (
                    <>
                      <Save className="h-4 w-4" />
                      Update Product Details
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
                      className={cn(
                        "p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all",
                        editingProductId === prod.id
                          ? "bg-amber-500/10 border-amber-500/50"
                          : "bg-muted/30 border-border hover:border-cyan-500/20"
                      )}
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

                      <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/50">
                        <span className="font-extrabold text-xs text-foreground">{formatINR(prod.price)}</span>
                        
                        <div className="flex items-center gap-1.5">
                          {/* Edit Product button */}
                          <button
                            onClick={() => handleStartEditProduct(prod)}
                            className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/25 hover:bg-cyan-500/20 text-cyan-400 font-bold text-[10px] uppercase flex items-center gap-1 transition-colors"
                            title="Edit product details"
                          >
                            <Pencil className="h-3 w-3" />
                            <span>Edit</span>
                          </button>

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

        {/* Customer Orders Management Tab */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-emerald-500" />
                  Customer Orders & Fulfillment
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Manage incoming customer orders, confirm delivery status, and trigger Resend thank you emails.
                </p>
              </div>

              <button
                onClick={loadCustomerOrders}
                className="px-4 py-2 rounded-xl bg-muted border border-border text-xs font-bold text-foreground hover:bg-muted/80 transition-colors flex items-center gap-1.5"
              >
                <Loader2 className={cn("h-3.5 w-3.5", ordersLoading && "animate-spin")} />
                Refresh Orders
              </button>
            </div>

            {ordersLoading ? (
              <div className="py-16 text-center">
                <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mx-auto mb-3" />
                <p className="text-xs text-muted-foreground font-medium">Fetching customer orders...</p>
              </div>
            ) : customerOrders.length === 0 ? (
              <div className="glass-card rounded-3xl p-12 text-center border border-border bg-card space-y-4">
                <Box className="h-12 w-12 text-muted-foreground mx-auto stroke-[1.5]" />
                <div>
                  <h3 className="font-bold text-foreground text-base">No Customer Orders Found</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    When customers place orders on the website or billing checkout, they will appear here live.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {customerOrders.map((order) => {
                  const isDelivered = order.status?.toLowerCase() === "delivered";
                  const orderDate = new Date(order.created_at || Date.now()).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  });

                  const customerEmail = order.shipping_address?.email || order.email || "N/A";
                  const customerPhone = order.shipping_address?.phone || order.phone || "N/A";
                  const customerName = order.shipping_address?.name || order.name || "Customer";
                  const city = order.shipping_address?.city || "Gurugram";
                  const address = order.shipping_address?.address || "";

                  return (
                    <div
                      key={order.id}
                      className="glass-card rounded-2xl p-5 border border-border shadow-sm bg-card hover:border-border/80 transition-all space-y-4"
                    >
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold border border-emerald-500/20">
                            #
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-foreground text-sm">Order #{order.id}</span>
                              <span className={cn(
                                "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border",
                                isDelivered
                                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              )}>
                                {isDelivered ? "Delivered" : (order.status || "Pending")}
                              </span>
                            </div>
                            <span className="text-[11px] text-muted-foreground block mt-0.5">{orderDate}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-muted-foreground block">Total Amount</span>
                          <strong className="text-base font-black text-emerald-500">{formatINR(order.total_amount || 0)}</strong>
                        </div>
                      </div>

                      {/* Details & Address */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Customer</span>
                          <p className="font-bold text-foreground">{customerName}</p>
                          <p className="text-muted-foreground">{customerPhone}</p>
                          <p className="text-cyan-400 truncate">{customerEmail}</p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Shipping Address</span>
                          <p className="font-medium text-foreground">{address || "Express Store Delivery"}</p>
                          <p className="text-muted-foreground">{city} - {order.shipping_address?.pincode || "122001"}</p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Payment & Order Info</span>
                          <p className="font-bold text-foreground uppercase">{order.payment_method || "COD / Online"}</p>
                          <p className="text-emerald-400 font-semibold uppercase">{order.payment_status || order.status || "paid"}</p>
                          {order.items && order.items.length > 0 && (
                            <span className="text-[11px] text-muted-foreground block mt-1">
                              Items: {order.items.map((i: any) => `${i.product_name || 'Accessory'} (${i.quantity}x)`).join(", ")}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Order Action Buttons */}
                      <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-border/40">
                        {!isDelivered && (
                          <button
                            onClick={() => handleMarkDelivered(order.id)}
                            className="px-4 py-2.5 rounded-xl bg-emerald-500 text-black font-extrabold text-xs uppercase tracking-wider hover:bg-emerald-400 transition-colors flex items-center gap-1.5 shadow-sm"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Confirm & Mark Delivered</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleSendDeliveredEmail(order)}
                          disabled={sendingEmailId === order.id}
                          className="px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold text-xs hover:bg-cyan-500/20 transition-colors flex items-center gap-1.5"
                        >
                          {sendingEmailId === order.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                          ) : (
                            <Mail className="h-4 w-4 text-cyan-400" />
                          )}
                          <span>Send Resend Thank You Email</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

            {/* PICKUP & DROP REPAIR BOOKINGS ADMIN VIEW */}
            {repairBookings.length > 0 && (
              <div className="pt-8 border-t border-border/50 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                    <Truck className="h-5 w-5 text-cyan-500" />
                    Doorstep Pickup &amp; Drop Repair Bookings ({repairBookings.length})
                  </h3>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                    <Gift className="h-3.5 w-3.5" /> FREE PHONE COVER ELIGIBLE
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {repairBookings.map((rep) => {
                    const isFreeCover = rep.freePhoneCover || rep.free_phone_cover || rep.issue_description?.includes("FREE PHONE COVER");
                    
                    return (
                      <div key={rep.id} className="p-4 rounded-2xl bg-card border border-border space-y-3 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Service: Pickup &amp; Drop</span>
                            <h4 className="font-extrabold text-sm text-foreground">{rep.device_model}</h4>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-bold uppercase border border-cyan-500/20">
                            Status: {rep.status || "Booked"}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2">{rep.issue_description}</p>

                        <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-mono">Job ID: {rep.id}</span>
                          <span className={cn(
                            "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border",
                            isFreeCover
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-muted text-muted-foreground border-border"
                          )}>
                            <Gift className="h-3 w-3" />
                            FREE PHONE COVER: {isFreeCover ? "YES (Included)" : "No"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Search, 
  ShoppingBag, 
  Star, 
  ChevronRight,
  Info,
  Check,
  AlertCircle,
  X
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { MOCK_ACCESSORIES, AccessoryProduct } from "@/lib/accessories";
import { formatINR, cn } from "@/lib/utils";

export default function AdminAccessoriesPage() {
  const [products, setProducts] = useState<AccessoryProduct[]>(MOCK_ACCESSORIES);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Form states for New / Edit Product
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("Cases");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("50");
  const [image, setImage] = useState("/placeholder_acc.png");
  const [imagesInput, setImagesInput] = useState("");
  const [description, setDescription] = useState("");
  
  // Specs form states (list of key-value pairs)
  const [specs, setSpecs] = useState<Array<{ key: string; value: string }>>([
    { key: "Warranty", value: "1 Year" }
  ]);

  // Load products from Supabase
  const loadProducts = async () => {
    if (!isSupabaseConfigured()) {
      console.log("Supabase not configured, showing local products.");
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("accessories")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const mapped: AccessoryProduct[] = data.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          brand: item.brand,
          price: Number(item.price),
          rating: Number(item.rating_avg || 4.5),
          reviewsCount: Number(item.reviews_count || 10),
          image: (item.images && item.images.length > 0) ? item.images[0] : "/placeholder_acc.png",
          images: item.images || [],
          specifications: item.specifications || {},
          description: item.description || ""
        }));
        setProducts(mapped);
      }
    } catch (err: any) {
      console.error("Error fetching accessories:", err);
      setErrorMessage("Could not load products from Supabase: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Handle Specifications change
  const handleSpecChange = (index: number, field: "key" | "value", val: string) => {
    const updated = [...specs];
    updated[index][field] = val;
    setSpecs(updated);
  };

  const addSpecField = () => {
    setSpecs([...specs, { key: "", value: "" }]);
  };

  const removeSpecField = (index: number) => {
    setSpecs(specs.filter((_, idx) => idx !== index));
  };

  // Open Form for Adding New Product
  const openNewForm = () => {
    setEditingId(null);
    setName("");
    setBrand("");
    setCategory("Cases");
    setPrice("");
    setStockQuantity("50");
    setImage("/placeholder_acc.png");
    setImagesInput("");
    setDescription("");
    setSpecs([{ key: "Warranty", value: "1 Year" }]);
    setIsFormOpen(true);
  };

  // Open Form for Editing Product
  const openEditForm = (prod: AccessoryProduct) => {
    setEditingId(prod.id);
    setName(prod.name);
    setBrand(prod.brand);
    setCategory(prod.category);
    setPrice(prod.price.toString());
    setStockQuantity("50"); // mock/fallback stock
    setImage(prod.image);
    setImagesInput(prod.images ? prod.images.join(", ") : prod.image);
    setDescription(prod.description);
    
    // Parse specs object into key-value array
    const mappedSpecs = Object.entries(prod.specifications).map(([k, v]) => ({
      key: k,
      value: v
    }));
    setSpecs(mappedSpecs.length > 0 ? mappedSpecs : [{ key: "Warranty", value: "1 Year" }]);
    setIsFormOpen(true);
  };

  // Handle Save (Insert or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage("");
    setErrorMessage("");

    if (!name || !brand || !price) {
      setErrorMessage("Please fill in all required fields (Name, Brand, Price).");
      return;
    }

    // Convert specs array back to Record object
    const specsObject: Record<string, string> = {};
    specs.forEach((item) => {
      if (item.key.trim()) {
        specsObject[item.key.trim()] = item.value.trim();
      }
    });

    // Parse images array
    const imagesArray = imagesInput
      ? imagesInput.split(",").map((s) => s.trim()).filter(Boolean)
      : [image];

    const productPayload = {
      name,
      brand,
      category,
      price: Number(price),
      description,
      specifications: specsObject,
      images: imagesArray,
      stock_quantity: Number(stockQuantity),
      is_active: true
    };

    try {
      if (isSupabaseConfigured()) {
        if (editingId) {
          // Update DB
          const { error } = await supabase
            .from("accessories")
            .update(productPayload)
            .eq("id", editingId);

          if (error) throw error;
          setStatusMessage("Product updated successfully in Supabase!");
        } else {
          // Insert DB
          const { error } = await supabase
            .from("accessories")
            .insert([productPayload]);

          if (error) throw error;
          setStatusMessage("Product uploaded successfully to Supabase!");
        }
        await loadProducts();
      } else {
        // Mock Mode (modify local state)
        if (editingId) {
          setProducts(products.map((p) => p.id === editingId ? {
            ...p,
            name,
            brand,
            category,
            price: Number(price),
            description,
            specifications: specsObject,
            image: imagesArray[0] || image,
            images: imagesArray
          } : p));
          setStatusMessage("Local mock product updated!");
        } else {
          const newProd: AccessoryProduct = {
            id: `acc-${Date.now()}`,
            name,
            brand,
            category,
            price: Number(price),
            rating: 4.5,
            reviewsCount: 1,
            image: imagesArray[0] || image,
            images: imagesArray,
            specifications: specsObject,
            description
          };
          setProducts([newProd, ...products]);
          setStatusMessage("Local mock product uploaded successfully!");
        }
      }
      setIsFormOpen(false);
    } catch (err: any) {
      console.error("Error saving product:", err);
      setErrorMessage("Failed to save product: " + err.message);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setStatusMessage("");
    setErrorMessage("");

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from("accessories")
          .delete()
          .eq("id", id);

        if (error) throw error;
        setStatusMessage("Product deleted from Supabase!");
        await loadProducts();
      } else {
        setProducts(products.filter((p) => p.id !== id));
        setStatusMessage("Local mock product deleted!");
      }
    } catch (err: any) {
      console.error("Error deleting product:", err);
      setErrorMessage("Failed to delete product: " + err.message);
    }
  };

  const filteredProducts = products.filter((prod) => {
    return (
      prod.name.toLowerCase().includes(search.toLowerCase()) ||
      prod.brand.toLowerCase().includes(search.toLowerCase()) ||
      prod.category.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Accessories Catalogue Management</h2>
          <p className="text-xs text-muted-foreground">Upload, edit, and control pricing inventories of your e-store products.</p>
        </div>
        <button
          onClick={openNewForm}
          className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs flex items-center gap-1.5 hover:bg-cyan-400 transition-all select-none shadow-md"
        >
          <Plus className="h-4 w-4" />
          Upload Product
        </button>
      </div>

      {/* Notifications */}
      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center gap-2">
          <Check className="h-4.5 w-4.5" />
          <span>{statusMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-4.5 w-4.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Search Toolbar */}
      <div className="glass-card rounded-2xl p-4 border border-border flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products by name, brand, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-muted border border-border rounded-xl py-2 pl-9 pr-4 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
        <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
          Showing {filteredProducts.length} of {products.length} Items
        </span>
      </div>

      {/* Products Table Grid */}
      <div className="glass-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-muted-foreground font-bold uppercase tracking-wider">
                <th className="p-4">Product details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Brand</th>
                <th className="p-4 text-right">Price</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-muted/25 transition-colors">
                  <td className="p-4 font-bold text-foreground">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted border border-border/80 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {prod.image ? (
                          <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="truncate max-w-[240px]">
                        <p className="font-semibold text-foreground truncate">{prod.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{prod.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground font-medium">{prod.category}</td>
                  <td className="p-4 text-muted-foreground font-medium">{prod.brand}</td>
                  <td className="p-4 text-right font-bold text-foreground">{formatINR(prod.price)}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => openEditForm(prod)}
                        className="p-1.5 rounded-lg bg-muted hover:bg-cyan-500/10 text-muted-foreground hover:text-cyan-500 transition-colors border border-border/40"
                        title="Edit Product"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-1.5 rounded-lg bg-muted hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors border border-border/40"
                        title="Delete Product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground">
                    No accessories found in table. Click &quot;Upload Product&quot; to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Upload / Edit Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto my-8 animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="text-lg font-bold text-foreground">
                {editingId ? "Modify Product details" : "Upload New Accessory"}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Product Name */}
                <div className="col-span-full">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground mt-1 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    placeholder="e.g. UltraCharge MagSafe Wall Adapter"
                  />
                </div>

                {/* Brand */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Brand *</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground mt-1 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    placeholder="e.g. Anker, Spigen, Generic"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground mt-1 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="Chargers">Chargers</option>
                    <option value="Cables">Cables</option>
                    <option value="Tempered Glass">Tempered Glass</option>
                    <option value="Cases">Cases</option>
                    <option value="Earbuds">Earbuds</option>
                    <option value="Power Banks">Power Banks</option>
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Price (INR) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground mt-1 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    placeholder="e.g. 199"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Stock Inventory Quantity</label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground mt-1 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    placeholder="50"
                  />
                </div>

                {/* Primary Image Cover */}
                <div className="col-span-full">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Primary Cover Image URL</label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground mt-1 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    placeholder="/s25_case.jpg"
                  />
                </div>

                {/* Gallery Images */}
                <div className="col-span-full">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Gallery Images (Comma separated for Sliding Carousel)</label>
                  <input
                    type="text"
                    value={imagesInput}
                    onChange={(e) => setImagesInput(e.target.value)}
                    className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground mt-1 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    placeholder="/s25_case.jpg, /s25_case_back.jpg, /s25_case_side.jpg"
                  />
                </div>

                {/* Description */}
                <div className="col-span-full">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Product Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground mt-1 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none"
                    placeholder="Enter detailed description of specifications features..."
                  />
                </div>
              </div>

              {/* Specifications Block Builder */}
              <div className="space-y-3.5 border-t border-border pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-foreground block tracking-wider">
                    Technical Specifications Builder
                  </span>
                  <button
                    type="button"
                    onClick={addSpecField}
                    className="text-[10px] font-bold text-cyan-500 hover:underline flex items-center gap-0.5"
                  >
                    + Add Spec Field
                  </button>
                </div>

                <div className="space-y-2">
                  {specs.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Feature Key (e.g. Color)"
                        value={item.key}
                        onChange={(e) => handleSpecChange(idx, "key", e.target.value)}
                        className="w-1/2 bg-muted border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. Black)"
                        value={item.value}
                        onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                        className="w-1/2 bg-muted border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeSpecField(idx)}
                        className="text-red-500 hover:text-red-600 px-1 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 justify-end pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-muted text-muted-foreground border border-border/50 text-xs font-semibold hover:bg-muted/80"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-cyan-500 text-black font-bold text-xs flex items-center gap-1 hover:bg-cyan-400"
                >
                  <Save className="h-4 w-4" />
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

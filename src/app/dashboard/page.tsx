"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { User, Phone, MapPin, Globe, CreditCard, Plus, Trash2, Edit3, Save } from "lucide-react";
import { cn, formatINR } from "@/lib/utils";

export default function DashboardPage() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.full_name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [lang, setLang] = useState(user?.preferred_language || "en");
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");

  const [newAddressLabel, setNewAddressLabel] = useState("");
  const [newAddressDetails, setNewAddressDetails] = useState("");
  const [newAddressPin, setNewAddressPin] = useState("");
  const [newAddressCity, setNewAddressCity] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);

  if (!user) return null;

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    const res = await updateProfile({
      full_name: name,
      phone: phone,
      preferred_language: lang,
    });
    if (res.success) {
      setMessage("Profile updated successfully!");
      setIsEditing(false);
    } else {
      setMessage("Failed to update profile: " + res.error);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressLabel || !newAddressDetails || !newAddressPin || !newAddressCity) return;
    
    const newAddressObj = {
      id: Math.random().toString(36).substring(2, 9),
      name: newAddressLabel,
      address: newAddressDetails,
      pin: newAddressPin,
      city: newAddressCity,
    };

    const currentAddresses = user.addresses || [];
    const updatedAddresses = [...currentAddresses, newAddressObj];

    const res = await updateProfile({ addresses: updatedAddresses });
    if (res.success) {
      setNewAddressLabel("");
      setNewAddressDetails("");
      setNewAddressPin("");
      setNewAddressCity("");
      setShowAddressForm(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    const currentAddresses = user.addresses || [];
    const updatedAddresses = currentAddresses.filter((addr: any) => addr.id !== id);
    await updateProfile({ addresses: updatedAddresses });
  };

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="glass-card rounded-2xl p-8 relative overflow-hidden border border-border">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-foreground">
            Namaste, {user.full_name}!
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-lg">
            Manage your phone repair jobs, accessories orders, and profile details from your unified account console.
          </p>
        </div>
      </div>

      {/* Grid: Quick Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Profile Card */}
        <div className="glass-card rounded-2xl p-6 border border-border space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-500" />
              Profile Details
            </h3>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs text-emerald-500 font-semibold hover:underline flex items-center gap-1"
            >
              {isEditing ? <Save className="h-3 w-3" /> : <Edit3 className="h-3 w-3" />}
              {isEditing ? "Cancel" : "Edit"}
            </button>
          </div>

          {message && (
            <p className="text-xs font-semibold text-emerald-500">{message}</p>
          )}

          {isEditing ? (
            <form onSubmit={handleProfileSave} className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-1.5 text-xs text-foreground mt-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-1.5 text-xs text-foreground mt-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Preferred Language</label>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-1.5 text-xs text-foreground mt-1 focus:outline-none"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi (हिंदी)</option>
                  <option value="gu">Gujarati (ગુજરાતી)</option>
                  <option value="ta">Tamil (தமிழ்)</option>
                  <option value="bn">Bengali (বাংলা)</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-foreground text-background text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Save Profile
              </button>
            </form>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Full Name:</span>
                <span className="font-medium text-foreground">{user.full_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium text-foreground">{user.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium text-foreground">{user.phone || "Not set"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Language:</span>
                <span className="font-medium text-foreground uppercase">{user.preferred_language}</span>
              </div>
            </div>
          )}
        </div>

        {/* Saved Addresses Card */}
        <div className="glass-card rounded-2xl p-6 border border-border flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-cyan-500" />
              Saved Addresses
            </h3>
            <button
              onClick={() => setShowAddressForm(!showAddressForm)}
              className="text-xs text-cyan-500 font-semibold hover:underline flex items-center gap-0.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>

          {showAddressForm && (
            <form onSubmit={handleAddAddress} className="space-y-2.5 p-3 rounded-xl bg-muted/50 border border-border">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Label (e.g., Office)"
                  value={newAddressLabel}
                  onChange={(e) => setNewAddressLabel(e.target.value)}
                  className="bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="City"
                  value={newAddressCity}
                  onChange={(e) => setNewAddressCity(e.target.value)}
                  className="bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                  required
                />
              </div>
              <input
                type="text"
                placeholder="Full address details"
                value={newAddressDetails}
                onChange={(e) => setNewAddressDetails(e.target.value)}
                className="w-full bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Pin Code"
                  value={newAddressPin}
                  onChange={(e) => setNewAddressPin(e.target.value)}
                  className="bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="bg-foreground text-background font-semibold rounded-lg text-xs hover:opacity-90"
                >
                  Save Address
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3 max-h-[220px] overflow-y-auto">
            {(!user.addresses || user.addresses.length === 0) ? (
              <p className="text-xs text-muted-foreground text-center py-6">No saved addresses found.</p>
            ) : (
              user.addresses.map((addr: any) => (
                <div key={addr.id} className="flex justify-between items-start p-3 rounded-xl bg-muted/40 border border-border/50">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-cyan-500 tracking-wider">
                      {addr.name}
                    </span>
                    <p className="text-xs text-foreground font-medium">{addr.address}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {addr.city} - {addr.pin}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="p-1 rounded text-muted-foreground hover:text-red-500 hover:bg-red-500/5 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

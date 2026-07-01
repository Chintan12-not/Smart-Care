"use client";

import React, { useState } from "react";
import { 
  BarChart3, 
  ShoppingBag, 
  Wrench, 
  Users, 
  TrendingUp, 
  PlusCircle,
  Clock,
  CheckCircle2
} from "lucide-react";
import { formatINR } from "@/lib/utils";

export default function AdminPage() {
  const [accessoriesCount, setAccessoriesCount] = useState(482);
  const [repairsCount, setRepairsCount] = useState(14);

  // Mock statistics data
  const stats = [
    { name: "Total Gross Revenue", value: formatINR(148350), change: "+14.8%", icon: TrendingUp, accent: "text-emerald-500 bg-emerald-500/10" },
    { name: "Accessory Orders", value: "84", change: "+6.2%", icon: ShoppingBag, accent: "text-cyan-500 bg-cyan-500/10" },
    { name: "Mobile Repairs", value: repairsCount.toString(), change: "+20%", icon: Wrench, accent: "text-blue-500 bg-blue-500/10" },
    { name: "Platform Users", value: "482", change: "+8.9%", icon: Users, accent: "text-purple-500 bg-purple-500/10" },
  ];

  // Mock list of recent orders
  const recentOrders = [
    { id: "ORD-9284", name: "Anil Kumar", type: "Accessory", price: 340, status: "pending" },
    { id: "ORD-8472", name: "Sunita Sharma", type: "Accessory", price: 1299, status: "shipped" },
    { id: "ORD-7391", name: "Vikram Singh", type: "Accessory", price: 180, status: "delivered" },
    { id: "ORD-6824", name: "Neha Patel", type: "Accessory", price: 2198, status: "processing" },
  ];

  // Mock list of active repair tickets
  const activeRepairs = [
    { ticket: "REP-482", model: "iPhone 13 Pro", issue: "Display Cracked", cost: 8499, status: "inspecting" },
    { ticket: "REP-483", model: "OnePlus Nord", issue: "Battery Draining", cost: 1499, status: "repairing" },
    { ticket: "REP-484", model: "Samsung Galaxy S22", issue: "Charging Port", cost: 1299, status: "repaired" },
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Metrics Panel</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Real-time metrics, transactions summary, and inventory state.
        </p>
      </div>

      {/* Grid: Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="glass-card rounded-2xl p-6 border border-border">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {stat.name}
              </span>
              <span className={stat.accent + " p-2.5 rounded-xl text-xs"}>
                <stat.icon className="h-4.5 w-4.5" />
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-foreground">{stat.value}</span>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Grid: Details View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders List */}
        <div className="glass-card rounded-2xl p-6 border border-border lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-cyan-500" />
            Recent Store Transactions
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground uppercase font-bold tracking-wider">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Total Amount</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-foreground font-medium">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/35 transition-colors">
                    <td className="py-3 text-cyan-500">{order.id}</td>
                    <td className="py-3">{order.name}</td>
                    <td className="py-3">{order.type}</td>
                    <td className="py-3 font-semibold">{formatINR(order.price)}</td>
                    <td className="py-3 text-right">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                        order.status === "delivered" 
                          ? "bg-emerald-500/10 text-emerald-500"
                          : order.status === "pending"
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-cyan-500/10 text-cyan-500"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Repair Tickets */}
        <div className="glass-card rounded-2xl p-6 border border-border space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Wrench className="h-4 w-4 text-emerald-500" />
            Active Repair Jobs
          </h3>
          <div className="space-y-3">
            {activeRepairs.map((rep) => (
              <div key={rep.ticket} className="p-3.5 rounded-xl bg-muted/40 border border-border/50 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-xs text-foreground">{rep.model}</span>
                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                    rep.status === "repaired"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-cyan-500/10 text-cyan-500"
                  }`}>
                    {rep.status}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-normal">{rep.issue}</p>
                <div className="flex justify-between items-center mt-2 border-t border-border/40 pt-2 text-[10px] text-muted-foreground">
                  <span>Fee: <strong className="text-foreground">{formatINR(rep.cost)}</strong></span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="h-3 w-3 text-cyan-500" />
                    Today
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

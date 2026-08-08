"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { ShoppingBag, Calendar, Truck, CheckCircle2, Package, AlertCircle, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { formatINR } from "@/lib/utils";

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_per_unit: number;
  product_name?: string;
  product_image?: string | null;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  payment_status: string;
  payment_method: string;
  total_amount: number;
  shipping_address: any;
  items?: OrderItem[];
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      setLoading(true);
      if (isSupabaseConfigured()) {
        try {
          // Fetch orders
          const { data: dbOrders, error: orderError } = await supabase
            .from("orders")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (orderError) throw orderError;

          if (dbOrders && dbOrders.length > 0) {
            const orderIds = dbOrders.map(o => o.id);
            
            // Fetch order items
            const { data: dbItems, error: itemsError } = await supabase
              .from("order_items")
              .select("*")
              .in("order_id", orderIds);

            if (itemsError) throw itemsError;

            // Fetch products details to resolve names
            const { data: dbProducts } = await supabase
              .from("accessories")
              .select("id, name, images");

            const productMap = new Map();
            if (dbProducts) {
              dbProducts.forEach(p => productMap.set(p.id, p));
            }

            const itemsWithDetails = (dbItems || []).map((item: any) => ({
              ...item,
              product_name: productMap.get(item.product_id)?.name || "Accessory Item",
              product_image: productMap.get(item.product_id)?.images?.[0] || null,
            }));

            const ordersWithItems = dbOrders.map(order => ({
              ...order,
              items: itemsWithDetails.filter(item => item.order_id === order.id),
            }));

            setOrders(ordersWithItems);
          } else {
            setOrders([]);
          }
        } catch (e) {
          console.error("Error fetching orders:", e);
        }
      } else {
        // Fallback: load mock orders from localStorage or set defaults
        const mockOrdersData = localStorage.getItem("sc_mock_orders");
        if (mockOrdersData) {
          setOrders(JSON.parse(mockOrdersData));
        } else {
          // Set a default mock order for demonstration
          const defaultMockOrders: Order[] = [
            {
              id: "ord_mock123",
              created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              status: "shipped",
              payment_status: "paid",
              payment_method: "online",
              total_amount: 1499.00,
              shipping_address: {
                city: "Gurugram",
                state: "Haryana",
                details: "Flat 402, Sector 37C",
                pincode: "122001"
              },
              items: [
                {
                  id: "item1",
                  order_id: "ord_mock123",
                  product_id: "prod1",
                  quantity: 1,
                  price_per_unit: 1499.00,
                  product_name: "Ultra-Fast 65W GaN Charger",
                  product_image: null
                }
              ]
            }
          ];
          localStorage.setItem("sc_mock_orders", JSON.stringify(defaultMockOrders));
          setOrders(defaultMockOrders);
        }
      }
      setLoading(false);
    };

    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "processing":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "shipped":
        return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
      case "delivered":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10">
          <ShoppingBag className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">My Orders</h2>
          <p className="text-xs text-muted-foreground">View and track your accessories purchase history</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-border flex flex-col items-center justify-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <ShoppingCart className="h-8 w-8" />
          </div>
          <div className="max-w-sm">
            <h3 className="font-semibold text-foreground text-base">No orders placed yet</h3>
            <p className="text-xs text-muted-foreground mt-1">
              You haven't ordered any phone accessories from our catalog yet. Browse our premium store now!
            </p>
          </div>
          <Link
            href="/accessories"
            className="px-6 py-2.5 bg-foreground text-background text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            Browse Accessories
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="glass-card rounded-2xl border border-border overflow-hidden">
              {/* Header Info */}
              <div className="bg-muted/40 px-6 py-4 flex flex-wrap justify-between items-center gap-4 border-b border-border/50">
                <div className="flex gap-6 flex-wrap text-xs">
                  <div>
                    <span className="text-muted-foreground block font-medium">Order ID</span>
                    <span className="font-mono font-semibold text-foreground truncate max-w-[120px] block">
                      {order.id}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block font-medium">Date Placed</span>
                    <span className="font-semibold text-foreground block">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block font-medium">Total Amount</span>
                    <span className="font-bold text-emerald-500 block">
                      {formatINR(order.total_amount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block font-medium">Payment</span>
                    <span className="font-semibold text-foreground uppercase block text-[10px]">
                      {order.payment_method} ({order.payment_status})
                    </span>
                  </div>
                </div>

                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              {/* Items List */}
              <div className="p-6 divide-y divide-border/50">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4 items-center justify-between">
                    <div className="flex gap-4 items-center">
                      <div className="h-12 w-12 rounded-lg bg-muted border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                        {item.product_image ? (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="object-cover h-full w-full"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-sm hover:underline">
                          <Link href={`/accessories/${item.product_id}`}>{item.product_name}</Link>
                        </h4>
                        <span className="text-xs text-muted-foreground block mt-0.5">
                          Quantity: {item.quantity} × {formatINR(item.price_per_unit)}
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-foreground text-sm">
                      {formatINR(item.quantity * item.price_per_unit)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Shipping Address Footer */}
              <div className="bg-muted/10 px-6 py-3 border-t border-border/30 text-xs flex items-center justify-between text-muted-foreground">
                <span className="truncate max-w-[80%]">
                  Shipping to: <strong>{order.shipping_address?.details}, {order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.pincode}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

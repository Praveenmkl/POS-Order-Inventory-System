import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  ShoppingBag,
  Package,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import productService from "@/services/productService";
import orderService from "@/services/orderService";
import { useAuth } from "@/context/AuthContext";

const STATUS_CONFIG = {
  pending:    { label: "Pending",    className: "bg-amber-100 text-amber-700 border-amber-200" },
  confirmed:  { label: "Confirmed",  className: "bg-zinc-100 text-zinc-700 border-zinc-200" },
  processing: { label: "Processing", className: "bg-zinc-100 text-zinc-700 border-zinc-200" },
  completed:  { label: "Completed",  className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  cancelled:  { label: "Cancelled",  className: "bg-red-100 text-red-700 border-red-200" },
};

const StatCard = ({ icon: Icon, label, value, sub, color, loading }) => (
  <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
    <div className={`absolute inset-0 opacity-5 ${color}`} />
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-24" />
          ) : (
            <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
          )}
          {sub && (
            <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
          )}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color} bg-opacity-10`}>
          <Icon className={`h-6 w-6 ${color.replace("bg-", "text-")}`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, ordRes] = await Promise.all([
        productService.getAll(),
        isAdmin ? orderService.getAll() : orderService.getMyOrders(),
      ]);
      setProducts(prodRes.data?.products || prodRes.data || []);
      setOrders(ordRes.data?.orders || ordRes.data || []);
    } catch {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalRevenue = orders
    .filter((o) => o.status === "completed" || o.status === "confirmed")
    .reduce((s, o) => s + (o.totalAmount || 0), 0);

  const todayOrders = orders.filter((o) => {
    const d = new Date(o.createdAt);
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  }).length;

  const lowStock = products.filter(
    (p) => p.stock - (p.reservedStock || 0) <= 5
  ).length;

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  const stats = [
    {
      icon: TrendingUp,
      label: "Total Revenue",
      value: `Rs. ${totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      sub: "From completed orders",
      color: "bg-emerald-500",
    },
    {
      icon: ShoppingBag,
      label: "Today's Orders",
      value: todayOrders,
      sub: `${orders.length} total`,
      color: "bg-blue-500",
    },
    {
      icon: Package,
      label: "Total Products",
      value: products.length,
      sub: "In catalogue",
      color: "bg-purple-500",
    },
    {
      icon: AlertTriangle,
      label: "Low Stock",
      value: lowStock,
      sub: "Items need restocking",
      color: "bg-amber-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} loading={loading} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Quick Action</p>
                <h3 className="mt-1 text-lg font-bold">Open POS</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Start a new sale transaction
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 group-hover:bg-zinc-200 transition-colors">
                <ShoppingBag className="h-7 w-7 text-zinc-800" />
              </div>
            </div>
            <Link to="/pos">
              <Button className="mt-4 w-full gap-2 bg-black hover:bg-zinc-800">
                Go to POS <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Quick Action</p>
                <h3 className="mt-1 text-lg font-bold">Manage Products</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add, edit or remove products
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 group-hover:bg-zinc-200 transition-colors">
                <Package className="h-7 w-7 text-zinc-800" />
              </div>
            </div>
            <Link to="/products">
              <Button variant="outline" className="mt-4 w-full gap-2 border-zinc-300 text-zinc-800 hover:bg-zinc-50">
                Manage Products <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
          <Link to="/orders">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              View all <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-0 divide-y">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No orders yet. Start by making a sale in POS.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Order ID</th>
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Items</th>
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-6 py-3 text-right font-medium text-muted-foreground">Total</th>
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentOrders.map((order) => {
                    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                    return (
                      <tr key={order._id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                          #{order._id?.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4">
                          {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold">
                          Rs. {(order.totalAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      {!loading && lowStock > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-200">
              <AlertTriangle className="h-5 w-5 text-amber-700" />
            </div>
            <div className="flex-1 w-full">
              <p className="font-semibold text-amber-800">
                {lowStock} product{lowStock > 1 ? "s are" : " is"} running low on stock
              </p>
              <p className="text-sm text-amber-700">
                Consider restocking soon to avoid running out.
              </p>
            </div>
            <Link to="/products" className="w-full sm:w-auto mt-2 sm:mt-0">
              <Button
                size="sm"
                className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white"
              >
                View Products
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
import { useState, useEffect, useCallback } from "react";
import {
  Search,
  X,
  RefreshCw,
  ChevronDown,
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import orderService from "@/services/orderService";
import { useAuth } from "@/context/AuthContext";

const STATUS_CONFIG = {
  pending:    { label: "Pending",    color: "bg-amber-100 text-amber-700 border-amber-200",   dot: "bg-amber-500",   icon: Clock },
  confirmed:  { label: "Confirmed",  color: "bg-zinc-100 text-zinc-700 border-zinc-200",       dot: "bg-zinc-600",    icon: CheckCircle },
  processing: { label: "Processing", color: "bg-zinc-100 text-zinc-700 border-zinc-200", dot: "bg-zinc-600",  icon: Loader },
  completed:  { label: "Completed",  color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", icon: CheckCircle },
  cancelled:  { label: "Cancelled",  color: "bg-red-100 text-red-700 border-red-200",          dot: "bg-red-500",     icon: XCircle },
};

const TABS = ["all", "pending", "confirmed", "processing", "completed", "cancelled"];

const VALID_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["completed"],
  completed: [],
  cancelled: [],
};

/* ─── Order Detail Modal ─────────────────────────────────────────── */
const OrderDetailModal = ({ open, onOpenChange, order, onStatusUpdate, isAdmin }) => {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const allowedStatuses = order ? (VALID_TRANSITIONS[order.status] || []) : [];

  useEffect(() => {
    if (order) setNewStatus(allowedStatuses[0] || order.status);
  }, [order]);

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === order?.status) return;
    setUpdatingStatus(true);
    try {
      await orderService.updateStatus(order._id, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      onStatusUpdate(order._id, newStatus);
      onOpenChange(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (!order) return null;
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Order Details
            <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>
              {cfg.label}
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          {/* Meta */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-mono text-xs font-semibold">#{order._id?.slice(-10).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit", month: "short", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </span>
            </div>
            {order.expiresAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expires At</span>
                <span className="font-medium">
                  {new Date(order.expiresAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            )}
          </div>

          {/* Items */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Items ({order.items?.length || 0})
            </p>
            <div className="space-y-3">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Rs. {Number(item.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold">
                    Rs. {Number(item.subtotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span>Rs. {Number(order.totalAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Status Update (Admin only) */}
          {isAdmin && allowedStatuses.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Update Status
              </p>
              <div className="flex gap-2">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allowedStatuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_CONFIG[s]?.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleStatusUpdate}
                  disabled={updatingStatus || newStatus === order.status}
                  size="default"
                >
                  {updatingStatus ? "Updating..." : "Update"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ─── Main Orders Page ─────────────────────────────────────────── */
const Orders = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = isAdmin
        ? await orderService.getAll()
        : await orderService.getMyOrders();
      setOrders(res.data?.orders || res.data || []);
    } catch {
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleCancelOrder = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await orderService.cancel(cancelTarget._id);
      toast.success("Order cancelled");
      setCancelTarget(null);
      setOrders((prev) =>
        prev.map((o) => o._id === cancelTarget._id ? { ...o, status: "cancelled" } : o)
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const handleStatusUpdate = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => o._id === orderId ? { ...o, status: newStatus } : o)
    );
  };

  const openDetail = (order) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  // Tab counts
  const counts = TABS.reduce((acc, tab) => {
    acc[tab] = tab === "all"
      ? orders.length
      : orders.filter((o) => o.status === tab).length;
    return acc;
  }, {});

  const filtered = orders.filter((o) => {
    const matchTab = activeTab === "all" || o.status === activeTab;
    const matchSearch =
      !search ||
      o._id?.toLowerCase().includes(search.toLowerCase()) ||
      o.items?.some((i) => i.name?.toLowerCase().includes(search.toLowerCase()));
    return matchTab && matchSearch;
  });

  // Stats row
  const stats = [
    { key: "pending",    label: "Pending",    icon: Clock,         color: "text-amber-600 bg-amber-50" },
    { key: "processing", label: "Processing", icon: Loader,        color: "text-zinc-700 bg-zinc-100" },
    { key: "completed",  label: "Completed",  icon: CheckCircle,   color: "text-emerald-600 bg-emerald-50" },
    { key: "cancelled",  label: "Cancelled",  icon: XCircle,       color: "text-red-600 bg-red-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isAdmin ? "Manage all orders" : "View your order history"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchOrders}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Row */}
      {!loading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map(({ key, label, icon: Icon, color }) => (
            <Card
              key={key}
              className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
              onClick={() => setActiveTab(key)}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xl font-bold">{counts[key] || 0}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Search + Tabs */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by order ID or product name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {/* Status Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span className="ml-1.5 opacity-70">({counts[tab] || 0})</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {error ? (
        <ErrorState message={error} onRetry={fetchOrders} />
      ) : loading ? (
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="divide-y">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-20 text-right" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={search ? "No orders match your search" : `No ${activeTab === "all" ? "" : activeTab} orders`}
          description={search ? "Try different keywords." : "Orders will appear here once placed from POS."}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-6 py-3.5 text-left font-semibold text-muted-foreground">Order ID</th>
                <th className="px-6 py-3.5 text-left font-semibold text-muted-foreground">Items</th>
                <th className="px-6 py-3.5 text-left font-semibold text-muted-foreground">Status</th>
                <th className="px-6 py-3.5 text-right font-semibold text-muted-foreground">Total</th>
                <th className="px-6 py-3.5 text-left font-semibold text-muted-foreground">Date</th>
                <th className="px-6 py-3.5 text-right font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((order) => {
                const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                const canCancel = ["pending", "confirmed"].includes(order.status);
                return (
                  <tr
                    key={order._id}
                    className="group transition-colors hover:bg-muted/30 cursor-pointer"
                    onClick={() => openDetail(order)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                        <span className="font-mono text-xs font-semibold text-muted-foreground">
                          #{order._id?.slice(-8).toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">
                        {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {order.items?.map((i) => i.name).join(", ")}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold">
                      Rs. {Number(order.totalAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className="flex justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => openDetail(order)}
                        >
                          Details
                        </Button>
                        {canCancel && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setCancelTarget(order)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        order={selectedOrder}
        onStatusUpdate={handleStatusUpdate}
        isAdmin={isAdmin}
      />

      {/* Cancel Confirmation */}
      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(v) => { if (!v) setCancelTarget(null); }}
        title="Cancel Order?"
        description={`Order #${cancelTarget?._id?.slice(-8).toUpperCase()} will be cancelled. This cannot be undone.`}
        onConfirm={handleCancelOrder}
        confirmLabel="Cancel Order"
        isLoading={cancelling}
      />
    </div>
  );
};

export default Orders;
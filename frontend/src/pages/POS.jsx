import { useState, useEffect, useCallback } from "react";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  X,
  CreditCard,
  Banknote,
  CheckCircle,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import productService from "@/services/productService";
import orderService from "@/services/orderService";
import paymentService from "@/services/paymentService";

const CATEGORIES = ["All", "Food", "Beverages", "Electronics", "Clothing", "Accessories", "Other"];

/* ─── Product Card ─────────────────────────────────────────────── */
const ProductCard = ({ product, onAdd }) => {
  const available = (product.stock || 0) - (product.reservedStock || 0);
  const outOfStock = available <= 0;

  return (
    <button
      onClick={() => !outOfStock && onAdd(product)}
      disabled={outOfStock}
      className={`group relative flex flex-col justify-between rounded-xl border bg-card p-4 text-left shadow-sm transition-all duration-200 min-h-[110px]
        ${outOfStock
          ? "cursor-not-allowed opacity-50 bg-muted/30"
          : "cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-zinc-400 active:scale-95"
        }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {product.category || "General"}
          </span>
          {outOfStock ? (
            <span className="rounded-full bg-red-100 border border-red-200 px-2 py-0.5 text-[10px] font-semibold text-red-700">
              Out of Stock
            </span>
          ) : (
            <span className="text-[11px] font-medium text-muted-foreground">
              {available} left
            </span>
          )}
        </div>
        <p className="mt-2 text-sm font-semibold leading-tight line-clamp-2">
          {product.name}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between border-t pt-2">
        <p className="text-base font-bold text-zinc-900">
          Rs. {Number(product.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </p>
        {!outOfStock && (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black text-white group-hover:bg-zinc-800 transition-colors">
            <Plus className="h-4 w-4" />
          </div>
        )}
      </div>
    </button>
  );
};

/* ─── Cart Item Row ─────────────────────────────────────────────── */
const CartItem = ({ item, onIncrease, onDecrease, onRemove }) => (
  <div className="flex items-center gap-3 py-3 border-b last:border-0">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold leading-tight truncate">{item.name}</p>
      <p className="text-xs text-muted-foreground">
        Rs. {Number(item.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })} each
      </p>
    </div>
    <div className="flex items-center gap-1">
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 rounded-full"
        onClick={() => onDecrease(item._id)}
      >
        <Minus className="h-3 w-3" />
      </Button>
      <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 rounded-full"
        onClick={() => onIncrease(item._id)}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-sm font-bold min-w-[64px] text-right">
        Rs. {(item.price * item.quantity).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      </span>
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 text-muted-foreground hover:text-destructive"
        onClick={() => onRemove(item._id)}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  </div>
);

/* ─── Payment Modal ─────────────────────────────────────────────── */
const PaymentModal = ({ open, onOpenChange, order, cartItems, total, onSuccess }) => {
  const [method, setMethod] = useState("cash");
  const [amountTendered, setAmountTendered] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const change = method === "cash" && amountTendered
    ? Math.max(0, Number(amountTendered) - total)
    : 0;

  const canPay =
    method === "card" ||
    (amountTendered && Number(amountTendered) >= total);

  const handlePay = async () => {
    setLoading(true);
    try {
      await paymentService.makePayment({
        orderId: order?._id,
        paymentStatus: "success",
        method,
        amountTendered: method === "cash" ? Number(amountTendered) : total,
      });
      setSuccess(true);
      toast.success("Payment successful! 🎉");
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (success) onSuccess();
    else onOpenChange(false);
    setSuccess(false);
    setMethod("cash");
    setAmountTendered("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {success ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
            <h2 className="mt-4 text-xl font-bold">Payment Complete!</h2>
            <p className="mt-1 text-muted-foreground">Transaction processed successfully.</p>
            {method === "cash" && change > 0 && (
              <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 px-6 py-3 w-full">
                <p className="text-sm text-emerald-700 font-medium">Change to return</p>
                <p className="text-2xl font-bold text-emerald-700">
                  Rs. {change.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}
            <Button onClick={handleClose} className="mt-6 w-full">
              Start New Sale
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Process Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-2">
              {/* Order Summary */}
              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Order Summary
                </p>
                {cartItems.map((item) => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      Rs. {(item.price * item.quantity).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>Rs. {total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "cash", icon: Banknote, label: "Cash" },
                    { value: "card", icon: CreditCard, label: "Card" },
                  ].map(({ value, icon: Icon, label }) => (
                    <button
                      key={value}
                      onClick={() => setMethod(value)}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                        method === value
                          ? "border-black bg-zinc-50 text-zinc-900"
                          : "border-border hover:border-zinc-400 hover:bg-zinc-50/50"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-sm font-semibold">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cash: amount tendered */}
              {method === "cash" && (
                <div className="space-y-1.5">
                  <Label htmlFor="tendered">Amount Tendered (Rs.)</Label>
                  <Input
                    id="tendered"
                    type="number"
                    min={total}
                    step="1"
                    placeholder={`Minimum Rs. ${total.toFixed(2)}`}
                    value={amountTendered}
                    onChange={(e) => setAmountTendered(e.target.value)}
                  />
                  {amountTendered && Number(amountTendered) >= total && (
                    <div className="flex justify-between rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                      <span className="text-sm text-emerald-700 font-medium">Change</span>
                      <span className="text-sm font-bold text-emerald-700">
                        Rs. {change.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                disabled={!canPay || loading}
                onClick={handlePay}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? "Processing..." : "Confirm Payment"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

/* ─── Main POS Page ─────────────────────────────────────────────── */
const POS = () => {
  const { items, addItem, removeItem, updateQuantity, clearCart, total, itemCount } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [checkoutOrder, setCheckoutOrder] = useState(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productService.getAll();
      setProducts(res.data?.products || res.data || []);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filtered = products.filter((p) => {
    const matchSearch =
      !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || p.category === category;
    return matchSearch && matchCat;
  });

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setCheckingOut(true);
    try {
      const payload = {
        items: items.map((i) => ({
          product: i._id,
          quantity: i.quantity,
        })),
      };
      const res = await orderService.checkout(payload);
      const order = res.data?.order || res.data;
      setCheckoutOrder(order);
      setPaymentOpen(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Checkout failed");
    } finally {
      setCheckingOut(false);
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    setCheckoutOrder(null);
    setPaymentOpen(false);
    fetchProducts();
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-0 -m-6">
      {/* ── Left: Product Catalog ─────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden border-r bg-background">
        {/* Search + Category bar */}
        <div className="border-b bg-background p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
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
          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  category === cat
                    ? "bg-black text-white shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-zinc-200 hover:text-zinc-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="rounded-xl border bg-card p-3">
                  <Skeleton className="h-28 w-full rounded-lg" />
                  <Skeleton className="mt-3 h-3 w-16" />
                  <Skeleton className="mt-1.5 h-4 w-full" />
                  <Skeleton className="mt-2 h-4 w-24" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="font-semibold">No products found</p>
              <p className="text-sm text-muted-foreground">
                {search ? `No results for "${search}"` : "No products in this category"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  onAdd={(product) => {
                    addItem(product);
                    toast.success(`${product.name} added to cart`, { duration: 1500 });
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Cart ──────────────────────────────────────── */}
      <div className="flex w-80 flex-col bg-background lg:w-96">
        {/* Cart Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-zinc-800" />
            <span className="font-bold">Cart</span>
            {itemCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-[11px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </div>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCart}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              Clear all
            </Button>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full pb-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-3">
                <ShoppingCart className="h-7 w-7 text-muted-foreground/50" />
              </div>
              <p className="font-semibold text-muted-foreground">Cart is empty</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click a product to add it here
              </p>
            </div>
          ) : (
            <div className="py-2">
              {items.map((item) => (
                <CartItem
                  key={item._id}
                  item={item}
                  onIncrease={(id) => updateQuantity(id, item.quantity + 1)}
                  onDecrease={(id) => updateQuantity(id, item.quantity - 1)}
                  onRemove={removeItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {items.length > 0 && (
          <div className="border-t bg-background p-4 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({itemCount} items)</span>
                <span>Rs. {total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-zinc-900 text-lg font-bold">
                  Rs. {total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <Button
              className="w-full gap-2 bg-black hover:bg-zinc-800 h-11 text-base font-semibold"
              onClick={handleCheckout}
              disabled={checkingOut}
            >
              {checkingOut ? (
                "Processing..."
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Checkout · Rs. {total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        order={checkoutOrder}
        cartItems={items}
        total={total}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default POS;
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import cartService from "@/services/cartService";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    try {
      const res = await cartService.getCart();
      const rawCart = res.data?.cart;
      if (rawCart?.items) {
        const formatted = rawCart.items
          .filter((item) => item.product)
          .map((item) => ({
            _id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            stock: item.product.stock,
            category: item.product.category,
            quantity: item.quantity,
          }));
        setItems(formatted);
      } else {
        setItems([]);
      }
    } catch {
      // Keep existing local state if fetch fails
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = useCallback(async (product, quantity = 1) => {
    // Optimistic UI update
    setItems((prev) => {
      const existing = prev.find((i) => i._id === product._id);
      if (existing) {
        return prev.map((i) =>
          i._id === product._id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { ...product, quantity }];
    });

    try {
      await cartService.addToCart(product._id, quantity);
    } catch {
      // Backend error fallback
    }
  }, []);

  const removeItem = useCallback(async (productId) => {
    setItems((prev) => prev.filter((i) => i._id !== productId));
    try {
      await cartService.removeFromCart(productId);
    } catch {
      // Backend error fallback
    }
  }, []);

  const updateQuantity = useCallback(async (productId, quantity) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i._id !== productId));
      try {
        await cartService.removeFromCart(productId);
      } catch {}
      return;
    }

    setItems((prev) =>
      prev.map((i) => (i._id === productId ? { ...i, quantity } : i))
    );

    try {
      await cartService.updateCartItem(productId, quantity);
    } catch {}
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const total = items.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 0), 0);
  const itemCount = items.reduce((sum, i) => sum + (i.quantity || 0), 0);

  return (
    <CartContext.Provider
      value={{ items, loading, fetchCart, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

export default CartContext;

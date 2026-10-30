import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import api from "../services/api";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get("/cart");
      setItems(data.cart.items || []);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart().catch(() => setItems([]));
  }, [refreshCart]);

  const addItem = useCallback(async (product, quantity = 1) => {
    const { data } = await api.post("/cart", {
      productId: product._id,
      quantity,
    });
    setItems(data.cart.items || []);
  }, []);

  const updateQuantity = useCallback(async (productId, quantity) => {
    const { data } = await api.put(`/cart/${productId}`, { quantity });
    setItems(data.cart.items || []);
  }, []);

  const removeItem = useCallback(async (productId) => {
    const { data } = await api.delete(`/cart/${productId}`);
    setItems(data.cart.items || []);
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce(
    (total, item) => total + (item.product?.price || 0) * item.quantity,
    0,
  );
  const value = useMemo(
    () => ({
      items,
      loading,
      itemCount,
      subtotal,
      addItem,
      updateQuantity,
      removeItem,
      refreshCart,
      clearCart,
    }),
    [
      items,
      loading,
      itemCount,
      subtotal,
      addItem,
      updateQuantity,
      removeItem,
      refreshCart,
      clearCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cartApi } from "../api/cart";

const CartContext = createContext(null);

const FEEDBACK_DURATION_MS = 6500;

const normalizeItem = (product, options = {}) => ({
  productId: product.id,
  title: product.title,
  price: Number(product.price),
  image: product.image,
  recentLowestPrice: product.recentLowestPrice ?? product.price,
  originalPrice: product.originalPrice,
  discountPercent: product.discountPercent,
  sold: product.sold ?? 422,
  rating: product.rating ?? 5,
  deliveryPrice: product.deliveryPrice ?? product.price,
  deliveryDates: product.deliveryDates ?? "23 - 25 May",
  quantity: options.quantity ?? 1,
  color: options.color ?? null,
});

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cartFeedback, setCartFeedback] = useState(null);
  const feedbackTimerRef = useRef(null);

  const dismissCartFeedback = useCallback(() => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
    setCartFeedback(null);
  }, []);

  const showCartFeedback = useCallback(
    (payload) => {
      dismissCartFeedback();
      setCartFeedback({
        type: "cart",
        id: Date.now(),
        ...payload,
      });
      feedbackTimerRef.current = setTimeout(() => {
        setCartFeedback(null);
        feedbackTimerRef.current = null;
      }, FEEDBACK_DURATION_MS);
    },
    [dismissCartFeedback]
  );

  useEffect(() => {
    const loadCart = async () => {
      try {
        const data = await cartApi.getCart();
        setItems(data.items || []);
      } catch {
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();

    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  const persistItems = useCallback(async (nextItems) => {
    setItems(nextItems);
    await cartApi.saveCart(nextItems);
  }, []);

  const addItem = useCallback(
    async (product, options) => {
      const entry = normalizeItem(product, options);
      const existing = items.find((item) => item.productId === entry.productId);

      let nextItems;
      let action = "added";

      if (existing) {
        action = "updated";
        nextItems = items.map((item) =>
          item.productId === entry.productId
            ? { ...item, quantity: item.quantity + entry.quantity }
            : item
        );
      } else {
        nextItems = [...items, entry];
      }

      const itemCount = nextItems.reduce((sum, item) => sum + item.quantity, 0);
      const total = nextItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      showCartFeedback({
        action,
        product: {
          id: entry.productId,
          title: entry.title,
          price: entry.price,
          image: entry.image,
          quantity: entry.quantity,
        },
        itemCount,
        total,
      });

      await persistItems(nextItems);
    },
    [items, persistItems, showCartFeedback]
  );

  const updateQuantity = useCallback(
    async (productId, quantity) => {
      if (quantity <= 0) {
        await persistItems(items.filter((item) => item.productId !== productId));
        return;
      }

      await persistItems(
        items.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    },
    [items, persistItems]
  );

  const removeItem = useCallback(
    async (productId) => {
      await persistItems(items.filter((item) => item.productId !== productId));
    },
    [items, persistItems]
  );

  const clearCart = useCallback(async () => {
    await cartApi.clearCart();
    setItems([]);
  }, []);

  const value = useMemo(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return {
      items,
      itemCount,
      total,
      isLoading,
      isEmpty: items.length === 0,
      cartFeedback,
      dismissCartFeedback,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    };
  }, [
    items,
    isLoading,
    cartFeedback,
    dismissCartFeedback,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

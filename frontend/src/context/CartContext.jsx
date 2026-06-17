/*
 * Shopping cart: always saved via cartApi (localStorage).
 * Shows short-term toast notifications when products are added or changed.
 */
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

/** React context for saved cart items and action handlers. */
const CartContext = createContext(null);
const FEEDBACK_DURATION_MS = 6500;

/**
 * Converts catalog item and options into cart line form for storage.
 * @param {object} product
 * @param {{ quantity?: number, color?: string|null }} [options]
 * @returns {object}
 */
const normalizeItem = (product, options = {}) => ({
  productId: product.id,
  slug: product.slug ?? null,
  title: product.title,
  price: Number(product.price),
  image: product.image,
  recentLowestPrice: product.recentLowestPrice ?? product.price,
  originalPrice: product.originalPrice,
  discountPercent: product.discountPercent,
  sold: product.sold,
  variantId: product.variantId ?? null,
  quantity: options.quantity ?? 1,
  color: options.color ?? null,
});

/**
 * Provides cart status, saves, and toast notifications to the component tree.
 * @param {{ children: import("react").ReactNode }} props
 */
export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cartFeedback, setCartFeedback] = useState(null);
  const feedbackTimerRef = useRef(null);

  /** Resets the toast snooze timer and hides the active trash notification. */
  const dismissCartFeedback = useCallback(() => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
    setCartFeedback(null);
  }, []);

  /**
   * Shows a brief toast after adding or changing quantities.
   * @param {object} payload
   */
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
    [dismissCartFeedback],
  );

  /**
   * Loads positions from storage when mounted and clears notification timers when unmounted.
   */
  useEffect(() => {
    /**
     * Loads saved positions and ends the initial loading state.
     */
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

  /**
   * Updates positions in memory and synchronizes the snapshot with storage.
   * @param {object[]} nextItems
   */
  const persistItems = useCallback(async (nextItems) => {
    setItems(nextItems);
    await cartApi.saveCart(nextItems);
  }, []);

  /**
   * Adds a product or increases the quantity if such a product already exists.
   * @param {object} product
   * @param {{ quantity?: number, color?: string|null }} [options]
   */
  const addItem = useCallback(
    async (product, options) => {
      const entry = normalizeItem(product, options);
      const existing = items.find((item) => item.productId === entry.productId);
      /* Updated cart snapshot after merging or adding. */
      let nextItems;
      let action = "added";
      if (existing) {
        action = "updated";
        nextItems = items.map((item) =>
          item.productId === entry.productId
            ? { ...item, quantity: item.quantity + entry.quantity }
            : item,
        );
      } else {
        nextItems = [...items, entry];
      }
      const itemCount = nextItems.reduce((sum, item) => sum + item.quantity, 0);
      const total = nextItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
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
    [items, persistItems, showCartFeedback],
  );

  /**
   * Sets the quantity for an item or removes it if the value is zero or negative.
   * @param {string|number} productId
   * @param {number} quantity
   */
  const updateQuantity = useCallback(
    async (productId, quantity) => {
      if (quantity <= 0) {
        await persistItems(
          items.filter((item) => item.productId !== productId),
        );
        return;
      }
      await persistItems(
        items.map((item) =>
          item.productId === productId ? { ...item, quantity } : item,
        ),
      );
    },
    [items, persistItems],
  );

  /**
   * Deletes one position by product id.
   * @param {string|number} productId
   */
  const removeItem = useCallback(
    async (productId) => {
      await persistItems(items.filter((item) => item.productId !== productId));
    },
    [items, persistItems],
  );

  /** Clears storage and resets memory positions to an empty list. */
  const clearCart = useCallback(async () => {
    await cartApi.clearCart();
    setItems([]);
  }, []);

  const value = useMemo(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
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

/**
 * Reads cart status and activities from the nearest provider.
 * @returns {object}
 */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

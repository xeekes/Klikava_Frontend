/*
 * Корзина покупок: всегда сохраняется через cartApi (localStorage).
 * Показывает кратковременные toast-уведомления при добавлении или изменении товаров.
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

/** React-контекст для сохранённых позиций корзины и обработчиков действий. */
const CartContext = createContext(null);
const FEEDBACK_DURATION_MS = 6500;

/**
 * Преобразует товар каталога и опции в форму строки корзины для хранения.
 * @param {object} product
 * @param {{ quantity?: number, color?: string|null }} [options]
 * @returns {object}
 */
const normalizeItem = (product, options = {}) => ({
  productId: product.id,
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
 * Предоставляет состояние корзины, сохранение и toast-уведомления дереву компонентов.
 * @param {{ children: import("react").ReactNode }} props
 */
export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cartFeedback, setCartFeedback] = useState(null);
  const feedbackTimerRef = useRef(null);

  /** Сбрасывает отложенный таймер toast и скрывает активное уведомление корзины. */
  const dismissCartFeedback = useCallback(() => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
    setCartFeedback(null);
  }, []);

  /**
   * Показывает кратковременный toast после добавления или изменения количества.
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
   * Загружает позиции из хранилища при монтировании и очищает таймеры уведомлений при размонтировании.
   */
  useEffect(() => {
    /**
     * Загружает сохранённые позиции и завершает начальное состояние загрузки.
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
   * Обновляет позиции в памяти и синхронизирует снимок с хранилищем.
   * @param {object[]} nextItems
   */
  const persistItems = useCallback(async (nextItems) => {
    setItems(nextItems);
    await cartApi.saveCart(nextItems);
  }, []);

  /**
   * Добавляет товар или увеличивает количество, если такой товар уже есть.
   * @param {object} product
   * @param {{ quantity?: number, color?: string|null }} [options]
   */
  const addItem = useCallback(
    async (product, options) => {
      const entry = normalizeItem(product, options);
      const existing = items.find((item) => item.productId === entry.productId);
      /* Обновлённый снимок корзины после слияния или добавления. */
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
   * Устанавливает количество для позиции или удаляет её при нулевом или отрицательном значении.
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
   * Удаляет одну позицию по id товара.
   * @param {string|number} productId
   */
  const removeItem = useCallback(
    async (productId) => {
      await persistItems(items.filter((item) => item.productId !== productId));
    },
    [items, persistItems],
  );

  /** Очищает хранилище и сбрасывает позиции в памяти в пустой список. */
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
 * Читает состояние корзины и действия из ближайшего провайдера.
 * @returns {object}
 */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

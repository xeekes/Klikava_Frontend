/*
 * Список желаний: id товаров в localStorage, разрешаются через товары CatalogContext.
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
import { useCatalog } from "./CatalogContext";
import { readStorage, STORAGE_KEYS, writeStorage } from "../utils/storage";

/**
 * Находит товар в списке по числовому или строковому id.
 * @param {object[]} products
 * @param {string|number} productId
 * @returns {object|null}
 */
const findProductById = (products, productId) =>
  products.find((item) => String(item.id) === String(productId)) || null;

/** React-контекст для сохранённых id товаров и обработчиков списка желаний. */
const FavoritesContext = createContext(null);
const FEEDBACK_DURATION_MS = 5500;

/**
 * Предоставляет состояние списка желаний, сохранение и toast-уведомления дереву компонентов.
 * @param {{ children: import("react").ReactNode }} props
 */
export const FavoritesProvider = ({ children }) => {
  const { products } = useCatalog();
  const [favoriteIds, setFavoriteIds] = useState(() =>
    readStorage(STORAGE_KEYS.favorites, []),
  );
  const [wishlistFeedback, setWishlistFeedback] = useState(null);
  const feedbackTimerRef = useRef(null);

  /**
   * Синхронизирует id избранного с хранилищем при изменении списка в памяти.
   */
  useEffect(() => {
    writeStorage(STORAGE_KEYS.favorites, favoriteIds);
  }, [favoriteIds]);

  /**
   * Очищает таймер скрытия уведомления при размонтировании провайдера.
   */
  useEffect(
    () => () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    },
    [],
  );

  /** Сбрасывает отложенный таймер toast и скрывает активное уведомление списка желаний. */
  const dismissWishlistFeedback = useCallback(() => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
    setWishlistFeedback(null);
  }, []);

  /**
   * Показывает кратковременный toast после добавления или удаления.
   * @param {object} payload
   */
  const showWishlistFeedback = useCallback(
    (payload) => {
      dismissWishlistFeedback();
      setWishlistFeedback({
        type: "wishlist",
        id: Date.now(),
        ...payload,
      });
      feedbackTimerRef.current = setTimeout(() => {
        setWishlistFeedback(null);
        feedbackTimerRef.current = null;
      }, FEEDBACK_DURATION_MS);
    },
    [dismissWishlistFeedback],
  );

  /**
   * Формирует payload toast из снимка товара и итогового количества.
   * @param {object|null} product
   * @param {string} action
   * @param {number} favoritesCount
   */
  const notifyWishlistChange = useCallback(
    (product, action, favoritesCount) => {
      if (!product) {
        return;
      }
      showWishlistFeedback({
        action,
        product: {
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.image,
        },
        favoritesCount,
      });
    },
    [showWishlistFeedback],
  );

  /**
   * Добавляет или удаляет id товара и показывает соответствующий toast.
   * @param {string|number} productId
   */
  const toggleFavorite = useCallback(
    (productId) => {
      const id = Number(productId);
      const product = findProductById(products, productId);
      const isRemoving = favoriteIds.includes(id);
      const nextIds = isRemoving
        ? favoriteIds.filter((item) => item !== id)
        : [...favoriteIds, id];
      setFavoriteIds(nextIds);
      notifyWishlistChange(
        product,
        isRemoving ? "removed" : "added",
        nextIds.length,
      );
    },
    [favoriteIds, notifyWishlistChange, products],
  );

  /**
   * Удаляет id товара, если он есть, и показывает уведомление об удалении.
   * @param {string|number} productId
   */
  const removeFavorite = useCallback(
    (productId) => {
      const id = Number(productId);
      const product = findProductById(products, productId);
      if (!favoriteIds.includes(id)) {
        return;
      }
      const nextIds = favoriteIds.filter((item) => item !== id);
      setFavoriteIds(nextIds);
      notifyWishlistChange(product, "removed", nextIds.length);
    },
    [favoriteIds, notifyWishlistChange, products],
  );

  /**
   * Проверяет, сохранён ли id товара в списке желаний.
   * @param {string|number} productId
   * @returns {boolean}
   */
  const isFavorite = useCallback(
    (productId) => favoriteIds.includes(Number(productId)),
    [favoriteIds],
  );

  const favorites = useMemo(
    () =>
      favoriteIds
        .map((id) => findProductById(products, id))
        .filter(Boolean)
        .map((product) => ({
          ...product,
          sold: product.sold,
          recentLowestPrice: product.recentLowestPrice ?? product.price,
          rating: Math.round(product.rating ?? 5),
        })),
    [favoriteIds, products],
  );

  const value = useMemo(
    () => ({
      favorites,
      favoriteIds,
      toggleFavorite,
      removeFavorite,
      isFavorite,
      wishlistFeedback,
      dismissWishlistFeedback,
    }),
    [
      favorites,
      favoriteIds,
      toggleFavorite,
      removeFavorite,
      isFavorite,
      wishlistFeedback,
      dismissWishlistFeedback,
    ],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

/**
 * Читает состояние списка желаний и действия из ближайшего провайдера.
 * @returns {object}
 */
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return context;
};

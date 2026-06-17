/*
 * Wishlist: product ids in localStorage, resolved through CatalogContext products.
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
 * Finds a product in the list by numeric or string id.
 * @param {object[]} products
 * @param {string|number} productId
 * @returns {object|null}
 */
const findProductById = (products, productId) =>
  products.find((item) => String(item.id) === String(productId)) || null;

/** React context for saved product ids and wishlist handlers. */
const FavoritesContext = createContext(null);
const FEEDBACK_DURATION_MS = 5500;

/**
 * Provides wishlist state, persistence, and toast notifications to the component tree.
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
   * Synchronizes the favorites id with the storage when the list in memory changes.
   */
  useEffect(() => {
    writeStorage(STORAGE_KEYS.favorites, favoriteIds);
  }, [favoriteIds]);

  /**
   * Clears the notification hiding timer when the provider is unmounted.
   */
  useEffect(
    () => () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    },
    [],
  );

  /** Resets the snooze toast timer and hides the active wishlist notification. */
  const dismissWishlistFeedback = useCallback(() => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
    setWishlistFeedback(null);
  }, []);

  /**
   * Shows a brief toast after adding or deleting.
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
   * Generates a payload toast from a product snapshot and the total quantity.
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
   * Adds or removes a product id and shows the corresponding toast.
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
   * Deletes the product id, if any, and displays a deletion notification.
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
   * Checks whether the product id is saved in the wishlist.
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
 * Reads wishlist status and actions from the nearest provider.
 * @returns {object}
 */
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return context;
};

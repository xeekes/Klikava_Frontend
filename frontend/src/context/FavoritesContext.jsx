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

const findProductById = (products, productId) =>
  products.find((item) => String(item.id) === String(productId)) || null;

const FavoritesContext = createContext(null);

const FEEDBACK_DURATION_MS = 5500;

export const FavoritesProvider = ({ children }) => {
  const { products } = useCatalog();
  const [favoriteIds, setFavoriteIds] = useState(() =>
    readStorage(STORAGE_KEYS.favorites, [])
  );
  const [wishlistFeedback, setWishlistFeedback] = useState(null);
  const feedbackTimerRef = useRef(null);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.favorites, favoriteIds);
  }, [favoriteIds]);

  useEffect(
    () => () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    },
    []
  );

  const dismissWishlistFeedback = useCallback(() => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
    setWishlistFeedback(null);
  }, []);

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
    [dismissWishlistFeedback]
  );

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
    [showWishlistFeedback]
  );

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
        nextIds.length
      );
    },
    [favoriteIds, notifyWishlistChange, products]
  );

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
    [favoriteIds, notifyWishlistChange, products]
  );

  const isFavorite = useCallback(
    (productId) => favoriteIds.includes(Number(productId)),
    [favoriteIds]
  );

  const favorites = useMemo(
    () =>
      favoriteIds
        .map((id) => findProductById(products, id))
        .filter(Boolean)
        .map((product) => ({
          ...product,
          sold: product.sold ?? 422,
          recentLowestPrice: product.recentLowestPrice ?? product.price,
          rating: Math.round(product.rating ?? 5),
        })),
    [favoriteIds, products]
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
    ]
  );

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return context;
};

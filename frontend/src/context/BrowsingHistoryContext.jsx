/*
 * Recently viewed items (max. 40 entries), grouped by date for profile page.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useCatalog } from "./CatalogContext";
import { readStorage, STORAGE_KEYS, writeStorage } from "../utils/storage";

/** React context for recently viewed products and tracking handlers. */
const BrowsingHistoryContext = createContext(null);

/**
 * Formats an ISO date into a short English date stamp for grouping.
 * @param {Date} date
 * @returns {string}
 */
const formatDateLabel = (date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

/**
 * Groups browsing records by calendar day, deduplicating products within a day.
 * @param {object[]} entries
 * @returns {object[]}
 */
const groupProductsByDate = (entries) => {
  const groups = new Map();
  entries.forEach((entry) => {
    const dateKey = entry.viewedAt.slice(0, 10);
    if (!groups.has(dateKey)) {
      groups.set(dateKey, {
        date: formatDateLabel(new Date(entry.viewedAt)),
        products: [],
      });
    }
    const group = groups.get(dateKey);
    if (!group.products.some((item) => item.id === entry.product.id)) {
      group.products.push(entry.product);
    }
  });
  return Array.from(groups.values());
};

/**
 * Mixes current catalog data (including image) into a product snapshot from history.
 * @param {object} snapshot
 * @param {Array<object>} catalogProducts
 * @returns {object}
 */
const mergeWithCatalogProduct = (snapshot, catalogProducts) => {
  const catalogProduct = catalogProducts.find(
    (item) => String(item.id) === String(snapshot.id),
  );
  if (!catalogProduct) {
    return snapshot;
  }
  return {
    ...catalogProduct,
    title: snapshot.title || catalogProduct.title,
    price: snapshot.price ?? catalogProduct.price,
    sold: snapshot.sold ?? catalogProduct.sold,
  };
};

/**
 * Provides grouped browsing history and tracking to the component tree.
 * @param {{ children: import("react").ReactNode }} props
 */
export const BrowsingHistoryProvider = ({ children }) => {
  const { products: catalogProducts } = useCatalog();
  const [entries, setEntries] = useState(() =>
    readStorage(STORAGE_KEYS.browsingHistory, []),
  );

  /**
   * Synchronizes view records with storage when the list in memory changes.
   */
  useEffect(() => {
    writeStorage(STORAGE_KEYS.browsingHistory, entries);
  }, [entries]);

  /**
   * Records product views, moves them to the top and limits the length of the list.
   * @param {object} product
   */
  const trackProduct = useCallback((product) => {
    if (!product?.id) {
      return;
    }
    setEntries((prev) =>
      [
        {
          viewedAt: new Date().toISOString(),
          product: {
            id: product.id,
            slug: product.slug ?? null,
            title: product.title,
            price: product.price,
            image: product.image,
            sold: product.sold,
          },
        },
        ...prev.filter((entry) => entry.product.id !== product.id),
      ].slice(0, 40),
    );
  }, []);

  const groups = useMemo(() => {
    const enrichedEntries = entries.map((entry) => ({
      ...entry,
      product: mergeWithCatalogProduct(entry.product, catalogProducts),
    }));
    return groupProductsByDate(enrichedEntries);
  }, [entries, catalogProducts]);

  const value = useMemo(
    () => ({
      groups,
      trackProduct,
    }),
    [groups, trackProduct],
  );

  return (
    <BrowsingHistoryContext.Provider value={value}>
      {children}
    </BrowsingHistoryContext.Provider>
  );
};

/**
 * Reads browsing history status and activity from the nearest provider.
 * @returns {object}
 */
export const useBrowsingHistory = () => {
  const context = useContext(BrowsingHistoryContext);
  if (!context) {
    throw new Error(
      "useBrowsingHistory must be used within BrowsingHistoryProvider",
    );
  }
  return context;
};

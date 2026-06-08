import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { PROFILE_BROWSING_HISTORY } from "../data/profile";
import { readStorage, STORAGE_KEYS, writeStorage } from "../utils/storage";

const BrowsingHistoryContext = createContext(null);

const formatDateLabel = (date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

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

const buildDefaultEntries = () =>
  PROFILE_BROWSING_HISTORY.flatMap((group) =>
    group.products.map((product) => ({
      viewedAt: new Date().toISOString(),
      product,
    }))
  );

export const BrowsingHistoryProvider = ({ children }) => {
  const [entries, setEntries] = useState(() =>
    readStorage(STORAGE_KEYS.browsingHistory, buildDefaultEntries())
  );

  useEffect(() => {
    writeStorage(STORAGE_KEYS.browsingHistory, entries);
  }, [entries]);

  const trackProduct = useCallback((product) => {
    if (!product?.id) {
      return;
    }

    setEntries((prev) => [
      {
        viewedAt: new Date().toISOString(),
        product: {
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.image,
          sold: product.sold ?? 422,
        },
      },
      ...prev.filter((entry) => entry.product.id !== product.id),
    ].slice(0, 40));
  }, []);

  const groups = useMemo(() => groupProductsByDate(entries), [entries]);

  const value = useMemo(
    () => ({
      groups,
      trackProduct,
    }),
    [groups, trackProduct]
  );

  return (
    <BrowsingHistoryContext.Provider value={value}>
      {children}
    </BrowsingHistoryContext.Provider>
  );
};

export const useBrowsingHistory = () => {
  const context = useContext(BrowsingHistoryContext);
  if (!context) {
    throw new Error("useBrowsingHistory must be used within BrowsingHistoryProvider");
  }
  return context;
};

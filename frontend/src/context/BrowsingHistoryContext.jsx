/*
 * Недавно просмотренные товары (макс. 40 записей), сгруппированные по дате для страницы профиля.
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

/** React-контекст для недавно просмотренных товаров и обработчиков отслеживания. */
const BrowsingHistoryContext = createContext(null);

/**
 * Форматирует ISO-дату в короткую английскую метку для группировки.
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
 * Группирует записи просмотров по календарному дню, дедуплицируя товары внутри дня.
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
 * Подмешивает актуальные данные каталога (в т.ч. image) в снимок товара из истории.
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
 * Предоставляет сгруппированную историю просмотров и отслеживание дереву компонентов.
 * @param {{ children: import("react").ReactNode }} props
 */
export const BrowsingHistoryProvider = ({ children }) => {
  const { products: catalogProducts } = useCatalog();
  const [entries, setEntries] = useState(() =>
    readStorage(STORAGE_KEYS.browsingHistory, []),
  );

  /**
   * Синхронизирует записи просмотров с хранилищем при изменении списка в памяти.
   */
  useEffect(() => {
    writeStorage(STORAGE_KEYS.browsingHistory, entries);
  }, [entries]);

  /**
   * Записывает просмотр товара, выносит его в начало и ограничивает длину списка.
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
 * Читает состояние истории просмотров и действия из ближайшего провайдера.
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

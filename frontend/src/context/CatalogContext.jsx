/*
 * Состояние каталога: загружает товары/категории/скидки из API при настройке.
 * Предоставляет хелперы поиска и fetchProductDetail для страницы товара.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { catalogApi } from "../api/catalogApi";
import { hasApiBaseUrl } from "../api/client";
import { applyCatalogDiscounts } from "../api/mapCatalogItem";
import { createCatalogHelpers } from "../utils/catalogHelpers";
import { useAuth } from "./AuthContext";

/** React-контекст для состояния списка товаров и хелперов поиска. */
const CatalogContext = createContext(null);

/**
 * Предоставляет данные каталога, хелперы поиска и загрузку деталей дереву компонентов.
 * @param {{ children: import("react").ReactNode }} props
 */
export const CatalogProvider = ({ children }) => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [source, setSource] = useState("empty");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Загружает товары и, при авторизации, категории и скидки из API.
   */
  const loadCatalog = useCallback(async () => {
    if (!hasApiBaseUrl()) {
      setProducts([]);
      setCategories([]);
      setDiscounts([]);
      setSource("empty");
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      /* Категории и скидки на бэкенде требуют auth; товары — публичны. */
      const loadedCategories = isAuthenticated
        ? await catalogApi.listCategories()
        : [];
      const rawProducts = await catalogApi.listAllProducts();
      let mappedProducts = catalogApi.mapProducts(
        rawProducts,
        loadedCategories,
      );
      let loadedDiscounts = [];
      if (isAuthenticated) {
        loadedDiscounts = await catalogApi.listAllDiscounts();
        mappedProducts = applyCatalogDiscounts(mappedProducts, loadedDiscounts);
      }
      setCategories(loadedCategories);
      setProducts(mappedProducts);
      setDiscounts(loadedDiscounts);
      setSource("api");
    } catch (err) {
      console.warn("[catalog] API unavailable:", err.message);
      setProducts([]);
      setCategories([]);
      setDiscounts([]);
      setSource("error");
      setError(err.message || "Catalog API unavailable");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Перезагружает данные каталога после завершения bootstrap авторизации.
   */
  useEffect(() => {
    if (isAuthLoading) {
      return;
    }
    loadCatalog();
  }, [isAuthLoading, loadCatalog]);

  const helpers = useMemo(
    () => createCatalogHelpers(products, categories),
    [products, categories],
  );

  /**
   * Находит товар по id или slug, объединяя кэш списка с деталями из API.
   * @param {string|number} idOrSlug
   * @returns {Promise<object|undefined>}
   */
  const fetchProductDetail = useCallback(
    async (idOrSlug) => {
      const cached = helpers.getProductById(idOrSlug);
      if (!hasApiBaseUrl()) {
        return cached;
      }
      try {
        const raw = await catalogApi.getProductByIdOrSlug(idOrSlug);
        const detailed = catalogApi.buildProductDetail(raw, categories);
        const base = cached || helpers.getProductById(detailed.id);
        if (!base) {
          return helpers.getProductById(detailed.id) || detailed;
        }
        return {
          ...base,
          ...detailed,
          images: base.images?.length ? base.images : [detailed.image],
          colors: base.colors,
          tabs: base.tabs,
          sold: detailed.sold ?? base.sold,
          recentLowestPrice: detailed.originalPrice ?? base.recentLowestPrice,
        };
      } catch (err) {
        console.warn("[catalog] product detail:", err.message);
        return cached;
      }
    },
    [categories, helpers],
  );

  const value = useMemo(
    () => ({
      ...helpers,
      categories,
      discounts,
      source,
      isLoading,
      error,
      reloadCatalog: loadCatalog,
      fetchProductDetail,
      usesApi: source === "api",
      getSearchSuggestions: (query, options = {}) =>
        helpers.getSearchSuggestions(query, {
          ...options,
          categories,
        }),
    }),
    [
      helpers,
      categories,
      discounts,
      source,
      isLoading,
      error,
      loadCatalog,
      fetchProductDetail,
    ],
  );

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
};

/**
 * Читает состояние каталога и действия из ближайшего провайдера.
 * @returns {object}
 */
export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error("useCatalog must be used within CatalogProvider");
  }
  return context;
};

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
import { createCatalogHelpers, buildDetailTabs } from "../utils/catalogHelpers";

/** React-контекст для состояния списка товаров и хелперов поиска. */
const CatalogContext = createContext(null);

/**
 * Предоставляет данные каталога, хелперы поиска и загрузку деталей дереву компонентов.
 * @param {{ children: import("react").ReactNode }} props
 */
export const CatalogProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [source, setSource] = useState("empty");
  const [isLoading, setIsLoading] = useState(() => hasApiBaseUrl());
  const [error, setError] = useState(null);

  /**
   * Загружает товары, категории и скидки из публичного API витрины.
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
      const [loadedCategories, rawProducts, loadedDiscounts, popularIds] =
        await Promise.all([
          catalogApi.listCategories(),
          catalogApi.listAllProducts(),
          catalogApi.listAllDiscounts(),
          catalogApi.listPopularProductIds({ perPage: 12 }),
        ]);
      const mappedProducts = applyCatalogDiscounts(
        catalogApi.mapProducts(rawProducts, loadedCategories),
        loadedDiscounts,
      ).map((product) => ({
        ...product,
        isTop:
          popularIds.has(Number(product.id)) ||
          popularIds.has(product.id) ||
          product.isTop,
      }));
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
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

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
          images: detailed.images?.length
            ? detailed.images
            : base.images?.length
              ? base.images
              : detailed.image
                ? [detailed.image]
                : [],
          colors: detailed.colors?.length ? detailed.colors : base.colors || [],
          tabs: buildDetailTabs(detailed.shipping ?? base.shipping),
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

  /**
   * Ищет товары через API и возвращает нормализованный список.
   * @param {string} query
   * @param {{ scope?: string, categoryId?: string, topCategoryId?: string }} [scope]
   * @returns {Promise<Array<object>>}
   */
  const searchProductsRemote = useCallback(
    async (query, scope = {}) => {
      if (!hasApiBaseUrl() || !query.trim()) {
        return helpers.searchProducts(query, scope);
      }
      const rawItems = await catalogApi.searchProducts(query, {
        categoryId:
          scope.categoryId ||
          (scope.topCategoryId && scope.topCategoryId !== "all"
            ? scope.topCategoryId
            : null),
        hasDiscount: scope.scope === "discounts" ? true : null,
      });
      let mapped = applyCatalogDiscounts(
        catalogApi.mapProducts(rawItems, categories),
        discounts,
      );
      if (scope.scope === "top") {
        mapped = mapped.filter((product) => product.isTop);
      }
      return mapped;
    },
    [categories, discounts, helpers],
  );

  const value = useMemo(
    () => ({
      ...helpers,
      categories,
      discounts,
      source,
      isLoading,
      isFetchingCatalog: hasApiBaseUrl() && isLoading,
      error,
      reloadCatalog: loadCatalog,
      fetchProductDetail,
      searchProductsRemote,
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
      searchProductsRemote,
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

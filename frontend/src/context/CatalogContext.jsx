/*
 * Catalog state: loads products/categories/discounts from the API during setup.
 * Provides search and fetchProductDetail helpers for the product page.
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
import { createCatalogHelpers, mergeProductDetailView } from "../utils/catalogHelpers";

/** React context for the state of the product list and search helpers. */
const CatalogContext = createContext(null);

/**
 * Provides catalog data, search helpers, and part loading to the component tree.
 * @param {{ children: import("react").ReactNode }} props
 */
export const CatalogProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [features, setFeatures] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [source, setSource] = useState("empty");
  const [isLoading, setIsLoading] = useState(() => hasApiBaseUrl());
  const [error, setError] = useState(null);

  /**
   * Loads products, categories and discounts from the public storefront API.
   */
  const loadCatalog = useCallback(async () => {
    if (!hasApiBaseUrl()) {
      setProducts([]);
      setCategories([]);
      setFeatures([]);
      setDiscounts([]);
      setSource("empty");
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [loadedCategories, loadedFeatures, rawProducts, loadedDiscounts, popularIds] =
        await Promise.all([
          catalogApi.listCategories(),
          catalogApi.listFeatures().catch(() => []),
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
      setFeatures(loadedFeatures);
      setProducts(mappedProducts);
      setDiscounts(loadedDiscounts);
      setSource("api");
    } catch (err) {
      console.warn("[catalog] API unavailable:", err.message);
      setProducts([]);
      setCategories([]);
      setFeatures([]);
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
   * Finds a product by id or slug, combining the list cache with details from the API.
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
        return mergeProductDetailView(base, detailed);
      } catch (err) {
        console.warn("[catalog] product detail:", err.message);
        if (cached?.backendRaw) {
          const detailed = catalogApi.buildProductDetail(
            cached.backendRaw,
            categories,
          );
          return mergeProductDetailView(cached, detailed);
        }
        return cached;
      }
    },
    [categories, helpers],
  );

  /**
   * Searches for products via the API and returns a normalized list.
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
      features,
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
      features,
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
 * Reads directory state and activities from the nearest provider.
 * @returns {object}
 */
export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error("useCatalog must be used within CatalogProvider");
  }
  return context;
};

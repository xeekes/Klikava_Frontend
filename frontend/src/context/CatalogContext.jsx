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
import { ALL_PRODUCTS as MOCK_PRODUCTS } from "../data/products";
import { createCatalogHelpers } from "../utils/catalogHelpers";
import { useAuth } from "./AuthContext";

const CatalogContext = createContext(null);

export const CatalogProvider = ({ children }) => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [categories, setCategories] = useState([]);
  const [source, setSource] = useState("mock");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCatalog = useCallback(async () => {
    if (!hasApiBaseUrl() || !isAuthenticated) {
      setProducts(MOCK_PRODUCTS);
      setCategories([]);
      setSource("mock");
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const loadedCategories = await catalogApi.listCategories();
      const rawProducts = await catalogApi.listAllProducts();
      const mappedProducts = catalogApi.mapProducts(rawProducts, loadedCategories);

      if (!mappedProducts.length) {
        throw new Error("Backend returned an empty product list");
      }

      setCategories(loadedCategories);
      setProducts(mappedProducts);
      setSource("api");
    } catch (err) {
      console.warn("[catalog] API unavailable, using local mock data:", err.message);
      setProducts(MOCK_PRODUCTS);
      setCategories([]);
      setSource("mock-fallback");
      setError(err.message || "Catalog API unavailable");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    loadCatalog();
  }, [isAuthLoading, loadCatalog]);

  const helpers = useMemo(
    () => createCatalogHelpers(products),
    [products],
  );

  const value = useMemo(
    () => ({
      ...helpers,
      categories,
      source,
      isLoading,
      error,
      reloadCatalog: loadCatalog,
      usesApi: source === "api",
      getSearchSuggestions: (query, options = {}) =>
        helpers.getSearchSuggestions(query, {
          ...options,
          categories,
        }),
    }),
    [helpers, categories, source, isLoading, error, loadCatalog],
  );

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
};

export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error("useCatalog must be used within CatalogProvider");
  }
  return context;
};

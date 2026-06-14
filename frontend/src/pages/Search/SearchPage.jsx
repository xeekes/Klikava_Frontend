/* Страница результатов поиска; парсит q и scope из query-параметров URL. */
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CatalogListing from "../../components/CatalogListing/CatalogListing";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import PageSearchHero from "../../components/PageSearchHero/PageSearchHero";
import ProductCard from "../../components/ProductCard/ProductCard";
import { useCatalog } from "../../context/CatalogContext";
import {
  buildSearchUrl,
  getSearchScopeLabel,
  hasSearchScope,
  parseSearchScope,
} from "../../utils/searchScope";
import "./SearchPage.scss";

/**
 * Результаты полнотекстового поиска с необязательными фильтрами из URL.
 */
const SearchPage = () => {
  const {
    searchProducts,
    searchProductsRemote,
    getTopProducts,
    POPULAR_SEARCHES,
    categories,
    usesApi,
  } = useCatalog();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const scope = useMemo(() => parseSearchScope(searchParams), [searchParams]);
  const scopeLabel = getSearchScopeLabel(scope, categories);
  const isScoped = hasSearchScope(scope);
  const [remoteProducts, setRemoteProducts] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const localProducts = useMemo(
    () => searchProducts(query, scope),
    [query, scope, searchProducts],
  );

  useEffect(() => {
    if (!usesApi || !query.trim()) {
      setRemoteProducts([]);
      setSearchError("");
      return undefined;
    }
    let cancelled = false;
    const runSearch = async () => {
      setIsSearching(true);
      setSearchError("");
      try {
        const results = await searchProductsRemote(query, scope);
        if (!cancelled) {
          setRemoteProducts(results);
        }
      } catch (error) {
        if (!cancelled) {
          setSearchError(error.message || "Search failed.");
          setRemoteProducts([]);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    };
    runSearch();
    return () => {
      cancelled = true;
    };
  }, [query, scope, searchProductsRemote, usesApi]);

  const products = usesApi && query.trim() ? remoteProducts : localProducts;
  const trendingProducts = useMemo(
    () => getTopProducts("all").slice(0, 4),
    [getTopProducts],
  );
  const resultsTitle = query
    ? isScoped
      ? `Results for “${query}” in ${scopeLabel}`
      : `Results for “${query}”`
    : "";
  const resultsSubtitle = query
    ? `Found ${products.length} matching product${
        products.length === 1 ? "" : "s"
      }${isScoped ? ` among ${scopeLabel}` : ""}.`
    : "";

  return (
    <div className="search-page">
      <PageSearchHero
        eyebrow="Search"
        title="Find what you need faster"
        subtitle={
          isScoped && query
            ? `Searching within ${scopeLabel}.`
            : "Search by product name, category, or keyword."
        }
        placeholder="Try phone, bag, lamp, electronics..."
        popularTerms={POPULAR_SEARCHES}
        showPopular={!query}
        initialQuery={query}
        autoFocus={!query}
        searchScope={scope}
      />
      {query ? (
        <>
          {isSearching ? (
            <div className="search-page__loading">
              <LoadingSpinner variant="block" label="Searching products..." />
            </div>
          ) : null}
          {searchError ? (
            <div className="container">
              <p className="search-page__error" role="alert">
                {searchError}
              </p>
            </div>
          ) : null}
          <CatalogListing
            title={resultsTitle}
            subtitle={resultsSubtitle}
            products={products}
            showDiscountFilter={scope.scope === "discounts"}
            emptyMessage={
              <div className="search-page__empty-state">
                <p>
                  No products matched your search
                  {isScoped ? ` in ${scopeLabel}` : ""}.
                </p>
                <p>Try another keyword or broaden your search.</p>
                <div className="search-page__empty-actions">
                  {isScoped ? (
                    <Link
                      to={buildSearchUrl(query)}
                      className="search-page__empty-link"
                    >
                      Search all products
                    </Link>
                  ) : null}
                  <Link to="/categories" className="search-page__empty-link">
                    Browse categories
                  </Link>
                  <Link to="/catalog" className="search-page__empty-link">
                    Open catalog
                  </Link>
                </div>
              </div>
            }
          />
        </>
      ) : (
        <section className="search-page__trending">
          <div className="container">
            <div className="search-page__trending-head">
              <h2>Trending now</h2>
              <Link to="/top-products">View top products</Link>
            </div>
            <div className="search-page__trending-grid">
              {trendingProducts.map((product) => (
                <ProductCard key={product.id} product={product} rounded />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default SearchPage;

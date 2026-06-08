import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CatalogListing from "../../components/CatalogListing/CatalogListing";
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

const SearchPage = () => {
  const { searchProducts, getTopProducts, POPULAR_SEARCHES } = useCatalog();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const scope = useMemo(() => parseSearchScope(searchParams), [searchParams]);
  const scopeLabel = getSearchScopeLabel(scope);
  const isScoped = hasSearchScope(scope);

  const products = useMemo(() => searchProducts(query, scope), [query, scope, searchProducts]);
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
          <CatalogListing
            title={resultsTitle}
            subtitle={resultsSubtitle}
            products={products}
            showDiscountFilter={scope.scope === "discounts"}
            emptyMessage={
              <div className="search-page__empty-state">
                <p>No products matched your search{isScoped ? ` in ${scopeLabel}` : ""}.</p>
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

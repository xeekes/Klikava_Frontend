/* Full catalog listing with default sorting/filters from CatalogContext. */
import { Navigate, useSearchParams } from "react-router-dom";
import CatalogListing from "../../components/CatalogListing/CatalogListing";
import PageSearchHero from "../../components/PageSearchHero/PageSearchHero";
import { useCatalog } from "../../context/CatalogContext";
import "./Catalog.scss";

/**
 * Full catalog page with an optional discount filter from query parameters.
 */
const Catalog = () => {
  const { products, filterProducts, POPULAR_SEARCHES } = useCatalog();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const discountedOnly = searchParams.get("discounts") === "1";
  if (query) {
    return <Navigate to={`/search?q=${encodeURIComponent(query)}`} replace />;
  }
  const filteredProducts = filterProducts({ discountedOnly });
  return (
    <div className="catalog-page">
      <PageSearchHero
        eyebrow="Catalog"
        title="Browse the full assortment"
        subtitle="Filter by price, rating, and deals — or search for something specific."
        placeholder="Search in catalog: phone, bag, lamp..."
        popularTerms={POPULAR_SEARCHES}
      />
      <CatalogListing
        title="All products"
        subtitle="Browse the full assortment with filters and sorting."
        products={filteredProducts}
        showDiscountFilter={!discountedOnly}
        emptyMessage="No products available."
      />
    </div>
  );
};

export default Catalog;

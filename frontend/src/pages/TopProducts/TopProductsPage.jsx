/* A selection of top sales with optional filter tabs by category. */
import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CatalogListing from "../../components/CatalogListing/CatalogListing";
import PageSearchHero from "../../components/PageSearchHero/PageSearchHero";
import { useCatalog } from "../../context/CatalogContext";
import "./TopProductsPage.scss";

/**
 * A selection of bestsellers with optional filter tabs by top categories.
 */
const TopProductsPage = () => {
  const { getTopProducts, POPULAR_SEARCHES } = useCatalog();
  const [searchParams] = useSearchParams();
  const activeCategoryId = searchParams.get("category") || "all";
  const products = useMemo(
    () => getTopProducts(activeCategoryId),
    [activeCategoryId, getTopProducts],
  );
  return (
    <div className="top-products-page">
      <PageSearchHero
        eyebrow="Top picks"
        title="Customer favorites"
        subtitle="Search within customer favorites or browse the list below."
        placeholder="Search top products..."
        popularTerms={POPULAR_SEARCHES}
        searchScope={{ scope: "top", topCategoryId: activeCategoryId }}
      />
      <CatalogListing
        title="Top products"
        subtitle="Customer favorites with the highest demand right now."
        products={products}
      />
      <div className="container top-products-page__catalog-link-wrap">
        <Link to="/catalog" className="top-products-page__catalog-link">
          Browse full catalog
        </Link>
      </div>
    </div>
  );
};

export default TopProductsPage;

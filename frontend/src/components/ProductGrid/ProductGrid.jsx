/* Adaptive grid of product cards with pagination hook. */
import ProductCard from "../ProductCard/ProductCard";
import { ProductCardSkeleton } from "../CatalogSkeleton/CatalogSkeleton";
import SeeMoreButton from "../SeeMoreButton/SeeMoreButton";
import useProductGridColumns from "../../hooks/useProductGridColumns";
import useProductPagination from "../../hooks/useProductPagination";
import {
  PRODUCTS_INITIAL_PAGE_SIZE,
  PRODUCTS_LOAD_MORE_SIZE,
} from "../../constants/productListing";
import "./ProductGrid.scss";
import { useCatalog } from "../../context/CatalogContext";

const ROWS_PER_COLUMN = 10;
const MAX_RESPONSIVE_PRODUCTS = 40;

/**
 * Adaptive grid of product cards with pagination modes “load more” or by link.
 */
const ProductGrid = ({
  columns = 5,
  products: productsProp,
  showSeeMore = true,
  seeMoreLink = "/catalog",
  seeMoreMode = "load",
  rounded = false,
  responsiveLimit = false,
  pageSize = PRODUCTS_INITIAL_PAGE_SIZE,
  loadMoreSize = PRODUCTS_LOAD_MORE_SIZE,
}) => {
  const { products: catalogProducts, isFetchingCatalog } = useCatalog();
  const products = productsProp ?? catalogProducts;
  const effectiveColumns = useProductGridColumns(columns);
  const showSkeleton = !productsProp && isFetchingCatalog;
  const isLoadMode = showSeeMore && seeMoreMode === "load";
  const isLinkMode = showSeeMore && seeMoreMode === "link";
  const initialPageSize =
    responsiveLimit && isLinkMode
      ? Math.min(effectiveColumns * ROWS_PER_COLUMN, MAX_RESPONSIVE_PRODUCTS)
      : pageSize;
  const skeletonCount = Math.min(initialPageSize, 10);
  const paginationKey = products.map((product) => product.id).join(",");
  const { visibleItems, hasMore, loadMore } = useProductPagination(
    products,
    paginationKey,
    {
      initialPageSize:
        isLoadMode || isLinkMode ? initialPageSize : products.length,
      loadMoreSize,
    },
  );
  const shouldShowLoadMore = isLoadMode && hasMore;
  const shouldShowLink =
    isLinkMode && seeMoreLink && products.length > initialPageSize;
  return (
    <section className="product-grid">
      <div
        className={`product-grid__list ${
          showSkeleton ? "" : "catalog-fade-in"
        }`.trim()}
        style={{ "--grid-columns": columns }}
      >
        {showSkeleton
          ? Array.from({ length: skeletonCount }, (_, index) => (
              <ProductCardSkeleton key={`product-grid-skeleton-${index}`} rounded={rounded} />
            ))
          : visibleItems.map((product) => (
              <ProductCard key={product.id} product={product} rounded={rounded} />
            ))}
      </div>
      {shouldShowLoadMore ? (
        <SeeMoreButton
          onClick={loadMore}
          wrapClassName="product-grid__actions"
        />
      ) : null}
      {shouldShowLink && seeMoreLink ? (
        <SeeMoreButton to={seeMoreLink} wrapClassName="product-grid__actions" />
      ) : null}
    </section>
  );
};

export default ProductGrid;

/* Skeletons for catalog blocks on the main page and in product grids. */
import "./CatalogSkeleton.scss";

/**
 * Placeholder for the product card while the API is loading.
 */
export const ProductCardSkeleton = ({ rounded = false }) => (
  <div
    className={`catalog-skeleton__card ${
      rounded ? "catalog-skeleton__card--rounded" : ""
    }`.trim()}
    aria-hidden="true"
  >
    <div className="catalog-skeleton__card-image loading-skeleton" />
    <div className="catalog-skeleton__card-line loading-skeleton" />
    <div className="catalog-skeleton__card-line catalog-skeleton__card-line--short loading-skeleton" />
  </div>
);

/**
 * Placeholder of the round OfferBubble for the duration of the API loading.
 */
export const OfferBubbleSkeleton = ({ background = "gray", className = "" }) => (
  <div
    className={`catalog-skeleton__bubble catalog-skeleton__bubble--${background} loading-skeleton ${className}`.trim()}
    aria-hidden="true"
  />
);

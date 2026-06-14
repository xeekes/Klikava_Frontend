/* Скелетоны для блоков каталога на главной и в сетках товаров. */
import "./CatalogSkeleton.scss";

/**
 * Плейсхолдер карточки товара на время загрузки API.
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
 * Плейсхолдер круглого OfferBubble на время загрузки API.
 */
export const OfferBubbleSkeleton = ({ background = "gray", className = "" }) => (
  <div
    className={`catalog-skeleton__bubble catalog-skeleton__bubble--${background} loading-skeleton ${className}`.trim()}
    aria-hidden="true"
  />
);

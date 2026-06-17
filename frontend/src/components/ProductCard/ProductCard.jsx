/* Single product tile: price, favorites switch, link to details. */
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useFavorites } from "../../context/FavoritesContext";
import { getProductPath } from "../../utils/productPaths";
import "./ProductCard.scss";
import { Cart, Clock, Heart, Star } from "../../iconComponents";

/**
 * Single product tile with price, favorites toggle and link to details.
 */
const ProductCard = ({ product, rounded = false, showAddToBasket = false }) => {
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { id, title, price, image, originalPrice, discountPercent, slug } = product;
  const sold = product.sold;
  const favorite = isFavorite(id);
  const hasDiscount =
    typeof discountPercent === "number" &&
    discountPercent > 0 &&
    typeof originalPrice === "number";
  const cardClassName = [
    "product-card",
    rounded ? "product-card--rounded" : "",
    showAddToBasket ? "product-card--with-basket" : "",
  ]
    .filter(Boolean)
    .join(" ");
  /**
   * Adds an item to the cart from the cart layout option.
   */
  const handleAddToBasket = (event) => {
    event.preventDefault();
    event.stopPropagation();
    addItem(product);
  };
  /**
   * Switches favorite membership without clicking the card link.
   */
  const handleToggleFavorite = (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite(id);
  };
  /**
   * Adds an item to the cart from a compact action bar.
   */
  const handleQuickAdd = (event) => {
    event.preventDefault();
    event.stopPropagation();
    addItem(product);
  };
  const summary = (
    <div className="product-card__summary">
      <div className="product-card__summary-main">
        <div className="product-card__price-line">
          <Clock className="product-card__icon product-card__icon--clock" />
          <p className="product-card__price">{price} $</p>
          {hasDiscount ? (
            <p className="product-card__price-old">{originalPrice} $</p>
          ) : null}
        </div>
        {showAddToBasket && sold != null ? (
          <p className="product-card__sold-count">{sold} sold</p>
        ) : null}
      </div>
      <span className="product-card__rating">
        <Star className="product-card__icon product-card__icon--star" />
        <Star className="product-card__icon product-card__icon--star" />
        <Star className="product-card__icon product-card__icon--star" />
        <Star className="product-card__icon product-card__icon--star" />
        <Star className="product-card__icon product-card__icon--star" />
      </span>
    </div>
  );
  const productPath = getProductPath({ id, slug });
  if (showAddToBasket) {
    return (
      <article className={cardClassName}>
        <Link to={productPath} className="product-card__image-link">
          <img src={image} alt={title} className="product-card__image" />
        </Link>
        <div className="product-card__content">
          <Link to={productPath} className="product-card__title">
            {title}
          </Link>
          {summary}
          <button
            type="button"
            className="product-card__add-to-basket"
            onClick={handleAddToBasket}
          >
            Add to basket
          </button>
        </div>
      </article>
    );
  }
  return (
    <Link to={productPath} className={cardClassName}>
      <div className="product-card__image-wrap">
        <img src={image} alt={title} className="product-card__image" />
        {hasDiscount ? (
          <span className="product-card__discount-badge">
            -{discountPercent}%
          </span>
        ) : null}
      </div>
      <div className="product-card__content">
        <h3 className="product-card__title">{title}</h3>
        {summary}
        <div className="product-card__actions-row">
          {sold != null ? (
            <p className="product-card__sold-count">{sold} sold</p>
          ) : (
            <span />
          )}
          <div className="product-card__add-to-cart">
            <button
              type="button"
              className={`product-card__action-btn ${
                favorite ? "product-card__action-btn--active" : ""
              }`.trim()}
              onClick={handleToggleFavorite}
              aria-label={
                favorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              <Heart className="product-card__icon product-card__icon--heart" />
            </button>
            <button
              type="button"
              className="product-card__action-btn"
              onClick={handleQuickAdd}
              aria-label="Add to cart"
            >
              <Cart className="product-card__icon product-card__icon--cart" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;

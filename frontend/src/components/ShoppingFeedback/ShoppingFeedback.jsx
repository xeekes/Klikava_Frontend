/*
 * Floating toast for actions with cart/favorites; Only one is visible at a time.
 * Renders once in MainLayout, reads data from CartContext and FavoritesContext.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useFavorites } from "../../context/FavoritesContext";
import { Heart } from "../../iconComponents";
import "./ShoppingFeedback.scss";
const CLOSE_MS = 280;

/**
 * Floating toast for actions with cart and favorites; Only one is visible at a time.
 */
const ShoppingFeedback = () => {
  const { isAuthenticated } = useAuth();
  const { cartFeedback, dismissCartFeedback } = useCart();
  const { wishlistFeedback, dismissWishlistFeedback } = useFavorites();
  const activeFeedback = cartFeedback ?? wishlistFeedback;
  const dismissActive = cartFeedback
    ? dismissCartFeedback
    : dismissWishlistFeedback;
  const [visible, setVisible] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  useEffect(() => {
    if (cartFeedback) {
      dismissWishlistFeedback();
    }
  }, [cartFeedback, dismissWishlistFeedback]);
  useEffect(() => {
    if (wishlistFeedback) {
      dismissCartFeedback();
    }
  }, [wishlistFeedback, dismissCartFeedback]);
  useEffect(() => {
    if (activeFeedback) {
      setVisible(activeFeedback);
      setIsClosing(false);
    }
  }, [activeFeedback]);
  useEffect(() => {
    if (activeFeedback || !visible) {
      return undefined;
    }
    setIsClosing(true);
    const timer = window.setTimeout(() => {
      setVisible(null);
      setIsClosing(false);
    }, CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [activeFeedback, visible]);
  if (!visible) {
    return null;
  }
  /**
   * Closes the active feedback toast and plays the exit animation.
   */
  const handleContinue = () => {
    dismissActive();
  };
  if (visible.type === "cart") {
    const { product, action, itemCount, total } = visible;
    const checkoutPath = isAuthenticated ? "/checkout" : "/cart";
    return (
      <div
        className={`shopping-feedback shopping-feedback--cart ${
          isClosing ? "shopping-feedback--closing" : ""
        }`.trim()}
        role="status"
        aria-live="polite"
      >
        <div className="shopping-feedback__inner container">
          <div className="shopping-feedback__product">
            <span className="shopping-feedback__badge" aria-hidden="true">
              ✓
            </span>
            <img
              className="shopping-feedback__thumb"
              src={product.image}
              alt=""
            />
            <div className="shopping-feedback__copy">
              <p className="shopping-feedback__title">
                {action === "updated"
                  ? "Quantity updated"
                  : "Added to your bag"}
              </p>
              <p className="shopping-feedback__subtitle">{product.title}</p>
              <p className="shopping-feedback__meta">
                {product.quantity > 1
                  ? `${product.quantity} × ${product.price} $`
                  : `${product.price} $`}
                <span className="shopping-feedback__meta-sep">·</span>
                {itemCount} item{itemCount === 1 ? "" : "s"} in bag
                <span className="shopping-feedback__meta-sep">·</span>
                {total} $ subtotal
              </p>
            </div>
          </div>
          <div className="shopping-feedback__actions">
            <button
              type="button"
              className="shopping-feedback__btn shopping-feedback__btn--ghost"
              onClick={handleContinue}
            >
              Continue shopping
            </button>
            <Link
              to="/cart"
              className="shopping-feedback__btn shopping-feedback__btn--secondary"
              onClick={handleContinue}
            >
              View bag
            </Link>
            <Link
              to={checkoutPath}
              className="shopping-feedback__btn shopping-feedback__btn--primary"
              onClick={handleContinue}
            >
              Checkout
            </Link>
          </div>
          <button
            type="button"
            className="shopping-feedback__close"
            onClick={handleContinue}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      </div>
    );
  }
  const { product, action, favoritesCount } = visible;
  const isAdded = action === "added";
  return (
    <div
      className={`shopping-feedback shopping-feedback--wishlist ${
        isClosing ? "shopping-feedback--closing" : ""
      } ${isAdded ? "" : "shopping-feedback--wishlist-removed"}`.trim()}
      role="status"
      aria-live="polite"
    >
      <div className="shopping-feedback__inner container">
        <div className="shopping-feedback__product">
          <span
            className={`shopping-feedback__badge ${
              isAdded ? "shopping-feedback__badge--heart" : ""
            }`.trim()}
            aria-hidden="true"
          >
            {isAdded ? <Heart /> : <span>✓</span>}
          </span>
          <img
            className="shopping-feedback__thumb"
            src={product.image}
            alt=""
          />
          <div className="shopping-feedback__copy">
            <p className="shopping-feedback__title">
              {isAdded ? "Saved to wishlist" : "Removed from wishlist"}
            </p>
            <p className="shopping-feedback__subtitle">{product.title}</p>
            {isAdded ? (
              <p className="shopping-feedback__meta">
                {favoritesCount} item{favoritesCount === 1 ? "" : "s"} saved
              </p>
            ) : null}
          </div>
        </div>
        <div className="shopping-feedback__actions">
          <button
            type="button"
            className="shopping-feedback__btn shopping-feedback__btn--ghost"
            onClick={handleContinue}
          >
            Continue shopping
          </button>
          {isAdded ? (
            <Link
              to="/profile/favorites"
              className="shopping-feedback__btn shopping-feedback__btn--primary"
              onClick={handleContinue}
            >
              View wishlist
            </Link>
          ) : null}
        </div>
        <button
          type="button"
          className="shopping-feedback__close"
          onClick={handleContinue}
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ShoppingFeedback;

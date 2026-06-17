/* Promotional bubble on top of product cards. */
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useCatalog } from "../../context/CatalogContext";
import { Cart } from "../../iconComponents";
import { formatBubblePrice } from "../../utils/formatPrice";
import "./OfferBubble.scss";

/**
 * Promotional bubble on top of product cards with optional cart action.
 */
const OfferBubble = ({
  image,
  price = 0,
  alt = "Offer image",
  background = "gray",
  className = "",
  to = "",
  productId,
}) => {
  const { getProductById } = useCatalog();
  const { addItem } = useCart();
  const displayPrice = formatBubblePrice(price);
  const backgroundClass =
    background === "white" ? "offer-bubble--white" : "offer-bubble--gray";
  /**
   * Adds a related catalog product to the cart without navigating from the page.
   */
  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!productId) {
      return;
    }
    const product = getProductById(productId);
    if (product) {
      addItem(product);
    }
  };
  const content = (
    <>
      <img src={image} alt={alt} />
      <div className="offer-bubble__badges">
        <div className="offer-bubble__price">
          <p>{displayPrice}</p>
        </div>
        <button
          type="button"
          className="offer-bubble__cart"
          onClick={handleAddToCart}
          aria-label="Add to cart"
        >
          <Cart className="offer-bubble__cart-icon" aria-hidden="true" />
        </button>
      </div>
    </>
  );
  if (to) {
    return (
      <Link
        to={to}
        className={`offer-bubble ${backgroundClass} ${className}`.trim()}
      >
        {content}
      </Link>
    );
  }
  return (
    <div className={`offer-bubble ${backgroundClass} ${className}`.trim()}>
      {content}
    </div>
  );
};

export default OfferBubble;

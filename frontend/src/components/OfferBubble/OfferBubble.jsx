import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useCatalog } from "../../context/CatalogContext";
import { Cart } from "../../iconComponents";
import "./OfferBubble.scss";

const OfferBubble = ({
  image,
  price = "20$",
  alt = "Offer image",
  background = "gray",
  className = "",
  to = "",
  productId,
}) => {
  const { getProductById } = useCatalog();
  const { addItem } = useCart();
  const backgroundClass =
    background === "white" ? "offer-bubble--white" : "offer-bubble--gray";

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
          <p>{price}</p>
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

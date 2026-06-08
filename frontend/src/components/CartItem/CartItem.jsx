import { Link } from "react-router-dom";
import { Clock, Star } from "../../iconComponents";
import "./CartItem.scss";

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const rating = item.rating ?? 5;
  const sold = item.sold ?? 422;
  const hasDiscount =
    typeof item.discountPercent === "number" &&
    item.discountPercent > 0 &&
    typeof item.originalPrice === "number";

  return (
    <article className="cart-item">
      <Link to={`/product/${item.productId}`} className="cart-item__image-wrap">
        <img src={item.image} alt={item.title} />
      </Link>

      <div className="cart-item__body">
        <Link to={`/product/${item.productId}`} className="cart-item__title">
          {item.title}
        </Link>

        <div className="cart-item__summary">
          <div className="cart-item__price-line">
            <Clock className="cart-item__icon cart-item__icon--clock" />
            <p className="cart-item__price">{item.price} $</p>
            {hasDiscount ? (
              <p className="cart-item__price-old">{item.originalPrice} $</p>
            ) : null}
          </div>
        </div>

        <div className="cart-item__meta">
          <p className="cart-item__sold">{sold} sold</p>
          <div className="cart-item__rating" aria-label={`${rating} stars`}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={`cart-item__icon cart-item__icon--star ${
                  index < rating ? "cart-item__icon--star-filled" : ""
                }`.trim()}
              />
            ))}
          </div>
        </div>

        <div className="cart-item__footer">
          <div className="cart-item__controls">
            <a
              className="cart-item__delete"
              onClick={() => onRemove(item.productId)}
            >
              Delete item
            </a>

            <div className="cart-item__quantity">
              <a
                onClick={() =>
                  onUpdateQuantity(item.productId, item.quantity - 1)
                }
                aria-label="Decrease quantity"
              >
                <span>−</span>
              </a>
              <span>{item.quantity}</span>
              <a
                onClick={() =>
                  onUpdateQuantity(item.productId, item.quantity + 1)
                }
                aria-label="Increase quantity"
              >
                <span>+</span>
              </a>
            </div>
          </div>

          <div className="cart-item__delivery">
            <p>Delivery $ {item.deliveryPrice ?? item.price}</p>
            <p>{item.deliveryDates ?? "23 - 25 May"}</p>
          </div>
        </div>
      </div>
    </article>
  );
};

export default CartItem;

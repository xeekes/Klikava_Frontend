import { Link, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import "./OrderSuccess.scss";

const OrderSuccess = () => {
  const location = useLocation();
  const { itemCount } = useCart();
  const orderId = location.state?.orderId;

  return (
    <section className="order-success">
      <div className="order-success__container">
        <p className="order-success__eyebrow">Order placed</p>
        <h1 className="order-success__title">Thank you for your purchase</h1>
        <p className="order-success__text">
          Your order has been created successfully
          {orderId ? ` · ${orderId}` : ""}.
        </p>
        <p className="order-success__text">
          {itemCount > 0
            ? "Some items may still be syncing in your cart preview."
            : "Your cart has been cleared and the order is now available in profile."}
        </p>

        <div className="order-success__actions">
          <Link to="/profile/orders" className="order-success__action order-success__action--primary">
            View orders
          </Link>
          <Link to="/catalog" className="order-success__action">
            Continue shopping
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OrderSuccess;

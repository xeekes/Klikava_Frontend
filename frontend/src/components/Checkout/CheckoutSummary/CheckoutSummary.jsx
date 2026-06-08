import { useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import { useUserData } from "../../../context/UserDataContext";
import { DELIVERY_FEE } from "../../../constants/delivery";
import "./CheckoutSummary.scss";

const CheckoutSummary = () => {
  const navigate = useNavigate();
  const { items, total, itemCount, isEmpty, clearCart } = useCart();
  const { addOrder, activeCoupon, clearCoupon } = useUserData();

  const deliveryTotal = isEmpty ? 0 : DELIVERY_FEE;
  const couponDiscount = activeCoupon ? 1.2 : 0;
  const orderTotal = Math.max(total + deliveryTotal - couponDiscount, 0);

  const handlePlaceOrder = async () => {
    const orderId = `PO-${Date.now()}`;
    addOrder({
      id: orderId,
      status: "processing",
      itemCount,
      total: orderTotal,
      orderTime: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      images: items.map((item) => item.image),
      productTitle: items[0]?.title ?? "Order items",
    });
    await clearCart();
    clearCoupon();
    navigate("/order-success", { state: { orderId } });
  };

  if (isEmpty) {
    return null;
  }

  return (
    <aside className="checkout-summary">
      <div className="checkout-summary__thumbs">
        {items.map((item) => (
          <img
            key={item.productId}
            className="checkout-summary__thumb"
            src={item.image}
            alt=""
          />
        ))}
      </div>

      <div className="checkout-summary__rows">
        <div className="checkout-summary__row">
          <span>{itemCount} item</span>
          <span>{total} $</span>
        </div>
        <div className="checkout-summary__row">
          <span>Delivery</span>
          <span>{deliveryTotal} $</span>
        </div>
        {activeCoupon ? (
          <div className="checkout-summary__row checkout-summary__row--coupon">
            <span>Coupon {activeCoupon.amount}</span>
            <span>-{couponDiscount} $</span>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        className="checkout-summary__place-order"
        onClick={handlePlaceOrder}
      >
        <span>Place order</span>
        <span>{orderTotal} $</span>
      </button>
    </aside>
  );
};

export default CheckoutSummary;

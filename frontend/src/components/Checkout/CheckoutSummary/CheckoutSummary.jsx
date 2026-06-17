/*
 * Order summary sidebar: applies shipping cost and active coupon, saves order
 * via API or localStorage and clears the cart at checkout.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import { useUserData } from "../../../context/UserDataContext";
import { DELIVERY_FEE } from "../../../constants/delivery";
import "./CheckoutSummary.scss";

/**
 * Order summary sidebar that saves the order and clears the cart at checkout.
 */
const CheckoutSummary = () => {
  const navigate = useNavigate();
  const { items, total, itemCount, isEmpty, clearCart } = useCart();
  const { addOrder, activeCoupon, clearCoupon, usesApi } = useUserData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const deliveryTotal = isEmpty ? 0 : DELIVERY_FEE;
  const couponDiscount = activeCoupon ? 1.2 : 0;
  const orderTotal = Math.max(total + deliveryTotal - couponDiscount, 0);

  /**
   * Saves the order to API or localStorage, clears the cart and coupon, then navigates.
   */
  const handlePlaceOrder = async () => {
    setSubmitError("");
    setIsSubmitting(true);
    try {
      let order;
      if (usesApi) {
        order = await addOrder(items, {
          deliveryPrice: deliveryTotal,
          discountItemId: activeCoupon?.backendId ?? null,
        });
      } else {
        const orderId = `PO-${Date.now()}`;
        order = await addOrder({
          id: orderId,
          status: "processing",
          itemCount,
          total: orderTotal,
          orderTime: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          image: items[0]?.image ?? "",
          productTitle: items[0]?.title ?? "Order items",
          productId: items[0]?.productId ?? null,
        });
      }
      await clearCart();
      clearCoupon();
      navigate("/order-success", { state: { orderId: order.id } });
    } catch (error) {
      setSubmitError(error.message || "Failed to place order.");
    } finally {
      setIsSubmitting(false);
    }
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
      {submitError ? (
        <p className="checkout-summary__error" role="alert">
          {submitError}
        </p>
      ) : null}
      <button
        type="button"
        className="checkout-summary__place-order"
        onClick={handlePlaceOrder}
        disabled={isSubmitting}
      >
        <span>{isSubmitting ? "Placing order..." : "Place order"}</span>
        <span>{orderTotal} $</span>
      </button>
    </aside>
  );
};

export default CheckoutSummary;

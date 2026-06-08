import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useAuthModal } from "../../hooks/useAuthModal";
import "./CartSidebar.scss";

import { DELIVERY_FEE } from "../../constants/delivery";

const CartSidebar = ({ className = "" }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { openAuth } = useAuthModal();
  const { items, isEmpty, total, itemCount } = useCart();
  const isFixedBar = className.includes("cart-sidebar--fixed");

  const deliveryTotal = isEmpty ? 0 : DELIVERY_FEE;
  const checkoutTotal = total + deliveryTotal;

  const content = (
    <>
      {!isEmpty ? (
        <div key="filled" className="cart-sidebar__filled motion-content-swap">
          <div className="cart-sidebar__thumbs" aria-hidden={items.length === 0}>
            {items.map((item) => (
              <img
                key={item.productId}
                className="cart-sidebar__thumb"
                src={item.image}
                alt=""
              />
            ))}
          </div>

          <div className="cart-sidebar__rows">
            <div className="cart-sidebar__row">
              <span>{itemCount} item</span>
              <span>{total} $</span>
            </div>
            <div className="cart-sidebar__row">
              <span>Delivery</span>
              <span>{deliveryTotal} $</span>
            </div>
          </div>

          {isAuthenticated ? (
            <button
              type="button"
              className="cart-sidebar__checkout"
              onClick={() => navigate("/checkout")}
            >
              <span>Checkout</span>
              <span>{checkoutTotal} $</span>
            </button>
          ) : (
            <div className="cart-sidebar__actions">
              <button
                type="button"
                className="cart-sidebar__btn cart-sidebar__btn--primary"
                onClick={() => openAuth("/login")}
              >
                Log In
              </button>

              <Link
                to="/"
                className="cart-sidebar__btn cart-sidebar__btn--secondary"
              >
                To the main
              </Link>
            </div>
          )}
        </div>
      ) : null}

      {isEmpty ? (
        <div key="empty" className="cart-sidebar__actions motion-content-swap">
          {!isAuthenticated ? (
            <button
              type="button"
              className="cart-sidebar__btn cart-sidebar__btn--primary"
              onClick={() => openAuth("/login")}
            >
              Log In
            </button>
          ) : null}

          <Link to="/" className="cart-sidebar__btn cart-sidebar__btn--secondary">
            To the main
          </Link>
        </div>
      ) : null}
    </>
  );

  return (
    <aside className={`cart-sidebar ${className}`.trim()}>
      {isFixedBar ? <div className="container">{content}</div> : content}
    </aside>
  );
};

export default CartSidebar;

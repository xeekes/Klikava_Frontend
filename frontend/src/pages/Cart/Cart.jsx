import { createPortal } from "react-dom";
import CartItem from "../../components/CartItem/CartItem";
import CartSidebar from "../../components/CartSidebar/CartSidebar";
import ProductGrid from "../../components/ProductGrid/ProductGrid";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useCatalog } from "../../context/CatalogContext";
import "./Cart.scss";

const Cart = () => {
  const { products } = useCatalog();
  const browsingHistoryProducts = products.slice(6, 12);
  const selectedForYouProducts = products.slice(0, 6);
  const { isAuthenticated } = useAuth();
  const { items, isEmpty, isLoading, updateQuantity, removeItem } = useCart();

  const renderRecommendations = () => {
    if (isAuthenticated) {
      return (
        <>
          <div className="cart-page__product-section">
            <h2 className="cart-page__section-heading">BROWSING HISTORY</h2>
            <ProductGrid
              columns={3}
              products={browsingHistoryProducts}
              showSeeMore={false}
              rounded
            />
          </div>
          <div className="cart-page__product-section">
            <h2 className="cart-page__section-heading">SELECTED FOR YOU</h2>
            <ProductGrid
              columns={3}
              products={selectedForYouProducts}
              showSeeMore={false}
              rounded
            />
          </div>
        </>
      );
    }

    return (
      <div className="cart-page__product-section">
        <ProductGrid
          columns={3}
          products={selectedForYouProducts}
          showSeeMore={false}
          rounded
        />
      </div>
    );
  };

  return (
    <div className="cart-page">
      <div className="cart-page__layout">
        <div className="container">
          <p className="cart-page__label">Basket</p>

          <div className="cart-page__grid">
            <section className="cart-page__main">
              {isLoading ? (
                <div className="cart-page__card cart-page__card--loading" />
              ) : isEmpty ? (
                <div className="cart-page__card cart-page__card--empty">
                  <h1 className="cart-page__empty-title">There is nothing in the cart</h1>
                  <p className="cart-page__empty-text">
                    {isAuthenticated
                      ? "Select products to add them to your cart"
                      : "Select products or log in if you previously added items to cart"}
                  </p>
                </div>
              ) : (
                <ul className="cart-page__items">
                  {items.map((item) => (
                    <li key={item.productId}>
                      <CartItem
                        item={item}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeItem}
                      />
                    </li>
                  ))}
                </ul>
              )}

              {!isLoading ? (
                <CartSidebar className="cart-sidebar--inline" />
              ) : null}

              {!isLoading ? renderRecommendations() : null}
            </section>

            <CartSidebar className="cart-sidebar--aside" />
          </div>
        </div>
      </div>

      {!isLoading
        ? createPortal(
            <CartSidebar className="cart-sidebar--fixed" />,
            document.body,
          )
        : null}
    </div>
  );
};

export default Cart;

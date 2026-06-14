/* Страница корзины: позиции, управление количеством, ссылка на оформление. */
import { useMemo } from "react";
import { createPortal } from "react-dom";
import CartItem from "../../components/CartItem/CartItem";
import CartSidebar from "../../components/CartSidebar/CartSidebar";
import ProductGrid from "../../components/ProductGrid/ProductGrid";
import { useAuth } from "../../context/AuthContext";
import { useBrowsingHistory } from "../../context/BrowsingHistoryContext";
import { useCart } from "../../context/CartContext";
import { useCatalog } from "../../context/CatalogContext";
import "./Cart.scss";

/**
 * Корзина с позициями, боковой панелью итогов и рекомендациями.
 */
const Cart = () => {
  const { products, getTopProducts } = useCatalog();
  const { groups } = useBrowsingHistory();
  const browsingHistoryProducts = useMemo(
    () => groups.flatMap((group) => group.products).slice(0, 6),
    [groups],
  );
  const selectedForYouProducts = getTopProducts("all").slice(0, 6);
  const { isAuthenticated } = useAuth();
  const { items, isEmpty, isLoading, updateQuantity, removeItem } = useCart();
  const displayItems = useMemo(
    () =>
      items.map((item) => {
        const catalogProduct = products.find(
          (product) => String(product.id) === String(item.productId),
        );
        if (!catalogProduct) {
          return item;
        }
        return {
          ...item,
          title: item.title || catalogProduct.title,
          image: catalogProduct.image || item.image,
          price: item.price ?? catalogProduct.price,
          originalPrice: item.originalPrice ?? catalogProduct.originalPrice,
          discountPercent:
            item.discountPercent ?? catalogProduct.discountPercent,
          sold: item.sold ?? catalogProduct.sold,
          rating: item.rating ?? catalogProduct.rating,
        };
      }),
    [items, products],
  );

  /**
   * Рендерит сетки истории просмотров или «подобрано для вас» в зависимости от состояния авторизации.
   */
  const renderRecommendations = () => {
    if (isAuthenticated) {
      return (
        <>
          {browsingHistoryProducts.length > 0 ? (
            <div className="cart-page__product-section">
              <h2 className="cart-page__section-heading">BROWSING HISTORY</h2>
              <ProductGrid
                columns={3}
                products={browsingHistoryProducts}
                showSeeMore={false}
                rounded
              />
            </div>
          ) : null}
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
                  <h1 className="cart-page__empty-title">
                    There is nothing in the cart
                  </h1>
                  <p className="cart-page__empty-text">
                    {isAuthenticated
                      ? "Select products to add them to your cart"
                      : "Select products or log in if you previously added items to cart"}
                  </p>
                </div>
              ) : (
                <ul className="cart-page__items">
                  {displayItems.map((item) => (
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

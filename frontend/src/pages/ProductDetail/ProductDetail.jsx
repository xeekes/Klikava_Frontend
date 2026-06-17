/*
 * Product page: loads rich data via fetchProductDetail with API enabled,
 * records browsing history, processes adding to cart and similar products.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProductGrid from "../../components/ProductGrid/ProductGrid";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { ArrowForward, Clock, Star } from "../../iconComponents";
import { useBrowsingHistory } from "../../context/BrowsingHistoryContext";
import { useCart } from "../../context/CartContext";
import { useCatalog } from "../../context/CatalogContext";
import { usePageMetaOverride } from "../../hooks/usePageMeta";
import { SITE_NAME } from "../../constants/site";
import ProductDetailThumbsSlider from "./ProductDetailThumbsSlider";
import ProductReviewsPanel from "./ProductReviewsPanel";
import "./ProductDetail.scss";
const MOBILE_THUMBS_MAX = 768;

/**
 * A page of one product with a gallery, characteristics, reviews and similar items.
 */
const ProductDetail = () => {
  const { id } = useParams();
  const {
    getProductById,
    getRelatedProducts,
    fetchProductDetail,
    usesApi,
    isLoading: isCatalogLoading,
  } = useCatalog();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { trackProduct } = useBrowsingHistory();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("details");
  const [isAdded, setIsAdded] = useState(false);
  const [useThumbSlider, setUseThumbSlider] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(`(max-width: ${MOBILE_THUMBS_MAX}px)`).matches
      : false,
  );
  const { addItem } = useCart();
  const pageMeta = useMemo(
    () =>
      product?.title
        ? {
            title: product.title,
            description: `Buy ${product.title} on ${SITE_NAME}.`,
          }
        : null,
    [product?.title],
  );
  usePageMetaOverride(pageMeta);
  useEffect(() => {
    /* Protection against updating state after canceling a request for product details. */
    let cancelled = false;

    /**
     * Loads rich product data from an API or static catalog.
     */
    const loadProduct = async () => {
      if (usesApi) {
        setIsLoading(true);
        const detailed = await fetchProductDetail(id);
        if (cancelled) {
          return;
        }
        setProduct(detailed);
        setRelatedProducts(
          detailed?.relatedFromApi?.length
            ? detailed.relatedFromApi
            : getRelatedProducts(id, 8),
        );
        setIsLoading(false);
        return;
      }
      setProduct(getProductById(id));
      setRelatedProducts(getRelatedProducts(id, 8));
    };
    loadProduct();
    return () => {
      cancelled = true;
    };
  }, [id, usesApi, fetchProductDetail, getProductById, getRelatedProducts]);
  useEffect(() => {
    if (product) {
      trackProduct(product);
    }
  }, [product, trackProduct]);
  useEffect(() => {
    setActiveImageIndex(0);
    setSelectedColorIndex(0);
  }, [id]);
  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_THUMBS_MAX}px)`);

    /** Synchronizes the thumbnail carousel mode with the viewport width. */
    const updateThumbSlider = () => setUseThumbSlider(mediaQuery.matches);
    updateThumbSlider();
    mediaQuery.addEventListener("change", updateThumbSlider);
    return () => mediaQuery.removeEventListener("change", updateThumbSlider);
  }, []);
  if (isLoading || (usesApi && isCatalogLoading && !product)) {
    return (
      <div className="product-detail">
        <div className="container product-detail__not-found">
          <LoadingSpinner variant="block" label="Loading product..." />
        </div>
      </div>
    );
  }
  if (!product) {
    return (
      <div className="product-detail">
        <div className="container product-detail__not-found">
          <h1>Product not found</h1>
          <Link to="/">Back to home</Link>
        </div>
      </div>
    );
  }
  const maxDeliveryPercent = Math.max(
    ...(product.shipping?.stats || []).map((item) => item.percent),
    1,
  );

  /**
   * Synchronizes the active gallery index and the selected swatch when selecting a thumbnail.
   * @param {number} index
   */
  const handleThumbSelect = (index) => {
    setActiveImageIndex(index);
    if (index < product.colors.length) {
      setSelectedColorIndex(index);
    }
  };

  /**
   * Adds the current option to the cart and displays a brief confirmation.
   */
  const handleAddToBag = async () => {
    await addItem(
      {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.images[activeImageIndex],
        recentLowestPrice: product.recentLowestPrice,
        sold: product.sold,
        rating: 5,
      },
      { color: product.colors[selectedColorIndex] },
    );
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };
  return (
    <div className="product-detail">
      <div className="container">
        <section className="product-detail__layout">
          <article className="product-detail__gallery-card">
            <div className="product-detail__gallery">
              {useThumbSlider ? (
                <ProductDetailThumbsSlider
                  productId={product.id}
                  images={product.images}
                  title={product.title}
                  activeIndex={activeImageIndex}
                  onSelect={handleThumbSelect}
                />
              ) : (
                <ul className="product-detail__thumbs">
                  {product.images.map((image, index) => (
                    <li key={`${product.id}-thumb-${index}`}>
                      <button
                        type="button"
                        className={`product-detail__thumb ${
                          activeImageIndex === index
                            ? "product-detail__thumb--active"
                            : ""
                        }`.trim()}
                        onClick={() => handleThumbSelect(index)}
                      >
                        <img
                          src={image}
                          alt={`${product.title} ${index + 1}`}
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="product-detail__main-image-wrap">
                <img
                  src={product.images[activeImageIndex]}
                  alt={product.title}
                  className="product-detail__main-image"
                />
              </div>
            </div>
          </article>
          <article className="product-detail__info-card">
            <div className="product-detail__info-main">
              <h3 className="product-detail__title">{product.title}</h3>
              <div className="product-detail__pricing">
                <div className="product-detail__pricing-top">
                  <div className="product-detail__price-line">
                    <Clock className="product-detail__icon product-detail__icon--clock" />
                    <p className="product-detail__price">{product.price} $</p>
                  </div>
                  {typeof product.sold === "number" ? (
                    <p className="product-detail__sold">{product.sold} sold</p>
                  ) : null}
                </div>
                <div className="product-detail__pricing-bottom">
                  <p className="product-detail__recent-price">
                    Lowest recent price:{" "}
                    <span>{product.recentLowestPrice}$</span>
                  </p>
                  <div className="product-detail__rating">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className="product-detail__icon product-detail__icon--star"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="product-detail__colors">
                <div className="product-detail__colors-label-wrap">
                  <p className="product-detail__colors-label">COLOR: select</p>
                  <p className="product-detail__colors-hint">
                    Choose the color you like
                  </p>
                </div>
                <div className="product-detail__colors-list">
                  {product.colors.map((color, index) => (
                    <button
                      key={color}
                      type="button"
                      className={`product-detail__color ${
                        selectedColorIndex === index
                          ? "product-detail__color--active"
                          : ""
                      }`.trim()}
                      style={{ "--color-value": color }}
                      onClick={() => setSelectedColorIndex(index)}
                      aria-label={`Color ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
              <nav
                className="product-detail__tabs"
                aria-label="Product sections"
              >
                {product.tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`product-detail__tab ${
                      activeTab === tab.id ? "product-detail__tab--active" : ""
                    }`.trim()}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span>{tab.label}</span>
                    <ArrowForward className="product-detail__tab-icon" />
                  </button>
                ))}
              </nav>
              <button
                type="button"
                className={`product-detail__add-btn ${
                  isAdded ? "product-detail__add-btn--added" : ""
                }`.trim()}
                onClick={handleAddToBag}
              >
                {isAdded ? "ADDED TO BAG" : "ADD TO BAG"}
              </button>
            </div>
            <aside className="product-detail__panel">
              <div key={activeTab} className="motion-content-swap">
                {activeTab === "details" && (
                  <div className="product-detail__panel-section">
                    <h4 className="product-detail__panel-title">
                      Product Details
                    </h4>
                    <ul className="product-detail__specs-list">
                      {product.specs.length > 0 ? (
                        product.specs.map((spec) => (
                          <li
                            key={spec.label}
                            className="product-detail__spec-item"
                          >
                            <span className="product-detail__spec-label">
                              {spec.label}:
                            </span>{" "}
                            <span className="product-detail__spec-value">
                              {spec.value}
                            </span>
                          </li>
                        ))
                      ) : (
                        <li className="product-detail__spec-item product-detail__spec-item--empty">
                          No specifications available.
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                {activeTab === "shipping" && (
                  <div className="product-detail__panel-section">
                    <h4 className="product-detail__panel-title">Shipping</h4>
                    <div className="product-detail__shipping-table">
                      <span className="product-detail__shipping-label">
                        Company
                      </span>
                      <span className="product-detail__shipping-value">
                        {product.shipping.company}
                      </span>
                      <span className="product-detail__shipping-label">
                        Delivery time
                      </span>
                      <span className="product-detail__shipping-value">
                        {product.shipping.deliveryTime}
                      </span>
                      <span className="product-detail__shipping-label">
                        Costs
                      </span>
                      <span className="product-detail__shipping-value">
                        {product.shipping.costs}
                      </span>
                    </div>
                    <ul className="product-detail__delivery-stats">
                      {(product.shipping.stats || []).map((stat) => (
                        <li
                          key={stat.label}
                          className="product-detail__delivery-stat"
                        >
                          <span className="product-detail__delivery-stat-label">
                            {stat.label}
                          </span>
                          <div className="product-detail__delivery-stat-bar-wrap">
                            <div
                              className="product-detail__delivery-stat-bar"
                              style={{
                                width: `${(stat.percent / maxDeliveryPercent) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="product-detail__delivery-stat-value">
                            {stat.percent}%
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {activeTab === "reviews" && (
                  <ProductReviewsPanel product={product} usesApi={usesApi} />
                )}
              </div>
            </aside>
          </article>
        </section>
        <section className="product-detail__related">
          <h2 className="product-detail__related-heading">
            YOU MIGHT ALSO LIKE
          </h2>
          <ProductGrid
            rounded={true}
            columns={4}
            products={relatedProducts}
            showSeeMore={false}
          />
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;

/* Home page section: grid of catalog products. */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import OfferBubble from "../OfferBubble/OfferBubble";
import { OfferBubbleSkeleton } from "../CatalogSkeleton/CatalogSkeleton";
import TagSlider from "../TagSlider/TagSlider";
import { useCatalog } from "../../context/CatalogContext";
import { TOP_PRODUCT_CATEGORIES } from "../../data/topCategories";
import { getProductPath } from "../../utils/productPaths";
import "./PopularProducts.scss";

const POPULAR_PRODUCTS_SLIDER_MAX = 1200;
const POPULAR_PRODUCTS_COUNT = 6;

/**
 * Home page section with bubbles of popular products and category chips.
 */
const PopularProducts = ({ className = "" }) => {
  const { getTopProducts, isFetchingCatalog } = useCatalog();
  const showSkeleton = isFetchingCatalog;
  const products = getTopProducts("all").slice(0, POPULAR_PRODUCTS_COUNT);
  const smallProducts = products.slice(0, 4);
  const largeProducts = products.slice(4, 6);
  const [useSliderLayout, setUseSliderLayout] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(`(max-width: ${POPULAR_PRODUCTS_SLIDER_MAX}px)`).matches
      : false,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      `(max-width: ${POPULAR_PRODUCTS_SLIDER_MAX}px)`,
    );
    const updateLayout = () => setUseSliderLayout(mediaQuery.matches);
    updateLayout();
    mediaQuery.addEventListener("change", updateLayout);
    return () => mediaQuery.removeEventListener("change", updateLayout);
  }, []);

  const renderProductBubble = (product, bubbleClass = "") => (
    <OfferBubble
      className={bubbleClass}
      image={product.image}
      alt={product.title}
      price={product.price}
      background="white"
      productId={product.id}
      to={getProductPath(product)}
    />
  );
  return (
    <section className={`popular-products ${className}`.trim()}>
      <div className="container">
        <div className="popular-products-content">
          <h2>
            We have collected for you the most popular products that have won
            over our customers
          </h2>
          <TagSlider
            className="categories"
            ariaLabel="Popular categories"
            spaceBetween={16}
          >
            {TOP_PRODUCT_CATEGORIES.map((category) => (
              <Link
                key={category.id}
                className={`categories__item ${
                  category.id === "all" ? "active" : ""
                }`.trim()}
                to={
                  category.id === "all"
                    ? "/top-products"
                    : `/top-products?category=${category.id}`
                }
              >
                {category.name}
              </Link>
            ))}
          </TagSlider>
        </div>
        {useSliderLayout ? (
          <Swiper
            className={`products products--slider ${
              showSkeleton ? "" : "catalog-fade-in"
            }`.trim()}
            slidesPerView={1}
            spaceBetween={20}
            loop={false}
            watchOverflow
            roundLengths
            breakpoints={{
              600: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              700: {
                slidesPerView: 3,
                spaceBetween: 22,
              },
            }}
          >
            {showSkeleton
              ? Array.from({ length: POPULAR_PRODUCTS_COUNT }, (_, index) => (
                  <SwiperSlide
                    key={`popular-skeleton-${index}`}
                    className="products__slide"
                  >
                    <OfferBubbleSkeleton background="white" />
                  </SwiperSlide>
                ))
              : products.map((product) => (
                  <SwiperSlide key={product.id} className="products__slide">
                    {renderProductBubble(product)}
                  </SwiperSlide>
                ))}
          </Swiper>
        ) : (
          <div
            className={`products products--grid ${
              showSkeleton ? "" : "catalog-fade-in"
            }`.trim()}
          >
            {showSkeleton ? (
              <>
                <div className="products-left">
                  {Array.from({ length: 4 }, (_, index) => (
                    <OfferBubbleSkeleton
                      key={`popular-sm-skeleton-${index}`}
                      background="white"
                      className="products__bubble products__bubble--sm"
                    />
                  ))}
                </div>
                {Array.from({ length: 2 }, (_, index) => (
                  <OfferBubbleSkeleton
                    key={`popular-lg-skeleton-${index}`}
                    background="white"
                    className="products__bubble products__bubble--lg"
                  />
                ))}
              </>
            ) : (
              <>
                <div className="products-left">
                  {smallProducts.map((product) => (
                    <div key={product.id}>
                      {renderProductBubble(
                        product,
                        "products__bubble products__bubble--sm",
                      )}
                    </div>
                  ))}
                </div>
                {largeProducts.map((product) =>
                  renderProductBubble(
                    product,
                    "products__bubble products__bubble--lg",
                  ),
                )}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularProducts;

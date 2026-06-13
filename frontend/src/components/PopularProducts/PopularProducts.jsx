/* Секция главной страницы: сетка товаров каталога. */
import { Link } from "react-router-dom";
import OfferBubble from "../OfferBubble/OfferBubble";
import TagSlider from "../TagSlider/TagSlider";
import { useCatalog } from "../../context/CatalogContext";
import { TOP_PRODUCT_CATEGORIES } from "../../data/topCategories";
import "./PopularProducts.scss";

/**
 * Секция главной страницы с пузырьками популярных товаров и чипами категорий.
 */
const PopularProducts = ({ className = "" }) => {
  const { getTopProducts } = useCatalog();
  const products = getTopProducts("all");
  const smallProducts = products.slice(0, 4);
  const largeProducts = products.slice(4, 6);
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
        <div className="products">
          <div className="products-left">
            {smallProducts.map((product) => (
              <OfferBubble
                key={product.id}
                className="products__bubble products__bubble--sm"
                image={product.image}
                alt={product.title}
                price={`${product.price}$`}
                background="white"
                productId={product.id}
                to={`/product/${product.id}`}
              />
            ))}
          </div>
          {largeProducts.map((product) => (
            <OfferBubble
              key={product.id}
              className="products__bubble products__bubble--lg"
              image={product.image}
              alt={product.title}
              price={`${product.price}$`}
              background="white"
              productId={product.id}
              to={`/product/${product.id}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularProducts;

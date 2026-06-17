/* Landing: hero, popular products, discounts, category labels. */
import HeroSection from "../../components/HeroSection/HeroSection";
import PopularProducts from "../../components/PopularProducts/PopularProducts";
import Discounts from "../../components/Discounts/Discounts";
import ProductGrid from "../../components/ProductGrid/ProductGrid";
import "./Home.scss";

/**
 * Landing route: hero, popular products, promotions and product grid.
 */
const Home = () => {
  return (
    <div className="home">
      <HeroSection />
      <PopularProducts />
      <Discounts />
      <section className="home__product-grid">
        <div className="container">
          <h2 className="home__product-grid-heading">
            Everything you need in one place!
          </h2>
          <ProductGrid columns={4} />
        </div>
      </section>
    </div>
  );
};

export default Home;

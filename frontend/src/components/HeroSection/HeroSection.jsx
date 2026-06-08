import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "./HeroSection.scss";
import { ArrowRight, Sale } from "../../iconComponents";
import OfferBubble from "../OfferBubble/OfferBubble";
import { useCatalog } from "../../context/CatalogContext";

const HeroSection = ({ className = "" }) => {
  const { getDiscountProducts } = useCatalog();
  const offers = getDiscountProducts().slice(0, 5);

  return (
    <section className={`hero-section ${className}`.trim()}>
      <div className="container">
        <h1 className="hero-section-title">
          <span className="hero-section-title__top">
            <span className="hero-section-title__line">
              YOUR TERRITOR
              <span className="hero-section-title__y">
                Y
                <Sale className="hero-section-title__sale" aria-hidden="true" />
              </span>
            </span>
            <span className="hero-section-title__of">OF</span>
          </span>
          <span className="hero-section-title__accent">
            BENEFITABLE SHOPPING
          </span>
        </h1>

        <div className="top-offers">
          <Link to="/discounts" className="top-offers-title">
            <span>TOP OFFER OF THE WEEK</span>
            <ArrowRight className="arrow-right" />
          </Link>

          <Swiper
            className="offers offers--slider"
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
              1200: {
                slidesPerView: 4,
                spaceBetween: 24,
              },
              1500: {
                slidesPerView: 5,
                spaceBetween: 36,
              },
            }}
          >
            {offers.map((product) => (
              <SwiperSlide key={product.id} className="offers__slide">
                <OfferBubble
                  image={product.image}
                  alt={product.title}
                  price={`${product.price}$`}
                  background="gray"
                  productId={product.id}
                  to={`/product/${product.id}`}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

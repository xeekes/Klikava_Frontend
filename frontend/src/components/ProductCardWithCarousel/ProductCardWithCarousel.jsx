/* Карточка товара с каруселью изображений для промо-секций. */
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight, Star } from "../../iconComponents";
import "./ProductCardWithCarousel.scss";

/**
 * Карточка товара с каруселью изображений для промо-секций.
 */
const ProductCardWithCarousel = ({ product }) => {
  const { id, title, price, images, rating, sold } = product;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const productImages = images || [product.image || "/placeholder.jpg"];
  const hasMultipleImages = productImages.length > 1;
  /**
   * Переходит к следующему изображению в карусели без навигации.
   */
  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };
  /**
   * Переходит к предыдущему изображению в карусели без навигации.
   */
  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(
      (prev) => (prev - 1 + productImages.length) % productImages.length,
    );
  };
  /**
   * Формирует иконки заполненных, половинных и пустых звёзд для заданного рейтинга.
   */
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="star-filled" />);
    }
    if (hasHalfStar) {
      stars.push(<Star key="half" className="star-empty" />);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="star-empty" />);
    }
    return stars;
  };
  return (
    <Link to={`/product/${id}`} className="product-card-carousel">
      <div className="product-image-carousel-container">
        <img
          src={productImages[currentImageIndex]}
          alt={title}
          className="product-carousel-image"
        />
        {hasMultipleImages && (
          <>
            <button
              className="carousel-arrow carousel-arrow-left"
              onClick={prevImage}
              aria-label="Предыдущее изображение"
            >
              <ArrowLeft aria-hidden="true" />
            </button>
            <button
              className="carousel-arrow carousel-arrow-right"
              onClick={nextImage}
              aria-label="Следующее изображение"
            >
              <ChevronRight aria-hidden="true" />
            </button>
            <div className="carousel-indicators">
              {productImages.map((_, index) => (
                <span
                  key={index}
                  className={`indicator ${index === currentImageIndex ? "active" : ""}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="product-card-info">
        <h3 className="product-card-title">{title}</h3>
        <div className="product-card-footer">
          <div className="product-card-price">{price}$</div>
          <div className="product-card-meta">
            {sold && <span className="sold-count">{sold} sold</span>}
            {rating && (
              <div className="product-rating-stars">{renderStars(rating)}</div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCardWithCarousel;

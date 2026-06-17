/* Swiper feed of thumbnails for a mobile product gallery. */
import { useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
const THUMB_SLIDES_PER_VIEW = 4;
const THUMB_AUTOPLAY_DELAY = 2800;

/**
 * Mobile swiper feed of product image thumbnails.
 * @param {{ productId: string|number, images: string[], title: string, activeIndex: number, onSelect: (index: number) => void }} props
 */
const ProductDetailThumbsSlider = ({
  productId,
  images,
  title,
  activeIndex,
  onSelect,
}) => {
  const swiperRef = useRef(null);
  const slidesPerView = Math.min(THUMB_SLIDES_PER_VIEW, images.length);
  const canAutoplay = images.length > 1;

  /**
   * Moves swiper to the specified slide if it is different from the active index.
   * @param {number} index
   * @param {number} [speed]
   */
  const slideToIndex = (index, speed = 300) => {
    const swiper = swiperRef.current;
    if (!swiper || swiper.destroyed || swiper.activeIndex === index) {
      return;
    }
    swiper.slideTo(index, speed);
  };
  useEffect(() => {
    slideToIndex(activeIndex, 0);
  }, [activeIndex]);

  /**
   * Selects a thumbnail and notifies the parent gallery of the new index.
   * @param {number} index
   */
  const handleThumbClick = (index) => {
    slideToIndex(index);
    onSelect(index);
  };
  return (
    <div className="product-detail__thumbs-slider">
      <Swiper
        key={productId}
        className="product-detail__thumbs-swiper"
        modules={[Autoplay]}
        slidesPerView={slidesPerView}
        spaceBetween={8}
        loop={false}
        rewind={canAutoplay}
        speed={450}
        watchOverflow
        observer
        observeParents
        autoplay={
          canAutoplay
            ? {
                delay: THUMB_AUTOPLAY_DELAY,
                disableOnInteraction: false,
              }
            : false
        }
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          if (swiper.activeIndex !== activeIndex) {
            swiper.slideTo(activeIndex, 0);
          }
        }}
      >
        {images.map((image, index) => (
          <SwiperSlide
            key={`${productId}-thumb-slide-${index}`}
            className="product-detail__thumbs-slide"
          >
            <button
              type="button"
              className={`product-detail__thumb ${
                activeIndex === index ? "product-detail__thumb--active" : ""
              }`.trim()}
              onClick={() => handleThumbClick(index)}
            >
              <img src={image} alt={`${title} ${index + 1}`} />
            </button>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ProductDetailThumbsSlider;

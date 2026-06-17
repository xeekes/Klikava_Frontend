/* Horizontal scroller of chips/tags for filters and tips. */
import { Children } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "./TagSlider.scss";

/**
 * Horizontal scroller of chips or tags for filters and tips.
 */
const TagSlider = ({
  children,
  className = "",
  spaceBetween = 12,
  ariaLabel,
}) => {
  const items = Children.toArray(children).filter(Boolean);
  if (!items.length) {
    return null;
  }
  return (
    <div
      className={`tag-slider ${className}`.trim()}
      {...(ariaLabel ? { "aria-label": ariaLabel } : {})}
    >
      <Swiper
        className="tag-slider__swiper"
        modules={[FreeMode]}
        slidesPerView="auto"
        spaceBetween={spaceBetween}
        freeMode={{ enabled: true, momentum: true }}
        watchOverflow
      >
        {items.map((child, index) => (
          <SwiperSlide
            key={child.key ?? `tag-slide-${index}`}
            className="tag-slider__slide"
          >
            {child}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default TagSlider;

/* Home page section: carousel/grid of discounted products. */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./Discounts.scss";
import ProductCard from "../ProductCard/ProductCard";
import { ProductCardSkeleton } from "../CatalogSkeleton/CatalogSkeleton";
import SeeMoreButton from "../SeeMoreButton/SeeMoreButton";
import { Swiper, SwiperSlide } from "swiper/react";
import { SliderArrowLeft, SliderArrowRight } from "../../iconComponents";
import "swiper/css";
import { useCatalog } from "../../context/CatalogContext";

const DISCOUNTS_PREVIEW_COUNT = 12;
const DISCOUNTS_SKELETON_COUNT = 4;
const SPACE_BETWEEN = 20;
const MIN_SLIDE_WIDTH = 280;

/**
 * A carousel of discounted products on the main page with adaptive page navigation elements.
 */
const Discounts = ({ className = "" }) => {
  const { getDiscountProducts, isFetchingCatalog } = useCatalog();
  const showSkeleton = isFetchingCatalog;
  const discountProducts = useMemo(
    () => getDiscountProducts(),
    [getDiscountProducts],
  );
  const swiperRef = useRef(null);
  const sliderWrapRef = useRef(null);
  const [activePage, setActivePage] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [slidesPerView, setSlidesPerView] = useState(1);
  const previewProducts = useMemo(
    () => discountProducts.slice(0, DISCOUNTS_PREVIEW_COUNT),
    [discountProducts],
  );
  const sliderItems = showSkeleton
    ? Array.from({ length: DISCOUNTS_SKELETON_COUNT }, (_, index) => ({
        id: `discount-skeleton-${index}`,
        skeleton: true,
      }))
    : previewProducts;
  const hasMoreDiscounts = discountProducts.length > DISCOUNTS_PREVIEW_COUNT;
  /**
   * Determines how many slides will fit at the current viewport width.
   */
  const getSlidesPerView = useCallback(
    (width) => {
      if (!width) {
        return 1;
      }
      const fitCount = Math.floor(
        (width + SPACE_BETWEEN) / (MIN_SLIDE_WIDTH + SPACE_BETWEEN),
      );
      return Math.max(1, Math.min(fitCount, sliderItems.length));
    },
    [sliderItems.length],
  );
  /**
   * Calculates the total number of pager points from the number of slides and visible slides.
   */
  const getPageCount = useCallback(
    (perView) => {
      return Math.max(1, Math.ceil(sliderItems.length / perView));
    },
    [sliderItems.length],
  );
  /**
   * Synchronizes Swiper parameters, number of pages and hotspot with markup.
   */
  const updateSliderState = useCallback(
    (swiper) => {
      if (!swiper) {
        return;
      }
      const viewportWidth = sliderWrapRef.current?.clientWidth ?? swiper.width;
      const perView = getSlidesPerView(viewportWidth);
      const pages = getPageCount(perView);
      if (swiper.params.slidesPerView !== perView) {
        swiper.params.slidesPerView = perView;
        swiper.params.slidesPerGroup = perView;
        swiper.update();
      }
      const maxSnapIndex = Math.max(0, pages - 1);
      if (swiper.snapIndex > maxSnapIndex) {
        swiper.slideTo(maxSnapIndex * perView, 0);
      }
      setSlidesPerView(perView);
      setPageCount(pages);
      setActivePage(Math.min(swiper.snapIndex, maxSnapIndex));
    },
    [getPageCount, getSlidesPerView],
  );
  useEffect(() => {
    const wrap = sliderWrapRef.current;
    if (!wrap) {
      return undefined;
    }
    const observer = new ResizeObserver(() => {
      if (swiperRef.current) {
        updateSliderState(swiperRef.current);
      }
    });
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [updateSliderState]);
  /**
   * Moves the carousel to the specified pager index.
   */
  const goToPage = (pageIndex) => {
    const swiper = swiperRef.current;
    if (!swiper) {
      return;
    }
    const perView = swiper.params.slidesPerGroup || slidesPerView;
    swiper.slideTo(pageIndex * perView);
  };
  /**
   * Moves to the previous group of slides, with the last page at the beginning.
   */
  const handlePrev = () => {
    const swiper = swiperRef.current;
    if (!swiper) {
      return;
    }
    if (swiper.isBeginning && pageCount > 1) {
      const lastPage = pageCount - 1;
      swiper.slideTo(
        lastPage * (swiper.params.slidesPerGroup || slidesPerView),
      );
      return;
    }
    swiper.slidePrev();
  };
  /**
   * Moves to the next group of slides, with a transition to the first page at the end.
   */
  const handleNext = () => {
    const swiper = swiperRef.current;
    if (!swiper) {
      return;
    }
    const perView = swiper.params.slidesPerGroup || slidesPerView;
    const maxSnapIndex = Math.max(0, pageCount - 1);
    if (pageCount > 1 && (swiper.snapIndex >= maxSnapIndex || swiper.isEnd)) {
      swiper.slideTo(0);
      return;
    }
    swiper.slideNext();
  };
  return (
    <section className={`discounts ${className}`.trim()}>
      <div className="container">
        <h2 className="discounts__title">Discounts</h2>
      </div>
      <div className="discounts__slider-wrap" ref={sliderWrapRef}>
        <button
          type="button"
          className="discounts__nav discounts__nav--prev"
          aria-label="Previous products"
          onClick={handlePrev}
        >
          <SliderArrowLeft aria-hidden="true" />
        </button>
        <Swiper
          className={`discounts__slider ${
            showSkeleton ? "" : "catalog-fade-in"
          }`.trim()}
          slidesPerView={slidesPerView}
          slidesPerGroup={slidesPerView}
          spaceBetween={SPACE_BETWEEN}
          watchOverflow={false}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            updateSliderState(swiper);
          }}
          onResize={updateSliderState}
          onSnapIndexChange={updateSliderState}
          onSlideChange={updateSliderState}
          onTransitionEnd={updateSliderState}
        >
          {sliderItems.map((item) => (
            <SwiperSlide key={item.id} className="discounts__slide">
              {item.skeleton ? (
                <ProductCardSkeleton rounded />
              ) : (
                <ProductCard product={item} rounded />
              )}
            </SwiperSlide>
          ))}
        </Swiper>
        <button
          type="button"
          className="discounts__nav discounts__nav--next"
          aria-label="Next products"
          onClick={handleNext}
        >
          <SliderArrowRight aria-hidden="true" />
        </button>
      </div>
      {!showSkeleton && pageCount > 1 ? (
        <div
          className="discounts__pagination"
          role="tablist"
          aria-label="Discounts pages"
        >
          {Array.from({ length: pageCount }, (_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={activePage === index}
              aria-label={`Page ${index + 1}`}
              className={`discounts__pagination-bullet ${
                activePage === index
                  ? "discounts__pagination-bullet--active"
                  : ""
              }`.trim()}
              onClick={() => goToPage(index)}
            />
          ))}
        </div>
      ) : null}
      {!showSkeleton && hasMoreDiscounts ? (
        <SeeMoreButton
          to="/discounts"
          wrapClassName="discounts__see-more-wrap"
        />
      ) : null}
    </section>
  );
};

export default Discounts;

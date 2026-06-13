/*
 * Переиспользуемая сетка каталога с боковой панелью сортировки/фильтров (desktop) или модальным окном (mobile).
 * Используется страницами Catalog, Search, Discounts, TopProducts и CategoryListing.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Filter, MenuArrowRight, Star } from "../../iconComponents";
import { useMotionPresence } from "../../hooks/useMotionPresence";
import useProductPagination from "../../hooks/useProductPagination";
import { validatePriceRange } from "../../utils/validation";
import Modal, { useModalClose } from "../Modal/Modal";
import ProductCard from "../ProductCard/ProductCard";
import SeeMoreButton from "../SeeMoreButton/SeeMoreButton";
import TagSlider from "../TagSlider/TagSlider";
import "./CatalogListing.scss";
const FILTER_SIDEBAR_MAX = 968;
const SORT_OPTIONS = [
  { value: "popular", label: "Most popular" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "sold", label: "Best sellers" },
];
const RATING_OPTIONS = [
  { value: "", label: "Any" },
  { value: "4", label: "4+ stars" },
  { value: "3", label: "3+ stars" },
];

/**
 * Панель мобильных фильтров, рендерящаяся внутри модального окна листинга каталога.
 */
const CatalogListingFiltersModalPanel = ({
  activeFilterCount,
  hasActiveFilters,
  clearFilters,
  children,
}) => {
  const close = useModalClose();
  return (
    <aside className="catalog-listing__filters catalog-listing__filters--modal">
      <div className="catalog-listing__filters-head">
        <div className="catalog-listing__filters-title">
          <Filter
            className="catalog-listing__filters-icon"
            aria-hidden="true"
          />
          <h2>Filters</h2>
          {activeFilterCount > 0 ? (
            <span className="catalog-listing__filters-badge">
              {activeFilterCount}
            </span>
          ) : null}
        </div>
        <div className="catalog-listing__filters-head-actions">
          {hasActiveFilters ? (
            <button
              type="button"
              className="catalog-listing__clear-filters"
              onClick={clearFilters}
            >
              Clear all
            </button>
          ) : null}
          <button
            type="button"
            className="catalog-listing__filters-close"
            onClick={close}
            aria-label="Close filters"
          >
            ×
          </button>
        </div>
      </div>
      {children}
    </aside>
  );
};

/**
 * Переиспользуемая сетка каталога с боковой панелью сортировки или модальным окном фильтров.
 */
const CatalogListing = ({
  title,
  subtitle,
  products,
  emptyMessage = "No products found.",
  showFilters = true,
  showDiscountFilter = false,
}) => {
  const [sortBy, setSortBy] = useState("popular");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef(null);
  const sortMenuMotion = useMotionPresence(isSortOpen);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");
  const [discountedOnly, setDiscountedOnly] = useState(false);
  const [filterErrors, setFilterErrors] = useState({});
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [useFilterModal, setUseFilterModal] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(`(max-width: ${FILTER_SIDEBAR_MAX}px)`).matches
      : false,
  );
  const priceBounds = useMemo(() => {
    if (!products.length) {
      return { min: 0, max: 500 };
    }
    const prices = products.map((product) => Number(product.price) || 0);
    let min = Math.floor(Math.min(...prices));
    let max = Math.ceil(Math.max(...prices));
    if (min === max) {
      max = min + 10;
    }
    return { min, max };
  }, [products]);
  const committedMin = minPrice === "" ? priceBounds.min : Number(minPrice);
  const committedMax = maxPrice === "" ? priceBounds.max : Number(maxPrice);
  const [sliderRange, setSliderRange] = useState({
    min: committedMin,
    max: committedMax,
  });
  const sliderRangeRef = useRef(sliderRange);
  const isPriceDraggingRef = useRef(false);
  useEffect(() => {
    sliderRangeRef.current = sliderRange;
  }, [sliderRange]);
  useEffect(() => {
    if (isPriceDraggingRef.current) {
      return;
    }
    setSliderRange({
      min: committedMin,
      max: committedMax,
    });
  }, [committedMin, committedMax]);
  const { min: sliderMin, max: sliderMax } = sliderRange;
  const rangeSpan = priceBounds.max - priceBounds.min || 1;
  const rangeFillLeft = ((sliderMin - priceBounds.min) / rangeSpan) * 100;
  const rangeFillRight =
    100 - ((sliderMax - priceBounds.min) / rangeSpan) * 100;
  /**
   * Синхронизирует текстовые поля цены со значениями двойного range-слайдера.
   */
  const setPriceFromSliders = (nextMinValue, nextMaxValue) => {
    const nextMin = nextMinValue <= priceBounds.min ? "" : String(nextMinValue);
    const nextMax = nextMaxValue >= priceBounds.max ? "" : String(nextMaxValue);
    setMinPrice(nextMin);
    setMaxPrice(nextMax);
    setFilterErrors(validatePriceRange(nextMin, nextMax));
  };
  /**
   * Применяет диапазон слайдера к зафиксированному состоянию фильтра после окончания перетаскивания.
   */
  const commitPriceRange = () => {
    if (!isPriceDraggingRef.current) {
      return;
    }
    isPriceDraggingRef.current = false;
    const { min, max } = sliderRangeRef.current;
    setPriceFromSliders(min, max);
  };
  /**
   * Обновляет нижнюю границу при перетаскивании нижнего ползунка диапазона.
   */
  const handleMinSliderChange = (event) => {
    isPriceDraggingRef.current = true;
    const nextMin = Number(event.target.value);
    setSliderRange((prev) => ({
      min: Math.min(nextMin, prev.max),
      max: prev.max,
    }));
  };
  /**
   * Обновляет верхнюю границу при перетаскивании верхнего ползунка диапазона.
   */
  const handleMaxSliderChange = (event) => {
    isPriceDraggingRef.current = true;
    const nextMax = Number(event.target.value);
    setSliderRange((prev) => ({
      min: prev.min,
      max: Math.max(nextMax, prev.min),
    }));
  };
  /**
   * Сбрасывает все активные фильтры цены, рейтинга и скидки.
   */
  const clearFilters = () => {
    isPriceDraggingRef.current = false;
    setMinPrice("");
    setMaxPrice("");
    setMinRating("");
    setDiscountedOnly(false);
    setFilterErrors({});
  };
  const hasActiveFilters =
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    Boolean(minRating) ||
    (showDiscountFilter && discountedOnly);
  const activeFilterTags = useMemo(() => {
    const tags = [];
    if (minPrice && !filterErrors.minPrice) {
      tags.push({ id: "minPrice", label: `From $${minPrice}` });
    }
    if (maxPrice && !filterErrors.maxPrice) {
      tags.push({ id: "maxPrice", label: `Up to $${maxPrice}` });
    }
    if (minRating === "4") {
      tags.push({ id: "rating", label: "4+ stars" });
    } else if (minRating === "3") {
      tags.push({ id: "rating", label: "3+ stars" });
    }
    if (showDiscountFilter && discountedOnly) {
      tags.push({ id: "discount", label: "On sale" });
    }
    return tags;
  }, [
    minPrice,
    maxPrice,
    minRating,
    discountedOnly,
    showDiscountFilter,
    filterErrors,
  ]);
  const activeFilterCount = activeFilterTags.length;
  /**
   * Удаляет один активный чип фильтра по его идентификатору.
   */
  const removeFilterTag = (id) => {
    if (id === "minPrice") {
      setMinPrice("");
    } else if (id === "maxPrice") {
      setMaxPrice("");
    } else if (id === "rating") {
      setMinRating("");
    } else if (id === "discount") {
      setDiscountedOnly(false);
    }
    setFilterErrors(
      validatePriceRange(
        id === "minPrice" ? "" : minPrice,
        id === "maxPrice" ? "" : maxPrice,
      ),
    );
  };
  const visibleProducts = useMemo(() => {
    let result = [...products];
    if (showDiscountFilter && discountedOnly) {
      result = result.filter((product) => product.discountPercent);
    }
    if (minPrice !== "" && !filterErrors.minPrice) {
      result = result.filter((product) => product.price >= Number(minPrice));
    }
    if (maxPrice !== "" && !filterErrors.maxPrice) {
      result = result.filter((product) => product.price <= Number(maxPrice));
    }
    if (minRating !== "") {
      result = result.filter((product) => product.rating >= Number(minRating));
    }
    switch (sortBy) {
      case "price-low":
        return result.sort((a, b) => a.price - b.price);
      case "price-high":
        return result.sort((a, b) => b.price - a.price);
      case "rating":
        return result.sort((a, b) => b.rating - a.rating);
      case "sold":
        return result.sort((a, b) => b.sold - a.sold);
      case "popular":
      default:
        return result.sort((a, b) => b.sold - a.sold);
    }
  }, [
    products,
    sortBy,
    minPrice,
    maxPrice,
    minRating,
    discountedOnly,
    showDiscountFilter,
    filterErrors,
  ]);
  const listingKey = [
    sortBy,
    discountedOnly,
    minPrice,
    maxPrice,
    minRating,
    visibleProducts.map((product) => product.id).join(","),
  ].join("-");
  const {
    visibleItems: paginatedProducts,
    hasMore: hasMoreProducts,
    loadMore: loadMoreProducts,
  } = useProductPagination(visibleProducts, listingKey);
  const selectedSortLabel =
    SORT_OPTIONS.find((option) => option.value === sortBy)?.label ??
    "Most popular";
  useEffect(() => {
    const mediaQuery = window.matchMedia(
      `(max-width: ${FILTER_SIDEBAR_MAX}px)`,
    );
    const updateFilterLayout = () => setUseFilterModal(mediaQuery.matches);
    updateFilterLayout();
    mediaQuery.addEventListener("change", updateFilterLayout);
    return () => mediaQuery.removeEventListener("change", updateFilterLayout);
  }, []);
  useEffect(() => {
    if (!useFilterModal) {
      setIsFiltersModalOpen(false);
    }
  }, [useFilterModal]);
  useEffect(() => {
    if (!isSortOpen) {
      return undefined;
    }
    const handlePointerDown = (event) => {
      if (!sortRef.current?.contains(event.target)) {
        setIsSortOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSortOpen]);
  /**
   * Применяет выбранный вариант сортировки и закрывает выпадающий список.
   */
  const handleSortSelect = (value) => {
    setSortBy(value);
    setIsSortOpen(false);
  };
  const sidebarFiltersHead = (
    <div className="catalog-listing__filters-head">
      <div className="catalog-listing__filters-title">
        <Filter className="catalog-listing__filters-icon" aria-hidden="true" />
        <h2>Filters</h2>
        {activeFilterCount > 0 ? (
          <span className="catalog-listing__filters-badge">
            {activeFilterCount}
          </span>
        ) : null}
      </div>
      {hasActiveFilters ? (
        <button
          type="button"
          className="catalog-listing__clear-filters"
          onClick={clearFilters}
        >
          Clear all
        </button>
      ) : null}
    </div>
  );
  const filterGroups = (
    <>
      <div className="catalog-listing__filter-group">
        <h3 className="catalog-listing__filter-label">Price range</h3>
        <p className="catalog-listing__filter-hint">USD, per item</p>
        <div className="catalog-listing__price-range">
          <div className="catalog-listing__price-range-values">
            <span>${sliderMin}</span>
            <span>${sliderMax}</span>
          </div>
          <div
            className="catalog-listing__price-range-sliders"
            style={{
              "--range-left": `${rangeFillLeft}%`,
              "--range-right": `${rangeFillRight}%`,
            }}
          >
            <div
              className="catalog-listing__price-range-track"
              aria-hidden="true"
            />
            <input
              type="range"
              className="catalog-listing__price-range-input catalog-listing__price-range-input--min"
              min={priceBounds.min}
              max={priceBounds.max}
              step={1}
              value={sliderMin}
              onChange={handleMinSliderChange}
              onPointerUp={commitPriceRange}
              onKeyUp={commitPriceRange}
              aria-label="Minimum price"
              aria-valuemin={priceBounds.min}
              aria-valuemax={priceBounds.max}
              aria-valuenow={sliderMin}
            />
            <input
              type="range"
              className="catalog-listing__price-range-input catalog-listing__price-range-input--max"
              min={priceBounds.min}
              max={priceBounds.max}
              step={1}
              value={sliderMax}
              onChange={handleMaxSliderChange}
              onPointerUp={commitPriceRange}
              onKeyUp={commitPriceRange}
              aria-label="Maximum price"
              aria-valuemin={priceBounds.min}
              aria-valuemax={priceBounds.max}
              aria-valuenow={sliderMax}
            />
          </div>
        </div>
      </div>
      <div className="catalog-listing__filter-group">
        <h3 className="catalog-listing__filter-label">Customer rating</h3>
        <div
          className="catalog-listing__rating-options"
          role="group"
          aria-label="Minimum rating"
        >
          {RATING_OPTIONS.map((option) => (
            <button
              key={option.value || "any"}
              type="button"
              className={`catalog-listing__rating-btn ${
                minRating === option.value
                  ? "catalog-listing__rating-btn--active"
                  : ""
              }`.trim()}
              onClick={() => setMinRating(option.value)}
            >
              {option.value ? (
                <Star
                  className="catalog-listing__rating-btn-icon"
                  aria-hidden="true"
                />
              ) : null}
              {option.label}
            </button>
          ))}
        </div>
      </div>
      {showDiscountFilter ? (
        <div className="catalog-listing__filter-group catalog-listing__filter-group--offers">
          <h3 className="catalog-listing__filter-label">Special offers</h3>
          <label className="catalog-listing__toggle">
            <input
              type="checkbox"
              checked={discountedOnly}
              onChange={(event) => setDiscountedOnly(event.target.checked)}
            />
            <span
              className="catalog-listing__toggle-track"
              aria-hidden="true"
            />
            <span className="catalog-listing__toggle-text">
              Show discounted items only
            </span>
          </label>
        </div>
      ) : null}
    </>
  );
  return (
    <section className="catalog-listing">
      <div className="container">
        <header className="catalog-listing__header">
          <div className="catalog-listing__heading">
            {title ? <h1 className="catalog-listing__title">{title}</h1> : null}
            {subtitle ? (
              <p className="catalog-listing__subtitle">{subtitle}</p>
            ) : null}
          </div>
          <div className="catalog-listing__sort" ref={sortRef}>
            <span
              className="catalog-listing__sort-label"
              id="catalog-sort-label"
            >
              Sort by
            </span>
            <div className="catalog-listing__sort-control">
              <button
                type="button"
                className={`catalog-listing__sort-trigger ${
                  isSortOpen ? "catalog-listing__sort-trigger--open" : ""
                }`.trim()}
                onClick={() => setIsSortOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={isSortOpen}
                aria-labelledby="catalog-sort-label"
              >
                <span className="catalog-listing__sort-value">
                  {selectedSortLabel}
                </span>
                <MenuArrowRight
                  className="catalog-listing__sort-chevron"
                  aria-hidden="true"
                />
              </button>
              {sortMenuMotion.rendered ? (
                <ul
                  className={`catalog-listing__sort-menu ${sortMenuMotion.className}`.trim()}
                  role="listbox"
                  aria-label="Sort options"
                >
                  {SORT_OPTIONS.map((option) => (
                    <li key={option.value} role="none">
                      <button
                        type="button"
                        role="option"
                        aria-selected={sortBy === option.value}
                        className={`catalog-listing__sort-option ${
                          sortBy === option.value
                            ? "catalog-listing__sort-option--active"
                            : ""
                        }`.trim()}
                        onClick={() => handleSortSelect(option.value)}
                      >
                        {option.label}
                        {sortBy === option.value ? (
                          <span
                            className="catalog-listing__sort-check"
                            aria-hidden="true"
                          />
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </header>
        <div className="catalog-listing__layout">
          {showFilters && !useFilterModal ? (
            <aside className="catalog-listing__filters">
              {sidebarFiltersHead}
              {filterGroups}
            </aside>
          ) : null}
          <div
            key={listingKey}
            className="catalog-listing__content motion-content-swap"
          >
            <div className="catalog-listing__toolbar">
              {showFilters && useFilterModal ? (
                <button
                  type="button"
                  className="catalog-listing__filters-trigger"
                  onClick={() => setIsFiltersModalOpen(true)}
                  aria-haspopup="dialog"
                >
                  <Filter
                    className="catalog-listing__filters-trigger-icon"
                    aria-hidden="true"
                  />
                  <span>Filters</span>
                  {activeFilterCount > 0 ? (
                    <span className="catalog-listing__filters-trigger-badge">
                      {activeFilterCount}
                    </span>
                  ) : null}
                </button>
              ) : null}
              <p className="catalog-listing__count">
                <span className="catalog-listing__count-value">
                  {visibleProducts.length}
                </span>{" "}
                {visibleProducts.length === 1 ? "product" : "products"} found
              </p>
              {activeFilterTags.length ? (
                <TagSlider
                  className="catalog-listing__active-tags"
                  spaceBetween={8}
                >
                  {activeFilterTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      className="catalog-listing__active-tag"
                      onClick={() => removeFilterTag(tag.id)}
                    >
                      {tag.label}
                      <span aria-hidden="true">×</span>
                    </button>
                  ))}
                </TagSlider>
              ) : null}
            </div>
            {visibleProducts.length ? (
              <>
                <div className="catalog-listing__grid">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} rounded />
                  ))}
                </div>
                {hasMoreProducts ? (
                  <SeeMoreButton
                    onClick={loadMoreProducts}
                    wrapClassName="catalog-listing__see-more-wrap"
                  />
                ) : null}
              </>
            ) : (
              <div className="catalog-listing__empty">
                <p className="catalog-listing__empty-title">No matches</p>
                <p className="catalog-listing__empty-text">{emptyMessage}</p>
                {hasActiveFilters ? (
                  <button
                    type="button"
                    className="catalog-listing__empty-reset"
                    onClick={clearFilters}
                  >
                    Reset filters
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
      {showFilters && useFilterModal && isFiltersModalOpen ? (
        <Modal
          ariaLabel="Filters"
          onClose={() => setIsFiltersModalOpen(false)}
          panelClassName="catalog-listing__filters-modal-panel"
          hideCloseButton
        >
          <CatalogListingFiltersModalPanel
            activeFilterCount={activeFilterCount}
            hasActiveFilters={hasActiveFilters}
            clearFilters={clearFilters}
          >
            {filterGroups}
          </CatalogListingFiltersModalPanel>
        </Modal>
      ) : null}
    </section>
  );
};

export default CatalogListing;

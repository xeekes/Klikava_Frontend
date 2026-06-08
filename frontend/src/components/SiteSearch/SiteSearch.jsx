import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search } from "../../iconComponents";
import { useCatalog } from "../../context/CatalogContext";
import { useMotionPresence } from "../../hooks/useMotionPresence";
import TagSlider from "../TagSlider/TagSlider";
import { buildSearchUrl } from "../../utils/searchScope";
import "./SiteSearch.scss";

const SiteSearch = ({
  variant = "header",
  initialQuery = "",
  autoFocus = false,
  placeholder = "Search products, categories...",
  searchScope = null,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const listboxId = useId();
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const scope = searchScope || {};
  const { getSearchSuggestions } = useCatalog();

  const urlQuery = useMemo(() => {
    if (location.pathname !== "/search") {
      return "";
    }

    return new URLSearchParams(location.search).get("q") || "";
  }, [location.pathname, location.search]);

  useEffect(() => {
    setQuery(urlQuery || initialQuery);
  }, [urlQuery, initialQuery]);

  useEffect(() => {
    if (!autoFocus) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [autoFocus]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const suggestions = useMemo(
    () => getSearchSuggestions(query, scope),
    [query, scope]
  );

  const hasQuery = query.trim().length > 0;
  const hasResults =
    suggestions.products.length > 0 || suggestions.categories.length > 0;
  const showDropdown = isOpen && (hasQuery ? hasResults : true);
  const dropdownMotion = useMotionPresence(showDropdown);

  const goToSearch = (value) => {
    const nextQuery = value.trim();

    if (!nextQuery) {
      if (scope.scope === "discounts") {
        navigate("/discounts");
      } else if (scope.scope === "top") {
        navigate(
          scope.topCategoryId && scope.topCategoryId !== "all"
            ? `/top-products?category=${scope.topCategoryId}`
            : "/top-products"
        );
      } else {
        navigate("/search");
      }

      setIsOpen(false);
      return;
    }

    navigate(buildSearchUrl(nextQuery, scope));
    setIsOpen(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    goToSearch(query);
  };

  const handleInputChange = (event) => {
    setQuery(event.target.value);
    setIsOpen(true);
  };

  const handlePopularClick = (term) => {
    setQuery(term);
    goToSearch(term);
  };

  const getCategoryLink = (category) => {
    if (category.subcategory) {
      return `/categories/${category.categoryId}/${encodeURIComponent(category.subcategory)}`;
    }

    return `/categories/${category.categoryId}`;
  };

  return (
    <div
      ref={rootRef}
      className={`site-search site-search--${variant} ${
        showDropdown ? "site-search--open" : ""
      }`.trim()}
    >
      <form className="site-search__form" onSubmit={handleSubmit} role="search">
        <input
          ref={inputRef}
          type="search"
          className="site-search__input"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          aria-label="Search"
          aria-expanded={showDropdown}
          aria-controls={showDropdown ? listboxId : undefined}
          autoComplete="off"
        />
        <button type="submit" className="site-search__submit" aria-label="Search">
          <Search className="site-search__icon" aria-hidden="true" />
        </button>
      </form>

      {dropdownMotion.rendered ? (
        <div
          className={`site-search__dropdown ${dropdownMotion.className}`.trim()}
          id={listboxId}
        >
          {!hasQuery ? (
            <div className="site-search__section">
              <p className="site-search__section-title">Popular searches</p>
              <TagSlider className="site-search__chips" spaceBetween={8}>
                {suggestions.popular.map((term) => (
                  <button
                    key={term}
                    type="button"
                    className="site-search__chip"
                    onClick={() => handlePopularClick(term)}
                  >
                    {term}
                  </button>
                ))}
              </TagSlider>
            </div>
          ) : null}

          {suggestions.products.length ? (
            <div className="site-search__section">
              <p className="site-search__section-title">Products</p>
              <ul className="site-search__list">
                {suggestions.products.map((product) => (
                  <li key={product.id}>
                    <Link
                      to={`/product/${product.id}`}
                      className="site-search__item site-search__item--product"
                      onClick={() => setIsOpen(false)}
                    >
                      <img src={product.image} alt="" />
                      <span className="site-search__item-body">
                        <span className="site-search__item-title">
                          {product.title}
                        </span>
                        <span className="site-search__item-meta">
                          {product.price} $
                          {product.discountPercent
                            ? ` · -${product.discountPercent}%`
                            : ""}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {suggestions.categories.length ? (
            <div className="site-search__section">
              <p className="site-search__section-title">Categories</p>
              <ul className="site-search__list">
                {suggestions.categories.map((category) => (
                  <li key={`${category.categoryId}-${category.label}`}>
                    <Link
                      to={getCategoryLink(category)}
                      className="site-search__item site-search__item--category"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="site-search__category-icon" aria-hidden="true">
                        #
                      </span>
                      <span className="site-search__item-body">
                        <span className="site-search__item-title">
                          {category.label}
                        </span>
                        {category.parentName ? (
                          <span className="site-search__item-meta">
                            {category.parentName}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {hasQuery && !hasResults ? (
            <div className="site-search__empty">
              <p>No quick matches for “{query.trim()}”.</p>
              <button
                type="button"
                className="site-search__empty-action"
                onClick={() => goToSearch(query)}
              >
                Search anyway
              </button>
            </div>
          ) : null}

          {hasQuery && hasResults ? (
            <button
              type="button"
              className="site-search__view-all"
              onClick={() => goToSearch(query)}
            >
              View all results for “{query.trim()}”
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default SiteSearch;

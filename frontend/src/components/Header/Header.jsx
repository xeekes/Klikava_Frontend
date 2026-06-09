import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "./Header.scss";
import { Cart, Logo, SliderArrowLeft } from "../../iconComponents";
import SiteSearch from "../SiteSearch/SiteSearch";
import CategoriesDropdown from "../CategoriesDropdown/CategoriesDropdown";
import HeaderUserMenu from "./HeaderUserMenu/HeaderUserMenu";
import { useCart } from "../../context/CartContext";
import { useCatalog } from "../../context/CatalogContext";
import { lockScroll, unlockScroll } from "../../utils/scrollLock";
import { readStorage, STORAGE_KEYS, writeStorage } from "../../utils/storage";

const MOBILE_ROOT_LINKS = [
  { to: "/top-products", label: "TOP PRODUCTS" },
  { to: "/discounts", label: "DISCOUNTS" },
];

const MOBILE_LANGUAGES = [
  { id: "en", label: "English", flag: "🇺🇸" },
  { id: "ru", label: "Russian", flag: "🇷🇺" },
  { id: "uk", label: "Ukrainian", flag: "🇺🇦" },
];

const MOBILE_CURRENCIES = [
  { id: "usd", label: "USD", flag: "🇺🇸" },
  { id: "uah", label: "UAH", flag: "🇺🇦" },
];

const Header = () => {
  const { itemCount } = useCart();
  const { categories } = useCatalog();
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileMenuView, setMobileMenuView] = useState("root");
  const [activeMobileCategoryId, setActiveMobileCategoryId] = useState(null);
  const [activeLanguage, setActiveLanguage] = useState(
    () => readStorage(STORAGE_KEYS.language, "en")
  );
  const [activeCurrency, setActiveCurrency] = useState(
    () => readStorage(STORAGE_KEYS.currency, "usd")
  );
  const categoriesCloseTimerRef = useRef(null);

  const openCategoriesMenu = () => {
    if (categoriesCloseTimerRef.current) {
      clearTimeout(categoriesCloseTimerRef.current);
      categoriesCloseTimerRef.current = null;
    }
    setIsCategoriesOpen(true);
  };

  const scheduleCloseCategoriesMenu = () => {
    categoriesCloseTimerRef.current = setTimeout(() => {
      setIsCategoriesOpen(false);
    }, 200);
  };

  const resetMobileMenuView = () => {
    setMobileMenuView("root");
    setActiveMobileCategoryId(null);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    resetMobileMenuView();
  };

  const activeMobileCategory =
    categories.find((category) => category.id === activeMobileCategoryId) ??
    null;

  const handleLanguageSelect = (languageId) => {
    setActiveLanguage(languageId);
    writeStorage(STORAGE_KEYS.language, languageId);
  };

  const handleCurrencySelect = (currencyId) => {
    setActiveCurrency(currencyId);
    writeStorage(STORAGE_KEYS.currency, currencyId);
  };

  useEffect(() => {
    return () => {
      if (categoriesCloseTimerRef.current) {
        clearTimeout(categoriesCloseTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      lockScroll();
    } else {
      unlockScroll();
    }

    return () => {
      unlockScroll();
    };
  }, [isMobileMenuOpen]);

  return (
    <header
      className={`header ${isCategoriesOpen ? "header--categories-open" : ""} ${
        isMobileMenuOpen ? "header--mobile-open" : ""
      }`.trim()}
    >
      <div className="container">
        <Link to="/" className="logo" onClick={closeMobileMenu}>
          <Logo className="logo-icon" aria-hidden="true" />

          <span className="logo-text">
            KLIK<span>AVA</span>
          </span>
        </Link>

        <nav className="header-nav-links">
          <Link to="/discounts" className="nav-link">
            DISCOUNTS
          </Link>
          <Link to="/top-products" className="nav-link">
            TOP PRODUCTS
          </Link>
          <Link
            to="/categories"
            className="nav-link nav-link--categories"
            onMouseEnter={openCategoriesMenu}
            onMouseLeave={scheduleCloseCategoriesMenu}
          >
            CATEGORIES
          </Link>
        </nav>

        <div className="header-actions">
          <div className="header-right-group">
            <HeaderUserMenu />
            <Link
              to="/cart"
              className="icon-button cart-icon header-cart-link"
              aria-label={`Basket${itemCount > 0 ? `, ${itemCount} items` : ""}`}
              onClick={closeMobileMenu}
            >
              <Cart className="header-action-icon" aria-hidden="true" />
              {itemCount > 0 ? (
                <span className="header-cart-link__badge">{itemCount}</span>
              ) : null}
            </Link>
          </div>

          <button
            type="button"
            className="header-burger"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <SiteSearch variant="header" placeholder="SEARCH..." />
      </div>

      <div
        className="header-categories-dropdown-wrap"
        onMouseEnter={openCategoriesMenu}
        onMouseLeave={scheduleCloseCategoriesMenu}
      >
        <CategoriesDropdown />
      </div>

      <div
        className="header-mobile-menu"
        aria-hidden={!isMobileMenuOpen}
      >
        {mobileMenuView === "root" ? (
          <nav className="header-mobile-menu__links">
            <button
              type="button"
              className="header-mobile-menu__link"
              onClick={() => setMobileMenuView("categories")}
            >
              CATEGORIES
            </button>
            {MOBILE_ROOT_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="header-mobile-menu__link"
                onClick={closeMobileMenu}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ) : null}

        {mobileMenuView === "categories" ? (
          <div className="header-mobile-menu__panel">
            <button
              type="button"
              className="header-mobile-menu__back"
              aria-label="Back to menu"
              onClick={resetMobileMenuView}
            >
              <SliderArrowLeft aria-hidden="true" />
            </button>

            <nav className="header-mobile-menu__drill-list">
              <Link
                to="/categories"
                className="header-mobile-menu__drill-item"
                onClick={closeMobileMenu}
              >
                All categories
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/categories/${category.id}`}
                  className="header-mobile-menu__drill-item"
                  onClick={closeMobileMenu}
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>
        ) : null}

        {mobileMenuView === "subcategories" && activeMobileCategory ? (
          <div className="header-mobile-menu__panel">
            <button
              type="button"
              className="header-mobile-menu__back"
              aria-label="Back to categories"
              onClick={() => {
                setActiveMobileCategoryId(null);
                setMobileMenuView("categories");
              }}
            >
              <SliderArrowLeft aria-hidden="true" />
            </button>

            <nav className="header-mobile-menu__drill-list">
              <Link
                to={`/categories/${activeMobileCategory.id}`}
                className="header-mobile-menu__drill-item"
                onClick={closeMobileMenu}
              >
                All
              </Link>
              {activeMobileCategory.subcategories.map((subcategory) => (
                <Link
                  key={subcategory}
                  to={`/categories/${activeMobileCategory.id}/${encodeURIComponent(subcategory)}`}
                  className="header-mobile-menu__drill-item"
                  onClick={closeMobileMenu}
                >
                  {subcategory}
                </Link>
              ))}
            </nav>
          </div>
        ) : null}

        {mobileMenuView === "root" ? (
        <div className="header-mobile-menu__switchers">
          <div className="header-mobile-menu__group">
            <p className="header-mobile-menu__group-title">Language</p>
            <div className="header-mobile-menu__options">
              {MOBILE_LANGUAGES.map((language) => (
                <button
                  key={language.id}
                  type="button"
                  className={`header-mobile-menu__option ${
                    activeLanguage === language.id
                      ? "header-mobile-menu__option--active"
                      : ""
                  }`.trim()}
                  onClick={() => handleLanguageSelect(language.id)}
                >
                  <span
                    className="header-mobile-menu__option-flag"
                    aria-hidden="true"
                  >
                    {language.flag}
                  </span>
                  <span className="header-mobile-menu__option-label">
                    {language.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="header-mobile-menu__group">
            <p className="header-mobile-menu__group-title">Currency</p>
            <div className="header-mobile-menu__options">
              {MOBILE_CURRENCIES.map((currency) => (
                <button
                  key={currency.id}
                  type="button"
                  className={`header-mobile-menu__option ${
                    activeCurrency === currency.id
                      ? "header-mobile-menu__option--active"
                      : ""
                  }`.trim()}
                  onClick={() => handleCurrencySelect(currency.id)}
                >
                  <span
                    className="header-mobile-menu__option-flag"
                    aria-hidden="true"
                  >
                    {currency.flag}
                  </span>
                  <span className="header-mobile-menu__option-label">
                    {currency.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
        ) : null}
      </div>
    </header>
  );
};

export default Header;

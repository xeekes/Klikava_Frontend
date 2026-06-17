/*
 * Single dynamic imports for React.lazy and prefetch.
 * The import() lines must match, otherwise Vite will create separate chunks.
 */

export const loadCatalog = () => import("../pages/Catalog/Catalog");
export const loadProductDetail = () =>
  import("../pages/ProductDetail/ProductDetail");
export const loadCart = () => import("../pages/Cart/Cart");
export const loadCheckout = () => import("../pages/Checkout/Checkout");
export const loadOrderSuccess = () => import("../pages/OrderSuccess/OrderSuccess");
export const loadNotFound = () => import("../pages/NotFound/NotFound");
export const loadProfileLayout = () => import("../layouts/ProfileLayout");
export const loadProfileOrders = () => import("../pages/Profile/ProfileOrders");
export const loadProfileOrderTrack = () =>
  import("../pages/Profile/ProfileOrderTrack");
export const loadProfileOrderReview = () =>
  import("../pages/Profile/ProfileOrderReview");
export const loadProfileOrderReturn = () =>
  import("../pages/Profile/ProfileOrderReturn");
export const loadProfileFavorites = () =>
  import("../pages/Profile/ProfileFavorites");
export const loadProfileBrowsingHistory = () =>
  import("../pages/Profile/ProfileBrowsingHistory");
export const loadProfileCoupons = () =>
  import("../pages/Profile/ProfileCoupons");
export const loadProfileChat = () => import("../pages/Profile/ProfileChat");
export const loadProfileFeedback = () =>
  import("../pages/Profile/ProfileFeedback");
export const loadProfileAddresses = () =>
  import("../pages/Profile/ProfileAddresses");
export const loadProfileCards = () => import("../pages/Profile/ProfileCards");
export const loadProfilePersonalInfo = () =>
  import("../pages/Profile/ProfilePersonalInfo");
export const loadProfileSupport = () =>
  import("../pages/Profile/ProfileSupport");
export const loadDiscountsPage = () =>
  import("../pages/Discounts/DiscountsPage");
export const loadTopProductsPage = () =>
  import("../pages/TopProducts/TopProductsPage");
export const loadCategoriesPage = () =>
  import("../pages/Categories/CategoriesPage");
export const loadCategoryListingPage = () =>
  import("../pages/Categories/CategoryListingPage");
export const loadSearchPage = () => import("../pages/Search/SearchPage");
export const loadComponentsDemo = () =>
  import("../pages/ComponentsDemo/ComponentsDemo");

export const loadAboutPage = () =>
  import("../pages/Info/InfoPages").then((module) => ({
    default: module.AboutPage,
  }));
export const loadBlogPage = () =>
  import("../pages/Info/InfoPages").then((module) => ({
    default: module.BlogPage,
  }));
export const loadCalendarPage = () =>
  import("../pages/Info/InfoPages").then((module) => ({
    default: module.CalendarPage,
  }));
export const loadSellPage = () =>
  import("../pages/Info/InfoPages").then((module) => ({
    default: module.SellPage,
  }));
export const loadSupportLandingPage = () =>
  import("../pages/Info/InfoPages").then((module) => ({
    default: module.SupportLandingPage,
  }));

/** High priority: menu items and frequent transitions from any page of the storefront. */
export const PREFETCH_TIER1 = [
  { skip: (path) => path.startsWith("/top-products"), load: loadTopProductsPage },
  { skip: (path) => path === "/catalog" || path.startsWith("/catalog?"), load: loadCatalog },
  { skip: (path) => path.startsWith("/product/"), load: loadProductDetail },
  { skip: (path) => path === "/cart", load: loadCart },
];

/** The second wave - after tier1, without profile/checkout. */
export const PREFETCH_TIER2 = [
  { skip: (path) => path.startsWith("/categories"), load: loadCategoriesPage },
  { skip: (path) => path.startsWith("/search"), load: loadSearchPage },
  { skip: (path) => path.startsWith("/discounts"), load: loadDiscountsPage },
];

/**
 * Background loading of route chunks, except for the current pathname.
 * @param {string} pathname
 * @param {{ tier?: 1 | 2 }} [options]
 */
export const prefetchRouteChunks = (pathname, { tier = 1 } = {}) => {
  const routes = tier === 1 ? PREFETCH_TIER1 : PREFETCH_TIER2;
  routes.forEach(({ skip, load }) => {
    if (!skip(pathname)) {
      load();
    }
  });
};

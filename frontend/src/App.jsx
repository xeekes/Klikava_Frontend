/*
 * Корневое приложение: дерево провайдеров, таблица маршрутов, паттерн модального окна авторизации.
 * Порядок провайдеров важен — Catalog зависит от Auth, Favorites от Catalog и т.д.
 */
import { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { resetScrollLock } from "./utils/scrollLock";
import { AuthProvider } from "./context/AuthContext";
import { CatalogProvider } from "./context/CatalogContext";
import { CartProvider } from "./context/CartContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { BrowsingHistoryProvider } from "./context/BrowsingHistoryContext";
import { UserDataProvider } from "./context/UserDataContext";
import MainLayout from "./layouts/MainLayout";
import AuthModal from "./components/AuthModal/AuthModal";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import LoadingSpinner from "./components/LoadingSpinner/LoadingSpinner";
import Home from "./pages/Home/Home";
import { isAuthPath } from "./constants/authRoutes";
import {
  loadAboutPage,
  loadBlogPage,
  loadCalendarPage,
  loadCart,
  loadCatalog,
  loadCategoriesPage,
  loadCategoryListingPage,
  loadCheckout,
  loadComponentsDemo,
  loadDiscountsPage,
  loadNotFound,
  loadOrderSuccess,
  loadProductDetail,
  loadProfileAddresses,
  loadProfileBrowsingHistory,
  loadProfileCards,
  loadProfileChat,
  loadProfileCoupons,
  loadProfileFavorites,
  loadProfileFeedback,
  loadProfileLayout,
  loadProfileOrderReturn,
  loadProfileOrderReview,
  loadProfileOrderTrack,
  loadProfileOrders,
  loadProfilePersonalInfo,
  loadProfileSupport,
  loadSearchPage,
  loadSellPage,
  loadSupportLandingPage,
  loadTopProductsPage,
} from "./routes/routeChunks";
import "./App.scss";

const Catalog = lazy(loadCatalog);
const ProductDetail = lazy(loadProductDetail);
const Cart = lazy(loadCart);
const Checkout = lazy(loadCheckout);
const OrderSuccess = lazy(loadOrderSuccess);
const NotFound = lazy(loadNotFound);
const ProfileLayout = lazy(loadProfileLayout);
const ProfileOrders = lazy(loadProfileOrders);
const ProfileOrderTrack = lazy(loadProfileOrderTrack);
const ProfileOrderReview = lazy(loadProfileOrderReview);
const ProfileOrderReturn = lazy(loadProfileOrderReturn);
const ProfileFavorites = lazy(loadProfileFavorites);
const ProfileBrowsingHistory = lazy(loadProfileBrowsingHistory);
const ProfileCoupons = lazy(loadProfileCoupons);
const ProfileChat = lazy(loadProfileChat);
const ProfileFeedback = lazy(loadProfileFeedback);
const ProfileAddresses = lazy(loadProfileAddresses);
const ProfileCards = lazy(loadProfileCards);
const ProfilePersonalInfo = lazy(loadProfilePersonalInfo);
const ProfileSupport = lazy(loadProfileSupport);
const DiscountsPage = lazy(loadDiscountsPage);
const TopProductsPage = lazy(loadTopProductsPage);
const CategoriesPage = lazy(loadCategoriesPage);
const CategoryListingPage = lazy(loadCategoryListingPage);
const SearchPage = lazy(loadSearchPage);
const ComponentsDemo = lazy(loadComponentsDemo);
const AboutPage = lazy(loadAboutPage);
const BlogPage = lazy(loadBlogPage);
const CalendarPage = lazy(loadCalendarPage);
const SellPage = lazy(loadSellPage);
const SupportLandingPage = lazy(loadSupportLandingPage);

/**
 * Отображается во время загрузки ленивого чанка маршрута.
 */
const RouteLoadingFallback = () => (
  <LoadingSpinner variant="overlay" label="Loading..." />
);

/**
 * Рендерит основную таблицу маршрутов и модальное окно авторизации на auth-пути.
 * Сохраняет фоновую страницу, когда авторизация открывается как модалка через backgroundLocation.
 */
const AppRoutes = () => {
  const location = useLocation();
  /* Когда auth открывается поверх страницы, продолжаем рендерить страницу, с которой пришли. */
  const backgroundLocation = location.state?.backgroundLocation;
  const mainLocation =
    backgroundLocation ||
    (isAuthPath(location.pathname) ? { ...location, pathname: "/" } : location);
  const showAuthModal = isAuthPath(location.pathname);

  return (
    <>
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes location={mainLocation}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/discounts" element={<DiscountsPage />} />
            <Route path="/top-products" element={<TopProductsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route
              path="/categories/:categoryId"
              element={<CategoryListingPage />}
            />
            <Route
              path="/categories/:categoryId/:subcategory"
              element={<CategoryListingPage />}
            />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/sell" element={<SellPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/support" element={<SupportLandingPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/profile" element={<ProfileLayout />}>
              <Route index element={<Navigate to="orders" replace />} />
              <Route path="orders" element={<ProfileOrders />} />
              <Route
                path="orders/:orderId/track"
                element={<ProfileOrderTrack />}
              />
              <Route
                path="orders/:orderId/review"
                element={<ProfileOrderReview />}
              />
              <Route
                path="orders/:orderId/return"
                element={<ProfileOrderReturn />}
              />
              <Route path="favorites" element={<ProfileFavorites />} />
              <Route
                path="browsing-history"
                element={<ProfileBrowsingHistory />}
              />
              <Route path="coupons" element={<ProfileCoupons />} />
              <Route path="chat" element={<ProfileChat />} />
              <Route path="feedback" element={<ProfileFeedback />} />
              <Route path="addresses" element={<ProfileAddresses />} />
              <Route path="addresses/new" element={<ProfileAddresses />} />
              <Route
                path="addresses/:addressId/edit"
                element={<ProfileAddresses />}
              />
              <Route path="cards" element={<ProfileCards />} />
              <Route path="cards/new" element={<ProfileCards />} />
              <Route path="cards/:cardId/edit" element={<ProfileCards />} />
              <Route path="personal-info" element={<ProfilePersonalInfo />} />
              <Route path="support" element={<ProfileSupport />} />
            </Route>
            <Route path="/components" element={<ComponentsDemo />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
      {showAuthModal && <AuthModal />}
    </>
  );
};

/**
 * Корневой компонент приложения: дерево провайдеров, роутер и сброс scroll-lock при монтировании.
 */
function App() {
  useEffect(() => {
    resetScrollLock();
  }, []);

  return (
    <AuthProvider>
      <CatalogProvider>
        <CartProvider>
          <FavoritesProvider>
            <BrowsingHistoryProvider>
              <UserDataProvider>
                <Router>
                  <ScrollToTop />
                  <div className="app">
                    <AppRoutes />
                  </div>
                </Router>
              </UserDataProvider>
            </BrowsingHistoryProvider>
          </FavoritesProvider>
        </CartProvider>
      </CatalogProvider>
    </AuthProvider>
  );
}

export default App;

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
import "./App.scss";

const Catalog = lazy(() => import("./pages/Catalog/Catalog"));
const ProductDetail = lazy(() => import("./pages/ProductDetail/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart/Cart"));
const Checkout = lazy(() => import("./pages/Checkout/Checkout"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess/OrderSuccess"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));
const ProfileLayout = lazy(() => import("./layouts/ProfileLayout"));
const ProfileOrders = lazy(() => import("./pages/Profile/ProfileOrders"));
const ProfileOrderTrack = lazy(
  () => import("./pages/Profile/ProfileOrderTrack"),
);
const ProfileOrderReview = lazy(
  () => import("./pages/Profile/ProfileOrderReview"),
);
const ProfileOrderReturn = lazy(
  () => import("./pages/Profile/ProfileOrderReturn"),
);
const ProfileFavorites = lazy(() => import("./pages/Profile/ProfileFavorites"));
const ProfileBrowsingHistory = lazy(
  () => import("./pages/Profile/ProfileBrowsingHistory"),
);
const ProfileCoupons = lazy(() => import("./pages/Profile/ProfileCoupons"));
const ProfileChat = lazy(() => import("./pages/Profile/ProfileChat"));
const ProfileFeedback = lazy(() => import("./pages/Profile/ProfileFeedback"));
const ProfileAddresses = lazy(() => import("./pages/Profile/ProfileAddresses"));
const ProfileCards = lazy(() => import("./pages/Profile/ProfileCards"));
const ProfilePersonalInfo = lazy(
  () => import("./pages/Profile/ProfilePersonalInfo"),
);
const ProfileSupport = lazy(() => import("./pages/Profile/ProfileSupport"));
const DiscountsPage = lazy(() => import("./pages/Discounts/DiscountsPage"));
const TopProductsPage = lazy(
  () => import("./pages/TopProducts/TopProductsPage"),
);
const CategoriesPage = lazy(() => import("./pages/Categories/CategoriesPage"));
const CategoryListingPage = lazy(
  () => import("./pages/Categories/CategoryListingPage"),
);
const SearchPage = lazy(() => import("./pages/Search/SearchPage"));
const ComponentsDemo = lazy(
  () => import("./pages/ComponentsDemo/ComponentsDemo"),
);

const AboutPage = lazy(() =>
  import("./pages/Info/InfoPages").then((module) => ({
    default: module.AboutPage,
  })),
);
const BlogPage = lazy(() =>
  import("./pages/Info/InfoPages").then((module) => ({
    default: module.BlogPage,
  })),
);
const CalendarPage = lazy(() =>
  import("./pages/Info/InfoPages").then((module) => ({
    default: module.CalendarPage,
  })),
);
const SellPage = lazy(() =>
  import("./pages/Info/InfoPages").then((module) => ({
    default: module.SellPage,
  })),
);
const SupportLandingPage = lazy(() =>
  import("./pages/Info/InfoPages").then((module) => ({
    default: module.SupportLandingPage,
  })),
);

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

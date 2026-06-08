import { useEffect } from "react";
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

import Home from "./pages/Home/Home";

import Catalog from "./pages/Catalog/Catalog";

import ProductDetail from "./pages/ProductDetail/ProductDetail";

import Cart from "./pages/Cart/Cart";

import Checkout from "./pages/Checkout/Checkout";

import OrderSuccess from "./pages/OrderSuccess/OrderSuccess";
import NotFound from "./pages/NotFound/NotFound";

import ProfileLayout from "./layouts/ProfileLayout";

import ProfileOrders from "./pages/Profile/ProfileOrders";

import ProfileOrderTrack from "./pages/Profile/ProfileOrderTrack";

import ProfileOrderReview from "./pages/Profile/ProfileOrderReview";

import ProfileOrderReturn from "./pages/Profile/ProfileOrderReturn";

import ProfileFavorites from "./pages/Profile/ProfileFavorites";

import ProfileBrowsingHistory from "./pages/Profile/ProfileBrowsingHistory";

import ProfileCoupons from "./pages/Profile/ProfileCoupons";

import ProfileChat from "./pages/Profile/ProfileChat";

import ProfileFeedback from "./pages/Profile/ProfileFeedback";

import ProfileAddresses from "./pages/Profile/ProfileAddresses";

import ProfileCards from "./pages/Profile/ProfileCards";

import ProfilePersonalInfo from "./pages/Profile/ProfilePersonalInfo";

import ProfileSupport from "./pages/Profile/ProfileSupport";

import DiscountsPage from "./pages/Discounts/DiscountsPage";

import TopProductsPage from "./pages/TopProducts/TopProductsPage";

import CategoriesPage from "./pages/Categories/CategoriesPage";

import CategoryListingPage from "./pages/Categories/CategoryListingPage";

import SearchPage from "./pages/Search/SearchPage";

import {
  AboutPage,
  BlogPage,
  CalendarPage,
  SellPage,
  SupportLandingPage,
} from "./pages/Info/InfoPages";

import ComponentsDemo from "./pages/ComponentsDemo/ComponentsDemo";

import { isAuthPath } from "./constants/authRoutes";

import "./App.scss";

const AppRoutes = () => {
  const location = useLocation();

  const backgroundLocation = location.state?.backgroundLocation;

  const mainLocation =
    backgroundLocation ||
    (isAuthPath(location.pathname) ? { ...location, pathname: "/" } : location);

  const showAuthModal = isAuthPath(location.pathname);

  return (
    <>
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

      {showAuthModal && <AuthModal />}
    </>
  );
};

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

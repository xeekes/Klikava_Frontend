import { Navigate, Route, Routes } from "react-router-dom";
import RequireRole from "./components/RequireRole/RequireRole";
import AdminLayout from "./layouts/AdminLayout/AdminLayout";
import AddProductPage from "./pages/AddProduct/AddProductPage";
import LoginPage from "./pages/Login/LoginPage";
import OrdersPage from "./pages/Orders/OrdersPage";
import ProductsPage from "./pages/Products/ProductsPage";
import RegisterPage from "./pages/Register/RegisterPage";
import SellerDashboardPage from "./pages/SellerDashboard/SellerDashboardPage";
import SellerProfilePage from "./pages/SellerProfile/SellerProfilePage";
import SellerSettingsPage from "./pages/SellerSettings/SellerSettingsPage";
import SellerStatisticsPage from "./pages/SellerStatistics/SellerStatisticsPage";
import { ADMIN_ROUTES, SELLER_ROUTES } from "./constants/routes";
import { AUTH_PORTALS, USER_ROLES } from "./constants/roles";

const App = () => {
  return (
    <Routes>
      <Route
        path={ADMIN_ROUTES.login}
        element={<LoginPage portal={AUTH_PORTALS.ADMIN} />}
      />
      <Route
        path={ADMIN_ROUTES.register}
        element={<RegisterPage portal={AUTH_PORTALS.ADMIN} />}
      />
      <Route
        path={SELLER_ROUTES.login}
        element={<LoginPage portal={AUTH_PORTALS.SELLER} />}
      />
      <Route
        path={SELLER_ROUTES.register}
        element={<RegisterPage portal={AUTH_PORTALS.SELLER} />}
      />

      <Route
        element={
          <RequireRole role={USER_ROLES.ADMIN}>
            <AdminLayout />
          </RequireRole>
        }
      >
        <Route
          index
          element={<Navigate to={ADMIN_ROUTES.products} replace />}
        />
        <Route path={ADMIN_ROUTES.products} element={<ProductsPage />} />
        <Route path={ADMIN_ROUTES.addProduct} element={<AddProductPage />} />
        <Route path={ADMIN_ROUTES.orders} element={<OrdersPage />} />
      </Route>

      <Route
        path="/seller"
        element={
          <RequireRole role={USER_ROLES.SELLER}>
            <AdminLayout />
          </RequireRole>
        }
      >
        <Route
          index
          element={<Navigate to={SELLER_ROUTES.products} replace />}
        />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/add" element={<AddProductPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="dashboard" element={<SellerDashboardPage />} />
        <Route path="profile" element={<SellerProfilePage />} />
        <Route path="settings" element={<SellerSettingsPage />} />
        <Route path="statistics" element={<SellerStatisticsPage />} />
        <Route
          path="*"
          element={<Navigate to={SELLER_ROUTES.products} replace />}
        />
      </Route>

      <Route path="*" element={<Navigate to={ADMIN_ROUTES.login} replace />} />
    </Routes>
  );
};

export default App;

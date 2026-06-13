/*
 * Защита маршрута для /profile/* — гостей перенаправляет в корзину (точка входа в оформление)
 * с сохранением `from` для возможного редиректа после входа.
 */
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Защита маршрута, перенаправляющая гостей в корзину с сохранением пути возврата.
 */
const RequireAuth = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) {
    return null;
  }
  if (!isAuthenticated) {
    return <Navigate to="/cart" replace state={{ from: location.pathname }} />;
  }
  return children;
};

export default RequireAuth;

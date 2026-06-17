/*
 * Route protection for /profile/* - guests are redirected to the cart (entry point to checkout)
 * with saving `from` for possible redirect after login.
 */
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Route protection that redirects guests to the cart while preserving the return path.
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

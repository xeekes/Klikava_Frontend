import { Navigate, useLocation } from "react-router-dom";
import { getLoginRouteForRole } from "../../constants/routes";
import { useAdminAuth } from "../../context/AdminAuthContext";

const RequireRole = ({ role, children }) => {
  const { isAuthenticated, isLoading, user } = useAdminAuth();
  const location = useLocation();
  const loginPath = getLoginRouteForRole(role);

  if (isLoading) {
    return (
      <div className="admin-loading-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate to={loginPath} state={{ from: location }} replace />
    );
  }

  if (user.role !== role) {
    return (
      <Navigate
        to={loginPath}
        state={{ portalSwitch: true, from: location }}
        replace
      />
    );
  }

  return children;
};

export default RequireRole;

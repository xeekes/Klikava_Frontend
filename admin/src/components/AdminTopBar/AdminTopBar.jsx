import { useLocation, useNavigate } from "react-router-dom";
import { getLoginRouteForRole, isSellerAccountSection } from "../../constants/routes";
import { USER_ROLES } from "../../constants/roles";
import PortalBadge from "../PortalBadge/PortalBadge";
import { useAdminAuth } from "../../context/AdminAuthContext";
import "./AdminTopBar.scss";

const AdminTopBar = ({ onMenuClick, profilePath = null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAdminAuth();

  const hideSearch =
    user?.role === USER_ROLES.SELLER &&
    isSellerAccountSection(location.pathname);

  const handleProfileClick = () => {
    if (profilePath) {
      navigate(profilePath);
      return;
    }

    const loginPath = getLoginRouteForRole(user?.role);
    logout();
    navigate(loginPath, { replace: true });
  };

  return (
    <header className="admin-top-bar">
      <button
        type="button"
        className="admin-top-bar__menu"
        aria-label="Open menu"
        onClick={onMenuClick}
      >
        ☰
      </button>

      <PortalBadge role={user?.role} variant="topbar" />

      {hideSearch ? (
        <div className="admin-top-bar__spacer" aria-hidden="true" />
      ) : (
        <label className="dash-search admin-top-bar__search">
          <span className="dash-search__icon" aria-hidden="true">
            ⌕
          </span>
          <input type="search" placeholder="Global search..." />
        </label>
      )}

      <button
        type="button"
        className="admin-top-bar__profile"
        onClick={handleProfileClick}
        aria-label={profilePath ? "My profile" : "Log out"}
        title={profilePath ? "My profile" : "Log out"}
      >
        <span aria-hidden="true">👤</span>
      </button>
    </header>
  );
};

export default AdminTopBar;

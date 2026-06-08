import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import AdminBrand from "../../components/AdminBrand/AdminBrand";
import AdminTopBar from "../../components/AdminTopBar/AdminTopBar";
import PortalBadge from "../../components/PortalBadge/PortalBadge";
import {
  getLoginRouteForRole,
  getNavItemsForRole,
  SELLER_ROUTES,
} from "../../constants/routes";
import { USER_ROLES } from "../../constants/roles";
import { useAdminAuth } from "../../context/AdminAuthContext";
import "./AdminLayout.scss";

const AdminLayout = () => {
  const { user, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navItems = getNavItemsForRole(user?.role, location.pathname);
  const isSeller = user?.role === USER_ROLES.SELLER;

  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = () => {
    const loginPath = getLoginRouteForRole(user?.role);
    logout();
    navigate(loginPath, { replace: true });
  };

  const layoutRoleClass = isSeller
    ? "admin-layout--seller"
    : "admin-layout--admin";

  return (
    <div
      className={`admin-layout ${layoutRoleClass} ${isSidebarOpen ? "admin-layout--sidebar-open" : ""}`.trim()}
    >
      <button
        type="button"
        className="admin-layout__backdrop"
        aria-label="Close menu"
        onClick={closeSidebar}
      />

      <aside className="admin-layout__sidebar">
        <div className="admin-layout__brand">
          <AdminBrand />
          <PortalBadge role={user?.role} variant="sidebar" />
        </div>

        <nav className="admin-layout__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `admin-layout__nav-link ${isActive ? "admin-layout__nav-link--active" : ""}`.trim()
              }
              onClick={closeSidebar}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="admin-layout__logout"
          onClick={handleLogout}
        >
          Log out
        </button>
      </aside>

      <div className="admin-layout__main">
        <AdminTopBar
          onMenuClick={() => setIsSidebarOpen(true)}
          profilePath={isSeller ? SELLER_ROUTES.profile : null}
        />

        <main className="admin-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

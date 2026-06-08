import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { PROFILE_NAV_ITEMS } from "../../../constants/profile";
import { useAuth } from "../../../context/AuthContext";
import "./ProfileSidebar.scss";

const ProfileSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isActivePath = (path) => {
    if (path === "/profile/orders") {
      return location.pathname.startsWith("/profile/orders");
    }
    if (path === "/profile/addresses") {
      return location.pathname.startsWith("/profile/addresses");
    }
    if (path === "/profile/cards") {
      return location.pathname.startsWith("/profile/cards");
    }
    return location.pathname === path;
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <aside className="profile-sidebar">
      <nav className="profile-sidebar__nav">
        {PROFILE_NAV_ITEMS.map((item) => {
          if (item.type === "divider") {
            return <div key={item.id} className="profile-sidebar__divider" />;
          }

          if (item.type === "logout") {
            return (
              <button
                key={item.id}
                type="button"
                className="profile-sidebar__link profile-sidebar__link--logout"
                onClick={handleLogout}
              >
                {item.label}
              </button>
            );
          }

          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={`profile-sidebar__link ${
                isActivePath(item.path) ? "profile-sidebar__link--active" : ""
              }`.trim()}
            >
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default ProfileSidebar;

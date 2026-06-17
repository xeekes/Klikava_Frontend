/* Profile section layout: sidebar + secure outlet (RequireAuth redirects guests). */
import { Outlet } from "react-router-dom";
import ProfileSidebar from "../components/Profile/ProfileSidebar/ProfileSidebar";
import RequireAuth from "../components/Profile/RequireAuth";
import "./ProfileLayout.scss";
/**
 * Profile section shell with side navigation and nested routes under authorization protection.
 */
const ProfileLayout = () => (
  <RequireAuth>
    <div className="profile-layout">
      <div className="container">
        <div className="profile-layout__grid">
          <ProfileSidebar />
          <div className="profile-layout__content">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  </RequireAuth>
);
export default ProfileLayout;

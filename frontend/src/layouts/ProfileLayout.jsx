/* Макет раздела профиля: боковая панель + защищённый outlet (RequireAuth перенаправляет гостей). */
import { Outlet } from "react-router-dom";
import ProfileSidebar from "../components/Profile/ProfileSidebar/ProfileSidebar";
import RequireAuth from "../components/Profile/RequireAuth";
import "./ProfileLayout.scss";
/**
 * Оболочка раздела профиля с боковой навигацией и вложенными маршрутами под защитой авторизации.
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

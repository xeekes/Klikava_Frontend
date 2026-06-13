/* Анимированная обёртка Outlet для переходов между маршрутами. */
import { useLocation, useOutlet } from "react-router-dom";
import { isAuthPath } from "../../constants/authRoutes";
import "./PageTransition.scss";

/**
 * Анимированная обёртка Outlet, перемонтирующая маршруты при смене pathname.
 */
const PageTransition = () => {
  const location = useLocation();
  const outlet = useOutlet();
  /* Маршруты оверлея авторизации не должны перемонтировать фоновую страницу через смену key. */
  if (isAuthPath(location.pathname)) {
    return outlet;
  }
  return (
    <div key={location.pathname} className="page-transition">
      {outlet}
    </div>
  );
};

export default PageTransition;

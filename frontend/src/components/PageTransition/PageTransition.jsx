/* Animated Outlet wrapper for transitions between routes. */
import { useLocation, useOutlet } from "react-router-dom";
import { isAuthPath } from "../../constants/authRoutes";
import { useDefaultPageMeta } from "../../hooks/usePageMeta";
import "./PageTransition.scss";

/**
 * Animated Outlet wrapper that remounts routes when the pathname is changed.
 */
const PageTransition = () => {
  const location = useLocation();
  const outlet = useOutlet();
  useDefaultPageMeta();
  /* Authorization overlay routes should not remount the background page via key change. */
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

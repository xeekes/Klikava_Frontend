/* Resets scroll position when changing route. */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { isAuthPath } from "../../constants/authRoutes";

/**
 * Resets scroll position when changing route, skipping authorization overlay paths.
 */
const ScrollToTop = () => {
  const location = useLocation();
  useEffect(() => {
    if (isAuthPath(location.pathname)) {
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname, location.key]);
  return null;
};

export default ScrollToTop;

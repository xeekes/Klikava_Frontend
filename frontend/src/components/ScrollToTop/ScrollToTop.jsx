import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { isAuthPath } from "../../constants/authRoutes";

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

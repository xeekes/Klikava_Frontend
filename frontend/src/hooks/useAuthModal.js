import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isAuthPath } from "../constants/authRoutes";

export const useAuthModal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation;

  const openAuth = useCallback(
    (path, options = {}) => {
      const background = backgroundLocation || location;

      navigate(path, {
        ...options,
        state: {
          ...options.state,
          backgroundLocation: background,
        },
      });
    },
    [backgroundLocation, location, navigate]
  );

  const closeAuth = useCallback(() => {
    if (backgroundLocation) {
      navigate(
        {
          pathname: backgroundLocation.pathname,
          search: backgroundLocation.search || "",
          hash: backgroundLocation.hash || "",
        },
        { replace: true }
      );
      return;
    }

    if (isAuthPath(location.pathname)) {
      navigate("/", { replace: true });
    }
  }, [backgroundLocation, location.pathname, navigate]);

  return {
    openAuth,
    closeAuth,
    backgroundLocation,
    isModalOpen: isAuthPath(location.pathname),
  };
};

/*
 * Routing the authorization modal window: opens /login, etc. like overlay routes,
 * keeping the backgroundLocation so that the base page remains mounted underneath it.
 */
import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isAuthPath } from "../constants/authRoutes";

/**
 * Manages authorization overlay routes and saving background location.
 * @returns {object}
 */
export const useAuthModal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation;

  /**
   * Goes to the auth path, saving the current page as the background.
   * @param {string} path
   * @param {object} [options]
   */
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
    [backgroundLocation, location, navigate],
  );

  /**
   * Returns to the background route or to the main route if the background is not saved.
   */
  const closeAuth = useCallback(() => {
    if (backgroundLocation) {
      navigate(
        {
          pathname: backgroundLocation.pathname,
          search: backgroundLocation.search || "",
          hash: backgroundLocation.hash || "",
        },
        { replace: true },
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

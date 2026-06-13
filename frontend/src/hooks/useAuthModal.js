/*
 * Маршрутизация модального окна авторизации: открывает /login и т.п. как оверлей-маршруты,
 * сохраняя backgroundLocation, чтобы базовая страница оставалась смонтированной под ним.
 */
import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isAuthPath } from "../constants/authRoutes";

/**
 * Управляет оверлей-маршрутами авторизации и сохранением background location.
 * @returns {object}
 */
export const useAuthModal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation;

  /**
   * Переходит на auth-путь, сохраняя текущую страницу как фон.
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
   * Возвращается к фоновому маршруту или на главную, если фон не сохранён.
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

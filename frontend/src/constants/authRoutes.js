/* Маршруты, отображаемые в оверлее AuthModal вместо полноэкранной навигации. */

/** Пути, открывающие модальное окно авторизации вместо отдельной страницы. */
export const AUTH_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/auth/verify",
  "/auth/password",
  "/auth/reset-password",
];

/**
 * Возвращает true, если pathname совпадает с зарегистрированным маршрутом оверлея авторизации.
 * @param {string} pathname
 * @returns {boolean}
 */
export const isAuthPath = (pathname) =>
  AUTH_PATHS.some((path) => pathname === path);

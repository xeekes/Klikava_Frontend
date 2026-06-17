/* Routes displayed in AuthModal overlay instead of full screen navigation. */

/** Paths that open a modal login window instead of a separate page. */
export const AUTH_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/auth/verify",
  "/auth/password",
  "/auth/reset-password",
];

/**
 * Returns true if pathname matches the registered authorization overlay route.
 * @param {string} pathname
 * @returns {boolean}
 */
export const isAuthPath = (pathname) =>
  AUTH_PATHS.some((path) => pathname === path);

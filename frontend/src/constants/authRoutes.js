export const AUTH_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/auth/verify",
  "/auth/password",
  "/auth/reset-password",
];

export const isAuthPath = (pathname) =>
  AUTH_PATHS.some((path) => pathname === path);

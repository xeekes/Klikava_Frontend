import { USER_ROLES } from "./roles";

export const ADMIN_ROUTES = {
  login: "/login",
  register: "/register",
  products: "/products",
  addProduct: "/products/add",
  orders: "/orders",
};

export const SELLER_ROUTES = {
  login: "/seller/login",
  register: "/seller/register",
  products: "/seller/products",
  addProduct: "/seller/products/add",
  orders: "/seller/orders",
  dashboard: "/seller/dashboard",
  profile: "/seller/profile",
  settings: "/seller/settings",
  statistics: "/seller/statistics",
};

const SELLER_ACCOUNT_PATHS = [
  SELLER_ROUTES.dashboard,
  SELLER_ROUTES.profile,
  SELLER_ROUTES.settings,
  SELLER_ROUTES.statistics,
];

export const SELLER_SHOP_NAV = [
  { to: SELLER_ROUTES.products, label: "All products", end: true },
  { to: SELLER_ROUTES.addProduct, label: "Add products" },
  { to: SELLER_ROUTES.orders, label: "Orders" },
];

export const SELLER_ACCOUNT_NAV = [
  { to: SELLER_ROUTES.profile, label: "My profile", end: true },
  { to: SELLER_ROUTES.settings, label: "Account settings" },
  { to: SELLER_ROUTES.statistics, label: "Statistics" },
  { to: SELLER_ROUTES.dashboard, label: "Dashboard" },
];

export const getRoutesForRole = (role) =>
  role === USER_ROLES.SELLER ? SELLER_ROUTES : ADMIN_ROUTES;

export const getLoginRouteForRole = (role) => getRoutesForRole(role).login;

export const isSellerAccountSection = (pathname) =>
  SELLER_ACCOUNT_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

export const getNavItemsForRole = (role, pathname = "") => {
  if (role === USER_ROLES.SELLER) {
    return isSellerAccountSection(pathname)
      ? SELLER_ACCOUNT_NAV
      : SELLER_SHOP_NAV;
  }

  const routes = ADMIN_ROUTES;

  return [
    { to: routes.products, label: "All products", end: true },
    { to: routes.addProduct, label: "Add products" },
    { to: routes.orders, label: "Orders" },
  ];
};

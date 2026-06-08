export const PANEL_ENDPOINTS = {
  auth: {
    adminLogin: "/admin/auth/login",
    sellerLogin: "/seller/auth/login",
    sellerRegister: "/seller/auth/register",
    me: "/panel/auth/me",
    logout: "/panel/auth/logout",
  },
  products: {
    list: "/panel/products",
    one: (id) => `/panel/products/${id}`,
    bulkDelete: "/panel/products",
  },
  orders: {
    list: "/panel/orders",
    one: (id) => `/panel/orders/${id}`,
    bulkDelete: "/panel/orders",
  },
  seller: {
    profile: "/panel/seller/profile",
    settings: "/panel/seller/settings",
    stats: "/panel/seller/stats",
    dashboard: "/panel/seller/dashboard",
    account: "/panel/seller/account",
  },
};

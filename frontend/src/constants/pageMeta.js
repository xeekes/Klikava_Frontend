import { SITE_DESCRIPTION, SITE_NAME } from "./site";

/** @typedef {{ title?: string, description?: string, robots?: string }} PageMeta */

/** @type {Record<string, PageMeta>} */
export const PAGE_META_BY_PATH = {
  "/": {
    title: "",
    description: SITE_DESCRIPTION,
  },
  "/catalog": {
    title: "Catalog",
    description: "Browse the full KlikAVA product catalog.",
  },
  "/search": {
    title: "Search",
    description: "Search products across KlikAVA.",
  },
  "/discounts": {
    title: "Discounts",
    description: "Limited-time deals and discounted products on KlikAVA.",
  },
  "/top-products": {
    title: "Top Products",
    description: "Popular and trending products on KlikAVA.",
  },
  "/categories": {
    title: "Categories",
    description: "Explore product categories on KlikAVA.",
  },
  "/cart": {
    title: "Basket",
    description: "Review items in your KlikAVA basket.",
  },
  "/checkout": {
    title: "Checkout",
    description: "Complete your KlikAVA order.",
    robots: "noindex, nofollow",
  },
  "/order-success": {
    title: "Order Confirmed",
    description: "Your KlikAVA order has been placed.",
    robots: "noindex, nofollow",
  },
  "/about": {
    title: "About Us",
    description: "Learn more about KlikAVA marketplace.",
  },
  "/sell": {
    title: "Sell on KlikAVA",
    description: "Start selling your products on KlikAVA.",
  },
  "/blog": {
    title: "Seller Blog",
    description: "Tips and guides for KlikAVA sellers.",
  },
  "/support": {
    title: "Support",
    description: "Get help with orders, payments, and delivery on KlikAVA.",
  },
  "/calendar": {
    title: "Sales Calendar",
    description: "Upcoming sales events on KlikAVA.",
  },
  "/profile/orders": {
    title: "My Orders",
    description: "Track and manage your KlikAVA orders.",
    robots: "noindex, nofollow",
  },
  "/profile/favorites": {
    title: "Favorites",
    description: "Your saved products on KlikAVA.",
    robots: "noindex, nofollow",
  },
  "/profile/browsing-history": {
    title: "Browsing History",
    description: "Recently viewed products on KlikAVA.",
    robots: "noindex, nofollow",
  },
  "/profile/coupons": {
    title: "Coupons",
    description: "Your coupons on KlikAVA.",
    robots: "noindex, nofollow",
  },
  "/profile/chat": {
    title: "Chat",
    description: "Messages and support chat on KlikAVA.",
    robots: "noindex, nofollow",
  },
  "/profile/feedback": {
    title: "Your Feedback",
    description: "Share feedback about your KlikAVA experience.",
    robots: "noindex, nofollow",
  },
  "/profile/addresses": {
    title: "Delivery Addresses",
    description: "Manage delivery addresses on KlikAVA.",
    robots: "noindex, nofollow",
  },
  "/profile/cards": {
    title: "Saved Cards",
    description: "Manage payment cards on KlikAVA.",
    robots: "noindex, nofollow",
  },
  "/profile/personal-info": {
    title: "Personal Info",
    description: "Update your KlikAVA account details.",
    robots: "noindex, nofollow",
  },
  "/profile/support": {
    title: "Profile Support",
    description: "Contact KlikAVA support from your profile.",
    robots: "noindex, nofollow",
  },
  "/components": {
    title: "UI Components",
    description: "Internal UI component showcase.",
    robots: "noindex, nofollow",
  },
};

/**
 * @param {string} pathname
 * @returns {PageMeta}
 */
export const resolvePageMeta = (pathname) => {
  if (PAGE_META_BY_PATH[pathname]) {
    return PAGE_META_BY_PATH[pathname];
  }

  if (pathname.startsWith("/product/")) {
    return {
      title: "Product",
      description: `View product details on ${SITE_NAME}.`,
    };
  }

  if (pathname.startsWith("/categories/")) {
    return {
      title: "Category",
      description: `Browse category products on ${SITE_NAME}.`,
    };
  }

  if (pathname.startsWith("/profile/orders/") && pathname.endsWith("/track")) {
    return {
      title: "Track Order",
      description: `Track your ${SITE_NAME} order.`,
      robots: "noindex, nofollow",
    };
  }

  if (pathname.startsWith("/profile/orders/") && pathname.endsWith("/review")) {
    return {
      title: "Review Order",
      description: `Leave a review for your ${SITE_NAME} order.`,
      robots: "noindex, nofollow",
    };
  }

  if (pathname.startsWith("/profile/orders/") && pathname.endsWith("/return")) {
    return {
      title: "Return Order",
      description: `Request a return for your ${SITE_NAME} order.`,
      robots: "noindex, nofollow",
    };
  }

  if (pathname.startsWith("/profile/addresses/")) {
    return {
      title: "Delivery Address",
      description: `Manage a delivery address on ${SITE_NAME}.`,
      robots: "noindex, nofollow",
    };
  }

  if (pathname.startsWith("/profile/cards/")) {
    return {
      title: "Payment Card",
      description: `Manage a payment card on ${SITE_NAME}.`,
      robots: "noindex, nofollow",
    };
  }

  return {
    title: "Page Not Found",
    description: `The requested page could not be found on ${SITE_NAME}.`,
    robots: "noindex, nofollow",
  };
};

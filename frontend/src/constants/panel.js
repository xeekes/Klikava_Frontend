const SELLER_PANEL_BASE_URL =
  import.meta.env.VITE_SELLER_PANEL_URL || "http://localhost:3001/seller/login";

export const getSellerPanelLoginUrl = (email) => {
  try {
    const url = new URL(SELLER_PANEL_BASE_URL);
    url.searchParams.set("from", "storefront");

    if (email) {
      url.searchParams.set("email", email);
    }

    return url.toString();
  } catch {
    const params = new URLSearchParams({ from: "storefront" });

    if (email) {
      params.set("email", email);
    }

    const separator = SELLER_PANEL_BASE_URL.includes("?") ? "&" : "?";
    return `${SELLER_PANEL_BASE_URL}${separator}${params.toString()}`;
  }
};

export const SELLER_PANEL_LOGIN_URL = SELLER_PANEL_BASE_URL;

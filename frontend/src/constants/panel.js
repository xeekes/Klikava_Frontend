/* Ссылка на панель продавца (отдельное приложение, не часть этого SPA). */

/** Базовый URL страницы входа во внешнюю панель продавца (из env или localhost по умолчанию). */
const SELLER_PANEL_BASE_URL =
  import.meta.env.VITE_SELLER_PANEL_URL || "http://localhost:3001/seller/login";

/**
 * Формирует URL входа в панель продавца с origin витрины и опциональной подстановкой email.
 * @param {string} [email]
 * @returns {string}
 */
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

/** URL входа в панель продавца по умолчанию без query-параметров. */
export const SELLER_PANEL_LOGIN_URL = SELLER_PANEL_BASE_URL;

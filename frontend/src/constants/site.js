/** Бренд и дефолтные SEO-значения витрины. */
export const SITE_NAME = "KlikAVA";
export const SITE_TAGLINE = "Online Marketplace";
export const SITE_DESCRIPTION =
  "Shop affordable products, discover top deals, and manage orders on KlikAVA — a modern online marketplace.";
export const SITE_LOCALE = "en_US";
export const SITE_THEME_COLOR = "#2E2E2E";

/**
 * @param {string} [pageTitle]
 * @returns {string}
 */
export const buildDocumentTitle = (pageTitle) => {
  if (!pageTitle) {
    return `${SITE_NAME} — ${SITE_TAGLINE}`;
  }
  return `${pageTitle} | ${SITE_NAME}`;
};

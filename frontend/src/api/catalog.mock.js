/*
 * Mock catalog API for local development without VITE_API_BASE_URL.
 * Loaded via dynamic import so production bundles can exclude this module.
 */

/** Mock catalog HTTP methods with empty payloads. */
export const mockCatalogApi = {
  listCategories: async () => [],
  listFeatures: async () => [],
  listProductsPage: async () => ({ items: [], pagination: null }),
  listPopularProductIds: async () => new Set(),
  listAllProducts: async () => [],
  searchProducts: async () => [],
  getProductByIdOrSlug: async () => null,
  listDiscounts: async () => [],
  listAllDiscounts: async () => [],
  listProductReviews: async () => [],
  createReview: async () => null,
  updateReview: async () => null,
  deleteReview: async () => ({ success: true }),
};

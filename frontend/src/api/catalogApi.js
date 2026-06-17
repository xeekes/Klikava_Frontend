/*
 * Catalog HTTP client: categories, products, discounts, reviews.
 * Raw responses are converted into UI models via mapCatalogItem helpers.
 * Mock HTTP methods are loaded dynamically when VITE_API_BASE_URL is empty.
 */
import { apiRequest } from "./client";
import { createLazyMockApi } from "./createLazyMockApi";
import { getListItems } from "./listUtils";
import {
  mapBackendCategory,
  mapBackendProduct,
  mapBackendProductList,
  mapBackendReview,
  mapVariantFeaturesToSpecs,
} from "./mapCatalogItem";

/* Limiting client pagination when downloading a full catalog. */
const MAX_PRODUCT_PAGES = 20;

const realCatalogApi = {
  /**
   * Loads the category page and converts each entry into a UI model.
   * @param {{ page?: number, perPage?: number }} [params]
   * @returns {Promise<Array<object>>}
   */
  async listCategories({ page = 1, perPage = 100 } = {}) {
    const payload = await apiRequest(
      `/categories?per_page=${perPage}&page=${page}`,
    );
    return getListItems(payload).map(mapBackendCategory);
  },

  /**
   * Loads a reference book of characteristics for captions and filter order.
   * @param {{ page?: number, perPage?: number }} [params]
   * @returns {Promise<Array<{ id: string, title: string, isPrimary: boolean }>>}
   */
  async listFeatures({ page = 1, perPage = 100 } = {}) {
    const payload = await apiRequest(
      `/features?per_page=${perPage}&page=${page}`,
    );
    return getListItems(payload).map((item) => ({
      id: String(item.id),
      title: item.title || "Feature",
      isPrimary: Boolean(item.is_primary),
    }));
  },

  /**
   * Loads one page of raw products and server pagination metadata.
   * @param {{ page?: number, perPage?: number, q?: string|null, categoryId?: string|number|null, sortBy?: string|null, sortDir?: string|null, hasDiscount?: boolean|null }} [params]
   * @returns {Promise<{ items: Array<object>, pagination: object|null }>}
   */
  async listProductsPage({
    page = 1,
    perPage = 100,
    q = null,
    categoryId = null,
    sortBy = null,
    sortDir = null,
    hasDiscount = null,
  } = {}) {
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    });
    if (q) {
      params.set("q", q);
    }
    if (categoryId) {
      params.set("category_id", String(categoryId));
    }
    if (sortBy) {
      params.set("sort_by", sortBy);
    }
    if (sortDir) {
      params.set("sort_dir", sortDir);
    }
    if (hasDiscount !== null && hasDiscount !== undefined) {
      params.set("has_discount", String(hasDiscount));
    }
    const payload = await apiRequest(`/products?${params.toString()}`);
    return {
      items: getListItems(payload),
      pagination: payload?.pagination || null,
    };
  },

  /**
   * Loads the ids of popular products for the top/popular blocks.
   * @param {{ perPage?: number }} [params]
   * @returns {Promise<Set<string|number>>}
   */
  async listPopularProductIds({ perPage = 12 } = {}) {
    const { items } = await this.listProductsPage({
      page: 1,
      perPage,
      sortBy: "popularity",
      sortDir: "desc",
    });
    return new Set(
      items.map((item) => item?.id ?? item?.product_id).filter(Boolean),
    );
  },

  /**
   * Loads all product pages up to MAX_PRODUCT_PAGES, following pagination hints.
   * @returns {Promise<Array<object>>}
   */
  async listAllProducts() {
    const allItems = [];
    for (let page = 1; page <= MAX_PRODUCT_PAGES; page += 1) {
      const { items, pagination } = await this.listProductsPage({
        page,
        perPage: 100,
      });
      allItems.push(...items);
      if (!items.length) {
        break;
      }
      if (pagination && pagination.has_next === false) {
        break;
      }
      if (items.length < 100) {
        break;
      }
    }
    return allItems;
  },

  /**
   * Searches for products via GET /products?q=...
   * @param {string} query
   * @param {{ page?: number, perPage?: number, categoryId?: string|number|null, hasDiscount?: boolean|null }} [params]
   * @returns {Promise<Array<object>>}
   */
  async searchProducts(query, params = {}) {
    const { items } = await this.listProductsPage({
      q: query,
      ...params,
    });
    return items;
  },

  /**
   * Retrieves one product by numeric id or URL-slug (raw backend form).
   * @param {string|number} idOrSlug
   * @returns {Promise<object>}
   */
  async getProductByIdOrSlug(idOrSlug) {
    return apiRequest(`/products/${idOrSlug}`);
  },

  /**
   * Loads the discount rules page from the backend.
   * @param {{ page?: number, perPage?: number }} [params]
   * @returns {Promise<Array<object>>}
   */
  async listDiscounts({ page = 1, perPage = 100 } = {}) {
    const payload = await apiRequest(
      `/discounts?per_page=${perPage}&page=${page}`,
    );
    return getListItems(payload);
  },

  /**
   * Collects discount pages until a short or blank page is returned.
   * @returns {Promise<Array<object>>}
   */
  async listAllDiscounts() {
    const allItems = [];
    for (let page = 1; page <= MAX_PRODUCT_PAGES; page += 1) {
      const items = await this.listDiscounts({ page, perPage: 100 });
      allItems.push(...items);
      if (!items.length || items.length < 100) {
        break;
      }
    }
    return allItems;
  },

  /**
   * Loads and converts all reviews for the specified product id.
   * @param {string|number} productId
   * @returns {Promise<Array<object>>}
   */
  async listProductReviews(productId) {
    const payload = await apiRequest(`/products/${productId}/reviews`);
    return getListItems(payload).map(mapBackendReview);
  },

  /**
   * Submits a new review for the specified product.
   * @param {string|number} productId
   * @param {object} body
   * @returns {Promise<object>}
   */
  async createReview(productId, body) {
    const payload = await apiRequest(`/products/${productId}/reviews`, {
      method: "POST",
      body,
    });
    return mapBackendReview(payload);
  },

  /**
   * Updates the current user's review.
   * @param {string|number} productId
   * @param {string|number} reviewId
   * @param {object} body
   * @returns {Promise<object>}
   */
  async updateReview(productId, reviewId, body) {
    const payload = await apiRequest(
      `/products/${productId}/reviews/${reviewId}`,
      {
        method: "PATCH",
        body,
      },
    );
    return mapBackendReview(payload);
  },

  /**
   * Removes the current user's review.
   * @param {string|number} productId
   * @param {string|number} reviewId
   * @returns {Promise<unknown>}
   */
  async deleteReview(productId, reviewId) {
    return apiRequest(`/products/${productId}/reviews/${reviewId}`, {
      method: "DELETE",
    });
  },

  /**
   * Collects a complete product view from raw API data, categories and embedded reviews.
   * @param {object} raw
   * @param {Array<object>} [categories]
   * @param {number} [index]
   * @returns {object}
   */
  buildProductDetail(raw, categories = [], index = 0) {
    const lookup = this.buildCategoryLookup(categories);
    const mapped = mapBackendProduct(raw, index, lookup);
    const variant = raw?.current_version?.variants?.[0];
    const reviews = (raw?.reviews || []).map(mapBackendReview);
    const specs = mapVariantFeaturesToSpecs(variant);
    const description = raw?.current_version?.description || "";
    const deliveryInfo = raw?.current_version?.delivery_info || "";
    return {
      ...mapped,
      description,
      specs,
      reviews,
      variantId: variant?.id ?? null,
      sellerId: raw?.seller_id ?? null,
      averageRating: Number(raw?.average_rating) || 0,
      reviewsCount: Number(raw?.reviews_count) || reviews.length,
      shipping: {
        company: raw?.seller?.store_name || "Seller delivery",
        deliveryTime: deliveryInfo || "Standard delivery",
        costs: "Calculated at checkout",
        stats: [],
      },
      relatedFromApi: mapBackendProductList(
        raw?.similar_products || raw?.recommended_products || [],
        lookup,
      ),
    };
  },

  /**
   * Builds Map id of backend category → converted category for quick product search.
   * @param {Array<object>} categories
   * @returns {Map<number|string, object>}
   */
  buildCategoryLookup(categories) {
    return new Map(
      categories.map((category) => [category.backendId, category]),
    );
  },

  /**
   * Converts a list of raw products using the passed category lookup.
   * @param {Array<object>} items
   * @param {Array<object>} [categories]
   * @returns {Array<object>}
   */
  mapProducts(items, categories = []) {
    const lookup = this.buildCategoryLookup(categories);
    return mapBackendProductList(items, lookup);
  },

  /**
   * Converts one raw product record with optional category context and list index.
   * @param {object} item
   * @param {Array<object>} [categories]
   * @param {number} [index]
   * @returns {object}
   */
  mapProduct(item, categories = [], index = 0) {
    const lookup = this.buildCategoryLookup(categories);
    return mapBackendProduct(item, index, lookup);
  },
};

const CATALOG_HTTP_METHODS = [
  "listCategories",
  "listFeatures",
  "listProductsPage",
  "listPopularProductIds",
  "listAllProducts",
  "searchProducts",
  "getProductByIdOrSlug",
  "listDiscounts",
  "listAllDiscounts",
  "listProductReviews",
  "createReview",
  "updateReview",
  "deleteReview",
];

const catalogTransforms = {
  buildProductDetail: realCatalogApi.buildProductDetail.bind(realCatalogApi),
  buildCategoryLookup: realCatalogApi.buildCategoryLookup.bind(realCatalogApi),
  mapProducts: realCatalogApi.mapProducts.bind(realCatalogApi),
  mapProduct: realCatalogApi.mapProduct.bind(realCatalogApi),
};

/**
 * Catalog API facade: real backend with VITE_API_BASE_URL at build stage;
 * otherwise - lazy mock HTTP methods plus shared DTO mappers.
 */
export const catalogApi = import.meta.env.VITE_API_BASE_URL
  ? realCatalogApi
  : {
      ...catalogTransforms,
      ...createLazyMockApi(CATALOG_HTTP_METHODS, () =>
        import("./catalog.mock.js").then((module) => module.mockCatalogApi),
      ),
    };

import { apiRequest } from "./client";
import { getListItems } from "./listUtils";
import {
  mapBackendCategory,
  mapBackendProduct,
  mapBackendProductList,
  mapBackendReview,
  mapVariantFeaturesToSpecs,
} from "./mapCatalogItem";

const MAX_PRODUCT_PAGES = 20;

export const catalogApi = {
  async listCategories({ page = 1, perPage = 100 } = {}) {
    const payload = await apiRequest(
      `/categories?per_page=${perPage}&page=${page}`,
    );
    return getListItems(payload).map(mapBackendCategory);
  },

  async listProductsPage({ page = 1, perPage = 100 } = {}) {
    const payload = await apiRequest(
      `/products?per_page=${perPage}&page=${page}`,
    );
    return {
      items: getListItems(payload),
      pagination: payload?.pagination || null,
    };
  },

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

  async searchProducts(query, { page = 1, perPage = 100 } = {}) {
    const params = new URLSearchParams({
      q: query,
      page: String(page),
      per_page: String(perPage),
    });
    const payload = await apiRequest(`/products/search?${params.toString()}`);
    return getListItems(payload);
  },

  async getProductByIdOrSlug(idOrSlug) {
    return apiRequest(`/products/${idOrSlug}`);
  },

  async listDiscounts({ page = 1, perPage = 100 } = {}) {
    const payload = await apiRequest(
      `/discounts?per_page=${perPage}&page=${page}`,
    );
    return getListItems(payload);
  },

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

  async listProductReviews(productId) {
    const payload = await apiRequest(`/products/${productId}/reviews`);
    return getListItems(payload).map(mapBackendReview);
  },

  async createReview(productId, body) {
    return apiRequest(`/products/${productId}/reviews`, {
      method: "POST",
      body,
    });
  },

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

  buildCategoryLookup(categories) {
    return new Map(
      categories.map((category) => [category.backendId, category]),
    );
  },

  mapProducts(items, categories = []) {
    const lookup = this.buildCategoryLookup(categories);
    return mapBackendProductList(items, lookup);
  },

  mapProduct(item, categories = [], index = 0) {
    const lookup = this.buildCategoryLookup(categories);
    return mapBackendProduct(item, index, lookup);
  },
};

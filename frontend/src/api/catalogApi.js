import { apiRequest } from "./client";
import {
  mapBackendCategory,
  mapBackendProduct,
  mapBackendProductList,
} from "./mapCatalogItem";

const MAX_PRODUCT_PAGES = 20;

const getItems = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  return [];
};

export const catalogApi = {
  async listCategories({ page = 1, perPage = 100 } = {}) {
    const payload = await apiRequest(
      `/categories?per_page=${perPage}&page=${page}`,
    );
    return getItems(payload).map(mapBackendCategory);
  },

  async listProductsPage({ page = 1, perPage = 100 } = {}) {
    const payload = await apiRequest(
      `/products?per_page=${perPage}&page=${page}`,
    );
    return {
      items: getItems(payload),
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
    return getItems(payload);
  },

  async getProductByIdOrSlug(idOrSlug) {
    const payload = await apiRequest(`/products/${idOrSlug}`);
    return payload;
  },

  async listDiscounts({ page = 1, perPage = 100 } = {}) {
    const payload = await apiRequest(
      `/discounts?per_page=${perPage}&page=${page}`,
    );
    return getItems(payload);
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

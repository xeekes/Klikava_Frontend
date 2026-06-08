import { PANEL_ENDPOINTS } from "../constants/endpoints";
import { panelStore } from "../mocks/panelStore";
import { scopeBySeller } from "../utils/dataScope";
import { apiRequest, hasApiBaseUrl } from "./client";

const mockProductsApi = {
  async list(user, { search = "" } = {}) {
    const products = await panelStore.getProducts();
    const scoped = scopeBySeller(products, user);
    const normalized = search.trim().toLowerCase();

    if (!normalized) {
      return scoped;
    }

    return scoped.filter((product) =>
      product.name.toLowerCase().includes(normalized),
    );
  },

  async create(user, payload) {
    return panelStore.createProduct(payload, user?.sellerId);
  },

  async remove(user, ids) {
    const products = await panelStore.getProducts();
    const scoped = scopeBySeller(products, user);
    const allowedIds = new Set(scoped.map((item) => item.id));
    const safeIds = ids.filter((id) => allowedIds.has(id));
    return panelStore.deleteProducts(safeIds);
  },
};

const realProductsApi = {
  async list(_user, { search = "" } = {}) {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return apiRequest(`${PANEL_ENDPOINTS.products.list}${query}`);
  },

  async create(_user, payload) {
    return apiRequest(PANEL_ENDPOINTS.products.list, {
      method: "POST",
      body: payload,
    });
  },

  async remove(_user, ids) {
    return apiRequest(PANEL_ENDPOINTS.products.bulkDelete, {
      method: "DELETE",
      body: { ids },
    });
  },
};

export const productsApi = hasApiBaseUrl() ? realProductsApi : mockProductsApi;

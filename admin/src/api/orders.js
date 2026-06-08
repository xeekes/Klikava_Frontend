import { PANEL_ENDPOINTS } from "../constants/endpoints";
import { panelStore } from "../mocks/panelStore";
import { scopeBySeller } from "../utils/dataScope";
import { apiRequest, hasApiBaseUrl } from "./client";

const mockOrdersApi = {
  async list(user, { search = "" } = {}) {
    const orders = await panelStore.getOrders();
    const scoped = scopeBySeller(orders, user);
    const normalized = search.trim().toLowerCase();

    if (!normalized) {
      return scoped;
    }

    return scoped.filter(
      (order) =>
        order.sku.toLowerCase().includes(normalized) ||
        order.billing.toLowerCase().includes(normalized) ||
        order.status.toLowerCase().includes(normalized),
    );
  },

  async remove(user, ids) {
    const orders = await panelStore.getOrders();
    const scoped = scopeBySeller(orders, user);
    const allowedIds = new Set(scoped.map((item) => item.id));
    const safeIds = ids.filter((id) => allowedIds.has(id));
    return panelStore.deleteOrders(safeIds);
  },
};

const realOrdersApi = {
  async list(_user, { search = "" } = {}) {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return apiRequest(`${PANEL_ENDPOINTS.orders.list}${query}`);
  },

  async remove(_user, ids) {
    return apiRequest(PANEL_ENDPOINTS.orders.bulkDelete, {
      method: "DELETE",
      body: { ids },
    });
  },
};

export const ordersApi = hasApiBaseUrl() ? realOrdersApi : mockOrdersApi;

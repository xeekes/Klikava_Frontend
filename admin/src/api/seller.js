import { PANEL_ENDPOINTS } from "../constants/endpoints";
import { panelStore } from "../mocks/panelStore";
import { scopeBySeller } from "../utils/dataScope";
import { apiRequest, hasApiBaseUrl } from "./client";
import { MOCK_SELLER_STATS } from "../data/mockSellerProfile";

const mockSellerApi = {
  async getProfile(user) {
    return panelStore.getSellerProfile(user.sellerId);
  },

  async updateProfile(user, payload) {
    return panelStore.saveSellerProfile(user.sellerId, payload);
  },

  async getSettings(user) {
    return panelStore.getSellerSettings(user.sellerId);
  },

  async updateSettings(user, payload) {
    return panelStore.saveSellerSettings(user.sellerId, payload);
  },

  async getStats() {
    return panelStore.getSellerStats();
  },

  async getDashboard(user) {
    const [products, orders, stats] = await Promise.all([
      panelStore.getProducts(),
      panelStore.getOrders(),
      panelStore.getSellerStats(),
    ]);

    const scopedProducts = scopeBySeller(products, user);
    const scopedOrders = scopeBySeller(orders, user);

    return {
      productsCount: scopedProducts.length,
      ordersCount: scopedOrders.length,
      views: stats.views.total,
      purchased: stats.purchased.total,
    };
  },

  async deleteAccount() {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { success: true };
  },
};

const realSellerApi = {
  async getProfile() {
    return apiRequest(PANEL_ENDPOINTS.seller.profile);
  },

  async updateProfile(_user, payload) {
    return apiRequest(PANEL_ENDPOINTS.seller.profile, {
      method: "PUT",
      body: payload,
    });
  },

  async getSettings() {
    return apiRequest(PANEL_ENDPOINTS.seller.settings);
  },

  async updateSettings(_user, payload) {
    return apiRequest(PANEL_ENDPOINTS.seller.settings, {
      method: "PUT",
      body: payload,
    });
  },

  async getStats() {
    return apiRequest(`${PANEL_ENDPOINTS.seller.stats}?days=7`);
  },

  async getDashboard() {
    return apiRequest(PANEL_ENDPOINTS.seller.dashboard);
  },

  async deleteAccount() {
    return apiRequest(PANEL_ENDPOINTS.seller.account, { method: "DELETE" });
  },
};

export const sellerApi = hasApiBaseUrl() ? realSellerApi : mockSellerApi;

export const SELLER_STAT_FALLBACK = MOCK_SELLER_STATS;

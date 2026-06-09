import { apiRequest, hasApiBaseUrl } from "./client";
import { getListItems } from "./listUtils";

const buildPaginationQuery = (params = {}) => {
  const search = new URLSearchParams({
    page: String(params.page || 1),
    per_page: String(params.perPage || 50),
  });
  return search.toString();
};

const realUsersApi = {
  getUser: (userId) => apiRequest(`/users/${userId}`),

  updateUser: (userId, body) =>
    apiRequest(`/users/${userId}`, {
      method: "PATCH",
      body,
    }),

  listDeliveryAddresses: async (userId, params = {}) => {
    const payload = await apiRequest(
      `/users/${userId}/delivery_addresses?${buildPaginationQuery(params)}`,
    );
    return getListItems(payload);
  },

  createDeliveryAddress: (userId, body) =>
    apiRequest(`/users/${userId}/delivery_addresses`, {
      method: "POST",
      body,
    }),

  updateDeliveryAddress: (userId, addressId, body) =>
    apiRequest(`/users/${userId}/delivery_addresses/${addressId}`, {
      method: "PATCH",
      body,
    }),

  deleteDeliveryAddress: (userId, addressId) =>
    apiRequest(`/users/${userId}/delivery_addresses/${addressId}`, {
      method: "DELETE",
    }),

  listCreditCards: async (userId, params = {}) => {
    const payload = await apiRequest(
      `/users/${userId}/credit_cards?${buildPaginationQuery(params)}`,
    );
    return getListItems(payload);
  },

  createCreditCard: (userId, body) =>
    apiRequest(`/users/${userId}/credit_cards`, {
      method: "POST",
      body,
    }),

  updateCreditCard: (userId, cardId, body) =>
    apiRequest(`/users/${userId}/credit_cards/${cardId}`, {
      method: "PATCH",
      body,
    }),

  deleteCreditCard: (userId, cardId) =>
    apiRequest(`/users/${userId}/credit_cards/${cardId}`, {
      method: "DELETE",
    }),
};

const mockUsersApi = {
  getUser: async () => null,
  updateUser: async () => ({ success: true }),
  listDeliveryAddresses: async () => [],
  createDeliveryAddress: async () => null,
  updateDeliveryAddress: async () => null,
  deleteDeliveryAddress: async () => ({ success: true }),
  listCreditCards: async () => [],
  createCreditCard: async () => null,
  updateCreditCard: async () => null,
  deleteCreditCard: async () => ({ success: true }),
};

const resolveApi = () => (hasApiBaseUrl() ? realUsersApi : mockUsersApi);

export const usersApi = {
  getUser: (...args) => resolveApi().getUser(...args),
  updateUser: (...args) => resolveApi().updateUser(...args),
  listDeliveryAddresses: (...args) => resolveApi().listDeliveryAddresses(...args),
  createDeliveryAddress: (...args) => resolveApi().createDeliveryAddress(...args),
  updateDeliveryAddress: (...args) => resolveApi().updateDeliveryAddress(...args),
  deleteDeliveryAddress: (...args) => resolveApi().deleteDeliveryAddress(...args),
  listCreditCards: (...args) => resolveApi().listCreditCards(...args),
  createCreditCard: (...args) => resolveApi().createCreditCard(...args),
  updateCreditCard: (...args) => resolveApi().updateCreditCard(...args),
  deleteCreditCard: (...args) => resolveApi().deleteCreditCard(...args),
};

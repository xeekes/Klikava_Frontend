import { apiRequest, hasApiBaseUrl } from "./client";

const unsupported = (feature) => {
  throw new Error(`${feature} is not available without API base URL`);
};

const realUsersApi = {
  getDeliveryAddresses: (userId, params = {}) => {
    const search = new URLSearchParams({
      page: String(params.page || 1),
      per_page: String(params.perPage || 20),
    });
    return apiRequest(
      `/users/${userId}/delivery_addresses?${search.toString()}`,
    );
  },

  createDeliveryAddress: (userId, body) =>
    apiRequest(`/users/${userId}/delivery_addresses`, {
      method: "POST",
      body,
    }),

  updateUser: (userId, body) =>
    apiRequest(`/users/${userId}`, {
      method: "PATCH",
      body,
    }),
};

const mockUsersApi = {
  getDeliveryAddresses: async () => ({ items: [] }),
  createDeliveryAddress: async () => ({ success: true }),
  updateUser: async () => ({ success: true }),
};

export const usersApi = {
  getDeliveryAddresses: (...args) =>
    hasApiBaseUrl()
      ? realUsersApi.getDeliveryAddresses(...args)
      : mockUsersApi.getDeliveryAddresses(...args),

  createDeliveryAddress: (...args) =>
    hasApiBaseUrl()
      ? realUsersApi.createDeliveryAddress(...args)
      : mockUsersApi.createDeliveryAddress(...args),

  updateUser: (...args) =>
    hasApiBaseUrl()
      ? realUsersApi.updateUser(...args)
      : mockUsersApi.updateUser(...args),
};

export const ensureUsersApi = () => {
  if (!hasApiBaseUrl()) {
    unsupported("Users API");
  }
};

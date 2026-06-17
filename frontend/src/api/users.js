/*
 * User profile API: personal data, delivery addresses, bank cards.
 * Mock implementation is loaded dynamically when VITE_API_BASE_URL is empty.
 */
import { apiRequest } from "./client";
import { createLazyMockApi } from "./createLazyMockApi";
import { getListItems } from "./listUtils";

/**
 * Serializes pagination parameters in query string for list-endpoints.
 * @param {{ page?: number, perPage?: number }} [params]
 * @returns {string}
 */
const buildPaginationQuery = (params = {}) => {
  const search = new URLSearchParams({
    page: String(params.page || 1),
    per_page: String(params.perPage || 50),
  });
  return search.toString();
};

const realUsersApi = {
  /**
   * Loads the user profile by id from the backend.
   * @param {string|number} userId
   * @returns {Promise<object>}
   */
  getUser: (userId) => apiRequest(`/users/${userId}`),

  /**
   * Applies a partial update to a user record.
   * @param {string|number} userId
   * @param {object} body
   * @returns {Promise<object>}
   */
  updateUser: (userId, body) =>
    apiRequest(`/users/${userId}`, {
      method: "PATCH",
      body,
    }),

  /**
   * Returns the user's shipping addresses with pagination.
   * @param {string|number} userId
   * @param {{ page?: number, perPage?: number }} [params]
   * @returns {Promise<Array<object>>}
   */
  listDeliveryAddresses: async (userId, params = {}) => {
    const payload = await apiRequest(
      `/users/${userId}/delivery_addresses?${buildPaginationQuery(params)}`,
    );
    return getListItems(payload);
  },

  /**
   * Creates a new shipping address for the user.
   * @param {string|number} userId
   * @param {object} body
   * @returns {Promise<object>}
   */
  createDeliveryAddress: (userId, body) =>
    apiRequest(`/users/${userId}/delivery_addresses`, {
      method: "POST",
      body,
    }),

  /**
   * Updates an existing delivery address by id.
   * @param {string|number} userId
   * @param {string|number} addressId
   * @param {object} body
   * @returns {Promise<object>}
   */
  updateDeliveryAddress: (userId, addressId, body) =>
    apiRequest(`/users/${userId}/delivery_addresses/${addressId}`, {
      method: "PATCH",
      body,
    }),

  /**
   * Removes the shipping address from the user's profile.
   * @param {string|number} userId
   * @param {string|number} addressId
   * @returns {Promise<object>}
   */
  deleteDeliveryAddress: (userId, addressId) =>
    apiRequest(`/users/${userId}/delivery_addresses/${addressId}`, {
      method: "DELETE",
    }),

  /**
   * Returns the user's saved maps with pagination.
   * @param {string|number} userId
   * @param {{ page?: number, perPage?: number }} [params]
   * @returns {Promise<Array<object>>}
   */
  listCreditCards: async (userId, params = {}) => {
    const payload = await apiRequest(
      `/users/${userId}/credit_cards?${buildPaginationQuery(params)}`,
    );
    return getListItems(payload);
  },

  /**
   * Adds a new bank card entry for the user.
   * @param {string|number} userId
   * @param {object} body
   * @returns {Promise<object>}
   */
  createCreditCard: (userId, body) =>
    apiRequest(`/users/${userId}/credit_cards`, {
      method: "POST",
      body,
    }),

  /**
   * Updates an existing map by id.
   * @param {string|number} userId
   * @param {string|number} cardId
   * @param {object} body
   * @returns {Promise<object>}
   */
  updateCreditCard: (userId, cardId, body) =>
    apiRequest(`/users/${userId}/credit_cards/${cardId}`, {
      method: "PATCH",
      body,
    }),

  /**
   * Removes a saved map from the user profile.
   * @param {string|number} userId
   * @param {string|number} cardId
   * @returns {Promise<object>}
   */
  deleteCreditCard: (userId, cardId) =>
    apiRequest(`/users/${userId}/credit_cards/${cardId}`, {
      method: "DELETE",
    }),

  /**
   * Deletes a user account.
   * @param {string|number} userId
   * @returns {Promise<unknown>}
   */
  deleteUser: (userId) =>
    apiRequest(`/users/${userId}`, {
      method: "DELETE",
    }),
};

const USERS_METHODS = [
  "getUser",
  "updateUser",
  "listDeliveryAddresses",
  "createDeliveryAddress",
  "updateDeliveryAddress",
  "deleteDeliveryAddress",
  "listCreditCards",
  "createCreditCard",
  "updateCreditCard",
  "deleteCreditCard",
  "deleteUser",
];

/**
 * Users API facade: real backend with VITE_API_BASE_URL at build stage;
 * otherwise - a lazy mock proxy in a separate chunk.
 */
export const usersApi = import.meta.env.VITE_API_BASE_URL
  ? realUsersApi
  : createLazyMockApi(USERS_METHODS, () =>
      import("./users.mock.js").then((module) => module.mockUsersApi),
    );

/*
 * API профиля пользователя: личные данные, адреса доставки, банковские карты.
 * Прокси-объект делегирует mock-заглушкам, если базовый URL API не настроен.
 */
import { apiRequest, hasApiBaseUrl } from "./client";
import { getListItems } from "./listUtils";

/**
 * Сериализует параметры пагинации в query string для list-endpoint'ов.
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
   * Загружает профиль пользователя по id с бэкенда.
   * @param {string|number} userId
   * @returns {Promise<object>}
   */
  getUser: (userId) => apiRequest(`/users/${userId}`),

  /**
   * Применяет частичное обновление записи пользователя.
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
   * Возвращает адреса доставки пользователя с пагинацией.
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
   * Создаёт новый адрес доставки для пользователя.
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
   * Обновляет существующий адрес доставки по id.
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
   * Удаляет адрес доставки из профиля пользователя.
   * @param {string|number} userId
   * @param {string|number} addressId
   * @returns {Promise<object>}
   */
  deleteDeliveryAddress: (userId, addressId) =>
    apiRequest(`/users/${userId}/delivery_addresses/${addressId}`, {
      method: "DELETE",
    }),

  /**
   * Возвращает сохранённые карты пользователя с пагинацией.
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
   * Добавляет новую запись банковской карты для пользователя.
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
   * Обновляет существующую карту по id.
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
   * Удаляет сохранённую карту из профиля пользователя.
   * @param {string|number} userId
   * @param {string|number} cardId
   * @returns {Promise<object>}
   */
  deleteCreditCard: (userId, cardId) =>
    apiRequest(`/users/${userId}/credit_cards/${cardId}`, {
      method: "DELETE",
    }),

  /**
   * Удаляет аккаунт пользователя.
   * @param {string|number} userId
   * @returns {Promise<unknown>}
   */
  deleteUser: (userId) =>
    apiRequest(`/users/${userId}`, {
      method: "DELETE",
    }),
};

const mockUsersApi = {
  /**
   * Возвращает null в mock-режиме (профиль на сервере не сохраняется).
   * @returns {Promise<null>}
   */
  getUser: async () => null,

  /**
   * Подтверждает обновление профиля без сохранения данных в mock-режиме.
   * @returns {Promise<{ success: boolean }>}
   */
  updateUser: async () => ({ success: true }),

  /**
   * Возвращает пустой список адресов в mock-режиме.
   * @returns {Promise<[]>}
   */
  listDeliveryAddresses: async () => [],

  /**
   * Заглушка создания адреса для офлайн-разработки.
   * @returns {Promise<null>}
   */
  createDeliveryAddress: async () => null,

  /**
   * Заглушка обновления адреса для офлайн-разработки.
   * @returns {Promise<null>}
   */
  updateDeliveryAddress: async () => null,

  /**
   * Подтверждает удаление адреса без побочных эффектов в mock-режиме.
   * @returns {Promise<{ success: boolean }>}
   */
  deleteDeliveryAddress: async () => ({ success: true }),

  /**
   * Возвращает пустой список карт в mock-режиме.
   * @returns {Promise<[]>}
   */
  listCreditCards: async () => [],

  /**
   * Заглушка создания карты для офлайн-разработки.
   * @returns {Promise<null>}
   */
  createCreditCard: async () => null,

  /**
   * Заглушка обновления карты для офлайн-разработки.
   * @returns {Promise<null>}
   */
  updateCreditCard: async () => null,

  /**
   * Подтверждает удаление карты без побочных эффектов в mock-режиме.
   * @returns {Promise<{ success: boolean }>}
   */
  deleteCreditCard: async () => ({ success: true }),

  deleteUser: async () => ({ success: true }),
};

/**
 * Выбирает реальную или mock-реализацию users API по конфигурации окружения.
 * @returns {typeof realUsersApi}
 */
const resolveApi = () => (hasApiBaseUrl() ? realUsersApi : mockUsersApi);

/**
 * Фасад Users API: каждый вызов делегируется активной реализации бэкенда или mock.
 */
export const usersApi = {
  /**
   * @param {...Parameters<typeof realUsersApi.getUser>} args
   * @returns {ReturnType<typeof realUsersApi.getUser>}
   */
  getUser: (...args) => resolveApi().getUser(...args),

  /**
   * @param {...Parameters<typeof realUsersApi.updateUser>} args
   * @returns {ReturnType<typeof realUsersApi.updateUser>}
   */
  updateUser: (...args) => resolveApi().updateUser(...args),

  /**
   * @param {...Parameters<typeof realUsersApi.listDeliveryAddresses>} args
   * @returns {ReturnType<typeof realUsersApi.listDeliveryAddresses>}
   */
  listDeliveryAddresses: (...args) =>
    resolveApi().listDeliveryAddresses(...args),

  /**
   * @param {...Parameters<typeof realUsersApi.createDeliveryAddress>} args
   * @returns {ReturnType<typeof realUsersApi.createDeliveryAddress>}
   */
  createDeliveryAddress: (...args) =>
    resolveApi().createDeliveryAddress(...args),

  /**
   * @param {...Parameters<typeof realUsersApi.updateDeliveryAddress>} args
   * @returns {ReturnType<typeof realUsersApi.updateDeliveryAddress>}
   */
  updateDeliveryAddress: (...args) =>
    resolveApi().updateDeliveryAddress(...args),

  /**
   * @param {...Parameters<typeof realUsersApi.deleteDeliveryAddress>} args
   * @returns {ReturnType<typeof realUsersApi.deleteDeliveryAddress>}
   */
  deleteDeliveryAddress: (...args) =>
    resolveApi().deleteDeliveryAddress(...args),

  /**
   * @param {...Parameters<typeof realUsersApi.listCreditCards>} args
   * @returns {ReturnType<typeof realUsersApi.listCreditCards>}
   */
  listCreditCards: (...args) => resolveApi().listCreditCards(...args),

  /**
   * @param {...Parameters<typeof realUsersApi.createCreditCard>} args
   * @returns {ReturnType<typeof realUsersApi.createCreditCard>}
   */
  createCreditCard: (...args) => resolveApi().createCreditCard(...args),

  /**
   * @param {...Parameters<typeof realUsersApi.updateCreditCard>} args
   * @returns {ReturnType<typeof realUsersApi.updateCreditCard>}
   */
  updateCreditCard: (...args) => resolveApi().updateCreditCard(...args),

  /**
   * @param {...Parameters<typeof realUsersApi.deleteCreditCard>} args
   * @returns {ReturnType<typeof realUsersApi.deleteCreditCard>}
   */
  deleteCreditCard: (...args) => resolveApi().deleteCreditCard(...args),

  deleteUser: (...args) => resolveApi().deleteUser(...args),
};

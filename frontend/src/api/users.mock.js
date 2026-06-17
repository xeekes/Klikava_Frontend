/*
 * Mock users API for local development without VITE_API_BASE_URL.
 * Loaded via dynamic import so production bundles can exclude this module.
 */

/** Mock users API with the same method surface as realUsersApi. */
export const mockUsersApi = {
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
  deleteUser: async () => ({ success: true }),
};

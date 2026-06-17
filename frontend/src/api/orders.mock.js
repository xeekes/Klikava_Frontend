/*
 * Mock orders API for local development without VITE_API_BASE_URL.
 * Loaded via dynamic import so production bundles can exclude this module.
 */

/** Mock orders API with the same method surface as realOrdersApi. */
export const mockOrdersApi = {
  listOrders: async () => [],
  getOrder: async () => null,
  createOrder: async () => {
    throw new Error("Orders API requires VITE_API_BASE_URL.");
  },
  listShipments: async () => [],
};

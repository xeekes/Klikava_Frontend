/*
 * Mock cart API for local development without VITE_API_BASE_URL.
 * Loaded via dynamic import so production bundles can exclude this module.
 */
import { localCartApi } from "./cart.storage";

/** Reuses local storage cart behavior in mock mode. */
export const mockCartApi = localCartApi;

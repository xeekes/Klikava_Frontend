/*
 * Basket storage layer. There is no /cart on the backend yet,
 * therefore products are stored in localStorage in both modes for now.
 */
import { localCartApi } from "./cart.storage";
import { createLazyMockApi } from "./createLazyMockApi";

const CART_METHODS = ["getCart", "saveCart", "addItem", "clearCart"];

/**
 * Cart API facade: local storage until a backend cart endpoint appears.
 * Mock chunk is used only in dev builds without VITE_API_BASE_URL.
 */
export const cartApi = import.meta.env.VITE_API_BASE_URL
  ? localCartApi
  : createLazyMockApi(CART_METHODS, () =>
      import("./cart.mock.js").then((module) => module.mockCartApi),
    );

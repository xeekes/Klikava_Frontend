/*
 * Local cart persistence shared by real and mock cart API facades.
 * Used until a backend /cart endpoint is available.
 */
import { CART_STORAGE_KEY } from "../constants/cart";

/**
 * Reads cart items from localStorage; in case of absence or error, an empty array.
 * @returns {Array<object>}
 */
const readLocalCart = () => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/**
 * Saves the entire list of cart items in localStorage as JSON.
 * @param {Array<object>} items
 */
const writeLocalCart = (items) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
};

/** Local cart API used in both production and mock modes for now. */
export const localCartApi = {
  async getCart() {
    return { items: readLocalCart() };
  },

  async saveCart(items) {
    writeLocalCart(items);
    return { items };
  },

  async addItem(item) {
    const items = readLocalCart();
    const existing = items.find((entry) => entry.productId === item.productId);
    if (existing) {
      existing.quantity += item.quantity || 1;
    } else {
      items.push({ ...item, quantity: item.quantity || 1 });
    }
    writeLocalCart(items);
    return { items };
  },

  async clearCart() {
    writeLocalCart([]);
    return { items: [] };
  },
};

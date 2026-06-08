import { CART_STORAGE_KEY } from "../constants/cart";

const readLocalCart = () => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeLocalCart = (items) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
};

const mockCartApi = {
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

// Backend FastAPI пока не имеет /cart — корзина остаётся в localStorage.
export const cartApi = mockCartApi;

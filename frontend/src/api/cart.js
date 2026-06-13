/*
 * Слой хранения корзины. На бэкенде пока нет /cart,
 * поэтому товары всегда хранятся в localStorage независимо от режима API.
 */
import { CART_STORAGE_KEY } from "../constants/cart";

/**
 * Читает позиции корзины из localStorage; при отсутствии или ошибке — пустой массив.
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
 * Сохраняет весь список позиций корзины в localStorage как JSON.
 * @param {Array<object>} items
 */
const writeLocalCart = (items) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
};

const mockCartApi = {
  /**
   * Возвращает все позиции корзины, сохранённые локально.
   * @returns {Promise<{ items: Array<object> }>}
   */
  async getCart() {
    return { items: readLocalCart() };
  },

  /**
   * Заменяет всю корзину переданным списком позиций.
   * @param {Array<object>} items
   * @returns {Promise<{ items: Array<object> }>}
   */
  async saveCart(items) {
    writeLocalCart(items);
    return { items };
  },

  /**
   * Добавляет или увеличивает количество; при существующем товаре суммирует quantity.
   * @param {{ productId: string|number, quantity?: number, [key: string]: unknown }} item
   * @returns {Promise<{ items: Array<object> }>}
   */
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

  /**
   * Удаляет все позиции из корзины.
   * @returns {Promise<{ items: [] }>}
   */
  async clearCart() {
    writeLocalCart([]);
    return { items: [] };
  },
};

/**
 * Фасад Cart API на localStorage до появления серверного endpoint корзины.
 */
export const cartApi = mockCartApi;

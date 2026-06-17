/*
 * Typed localStorage helpers and key registry.
 * User keys are generated via getUserStorageKey to isolate data between accounts.
 */

/**
 * Reads and parses JSON from localStorage, returning fallback if parsing is missing or fails.
 * @param {string} key
 * @param {unknown} fallback
 * @returns {unknown}
 */
export const readStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

/**
 * Serializes the value to JSON and writes it to localStorage; silently ignores quota errors.
 * @param {string} key
 * @param {unknown} value
 */
export const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage may be unavailable */
  }
};

/**
 * Adds a user id suffix to the vault key to isolate account data.
 * @param {string} key
 * @param {string|number|null|undefined} userId
 * @returns {string}
 */
export const getUserStorageKey = (key, userId) =>
  userId ? `${key}__${userId}` : key;

/** LocalStorage key registry for profile and shopping features. */
export const STORAGE_KEYS = {
  favorites: "klikava_favorites",
  browsingHistory: "klikava_browsing_history",
  personalInfo: "klikava_personal_info",
  addresses: "klikava_addresses",
  cards: "klikava_cards",
  orders: "klikava_orders",
  feedback: "klikava_feedback",
  chatMessages: "klikava_chat_messages",
  activeCoupon: "klikava_active_coupon",
  language: "klikava_language",
  currency: "klikava_currency",
};

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

export const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage may be unavailable
  }
};

export const getUserStorageKey = (key, userId) =>
  userId ? `${key}__${userId}` : key;

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

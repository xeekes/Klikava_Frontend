/*
 * Типизированные хелперы localStorage и реестр ключей.
 * Пользовательские ключи формируются через getUserStorageKey для изоляции данных между аккаунтами.
 */

/**
 * Читает и парсит JSON из localStorage, возвращая fallback при отсутствии или ошибке парсинга.
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
 * Сериализует значение в JSON и записывает в localStorage; молча игнорирует ошибки квоты.
 * @param {string} key
 * @param {unknown} value
 */
export const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* хранилище может быть недоступно */
  }
};

/**
 * Добавляет суффикс id пользователя к ключу хранилища для изоляции данных аккаунта.
 * @param {string} key
 * @param {string|number|null|undefined} userId
 * @returns {string}
 */
export const getUserStorageKey = (key, userId) =>
  userId ? `${key}__${userId}` : key;

/** Реестр ключей localStorage для профиля и функций покупок. */
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

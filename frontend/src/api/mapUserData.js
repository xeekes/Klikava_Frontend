/*
 * Кодирование/декодирование сущностей профиля для бэкенда.
 * Адреса и карты сериализуются в одно поле API (обход ограниченной схемы).
 */
import { resolveMediaUrl } from "./client";
const ADDRESS_META_PREFIX = "klikava_addr:";

/**
 * Сериализует форму адреса доставки в поле бэкенда `address_line` с вложенными метаданными.
 * @param {object} form
 * @returns {{ address_line: string }}
 */
export const encodeAddressForm = (form) => ({
  address_line: `${ADDRESS_META_PREFIX}${JSON.stringify(form)}`,
});

/**
 * Восстанавливает объект адреса UI из записи адреса доставки бэкенда.
 * @param {{ id: string|number, address_line?: string }} item
 * @returns {object}
 */
export const decodeAddressItem = (item) => {
  const line = item?.address_line || "";
  if (line.startsWith(ADDRESS_META_PREFIX)) {
    try {
      const form = JSON.parse(line.slice(ADDRESS_META_PREFIX.length));
      return {
        id: String(item.id),
        firstName: form.firstName || "",
        lastName: form.lastName || "",
        country: form.country || "",
        phone: form.phone || "",
        address: form.address || "",
        city: form.city || "",
        postalCode: form.postalCode || "",
      };
    } catch {
      /* переход к запасному варианту с простой строкой */
    }
  }
  return {
    id: String(item.id),
    firstName: "",
    lastName: "",
    country: "",
    phone: "",
    address: line,
    city: "",
    postalCode: "",
  };
};

/**
 * Упаковывает поля отображения карты в поле API `card_info_encrypted`, разделённое через |.
 * @param {object} card
 * @returns {{ card_info_encrypted: string, order_in_list: number|null }}
 */
export const encodeCardPayload = (card) => ({
  card_info_encrypted: [
    card.brand || "card",
    card.last4 || "0000",
    card.expiryMonth || "01",
    card.expiryYear || "2030",
    card.label || card.brand || "Card",
  ].join("|"),
  order_in_list: card.orderInList ?? null,
});

/**
 * Разбирает сохранённую запись карты в поля brand, expiry и label для UI.
 * @param {{ id: string|number, card_info_encrypted?: string }} item
 * @returns {object}
 */
export const decodeCardItem = (item) => {
  const parts = String(item?.card_info_encrypted || "").split("|");
  return {
    id: String(item.id),
    brand: parts[0] || "card",
    last4: parts[1] || "0000",
    expiryMonth: parts[2] || "01",
    expiryYear: parts[3] || "2030",
    label: parts[4] || parts[0] || "Card",
  };
};

/**
 * @param {unknown} value
 * @returns {string}
 */
const readMediaValue = (value) => {
  if (typeof value === "string") {
    return value;
  }
  if (value && typeof value === "object") {
    const entry = value;
    return (
      entry.url ||
      entry.image_url ||
      entry.path ||
      entry.src ||
      entry.file_url ||
      ""
    );
  }
  return "";
};

/**
 * Достаёт URL аватара пользователя из разных полей ответа API.
 * @param {object|null|undefined} user
 * @returns {string}
 */
export const pickUserAvatar = (user) => {
  if (!user) {
    return "";
  }
  const pictures = user.pictures || user.avatar_pictures || user.images || [];
  const raw =
    readMediaValue(user.avatar) ||
    user.avatar_url ||
    user.avatarUrl ||
    user.picture_url ||
    user.image_url ||
    user.profile_picture_url ||
    user.profile_image_url ||
    user.photo_url ||
    readMediaValue(user.picture) ||
    readMediaValue(user.profile_picture) ||
    readMediaValue(user.photo) ||
    readMediaValue(pictures[0]) ||
    pictures[0]?.url ||
    pictures[0]?.image_url ||
    pictures[0]?.path ||
    "";
  return resolveMediaUrl(raw);
};

/**
 * URL эндпоинта аватара пользователя на API.
 * @param {string|number} userId
 * @returns {string}
 */
export const buildUserAvatarEndpoint = (userId) =>
  resolveMediaUrl(`/pictures/users/${userId}`);

/**
 * Объединяет поля авторизованного пользователя в форму личных данных для UI профиля.
 * @param {object|null|undefined} user
 * @param {object} [current]
 * @returns {object}
 */
export const mapAuthUserToPersonalInfo = (user, current = {}) => {
  if (!user) {
    return current;
  }
  const displayName = user.displayName || user.name || "";
  const [firstName = "", ...rest] = displayName.split(" ");
  const emailOrPhone = user.emailOrPhone || user.email || "";
  return {
    ...current,
    firstName: firstName || current.firstName,
    lastName: rest.join(" ") || current.lastName,
    email: emailOrPhone.includes("@") ? emailOrPhone : current.email || "",
    phone: user.phone_number || current.phone || "",
    avatar: pickUserAvatar(user) || current.avatar || "",
  };
};

/**
 * Поля профиля, которые синхронизируются с API пользователя.
 */
export const PERSONAL_INFO_API_FIELDS = new Set([
  "firstName",
  "lastName",
  "email",
  "phone",
]);

/**
 * @param {string} fieldId
 * @returns {boolean}
 */
export const isPersonalInfoApiField = (fieldId) =>
  PERSONAL_INFO_API_FIELDS.has(fieldId);

/**
 * Формирует PATCH payload для одного поля личных данных.
 * @param {string} fieldId
 * @param {object} info
 * @returns {object|null}
 */
export const mapPersonalInfoFieldToUserUpdate = (fieldId, info) => {
  if (!isPersonalInfoApiField(fieldId)) {
    return null;
  }
  switch (fieldId) {
    case "firstName":
    case "lastName": {
      const name = `${info.firstName || ""} ${info.lastName || ""}`.trim();
      return name ? { name } : {};
    }
    case "email":
      return info.email ? { email: info.email } : {};
    case "phone":
      return info.phone ? { phone_number: info.phone } : {};
    default:
      return null;
  }
};

/**
 * Формирует частичный payload обновления пользователя из значений формы личных данных.
 * @param {object} info
 * @returns {object}
 */
export const mapPersonalInfoToUserUpdate = (info) => {
  const name = `${info.firstName || ""} ${info.lastName || ""}`.trim();
  return {
    ...(name ? { name } : {}),
    ...(info.email ? { email: info.email } : {}),
    ...(info.phone ? { phone_number: info.phone } : {}),
  };
};

/**
 * Определяет бренд и подпись карты по первым цифрам номера.
 * @param {string} [cardNumber]
 * @returns {{ brand: string, label: string }}
 */
export const detectCardBrand = (cardNumber = "") => {
  const digits = String(cardNumber).replace(/\D/g, "");
  if (digits.startsWith("4")) {
    return { brand: "visa", label: "Visa" };
  }
  if (digits.startsWith("5")) {
    return { brand: "mastercard", label: "Mastercard" };
  }
  return { brand: "mastercard", label: "Mastercard" };
};

/**
 * Формирует сводку карты для хранения (бренд, последние 4 цифры, срок) из данных формы.
 * @param {{ cardNumber: string, month: string, year: string }} params
 * @returns {object}
 */
export const cardFromForm = ({ cardNumber, month, year }) => {
  const digits = String(cardNumber).replace(/\D/g, "");
  const { brand, label } = detectCardBrand(digits);
  return {
    brand,
    label,
    last4: digits.slice(-4) || "0000",
    expiryMonth: month,
    expiryYear: year,
  };
};

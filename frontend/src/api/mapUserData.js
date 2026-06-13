/*
 * Кодирование/декодирование сущностей профиля для бэкенда.
 * Адреса и карты сериализуются в одно поле API (обход ограниченной схемы).
 */
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
    avatar: user.avatar_url || current.avatar || "",
  };
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

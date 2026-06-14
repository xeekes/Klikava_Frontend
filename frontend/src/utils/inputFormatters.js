export const MAX_PHONE_DIGITS = 15;
export const CARD_NUMBER_DIGITS = 16;
export const MAX_POSTAL_CODE_LENGTH = 12;

/**
 * Удаляет нецифровые символы и ограничивает длину.
 * @param {unknown} value
 * @param {number} maxLength
 * @returns {string}
 */
export const digitsOnly = (value, maxLength) =>
  String(value ?? "")
    .replace(/\D/g, "")
    .slice(0, maxLength);

/**
 * Оставляет только цифры телефона (до 15).
 * @param {unknown} value
 * @returns {string}
 */
export const formatPhoneInput = (value) =>
  digitsOnly(value, MAX_PHONE_DIGITS);

/**
 * Форматирует номер карты: до 16 цифр, группы по 4.
 * @param {unknown} value
 * @returns {string}
 */
export const formatCardNumberInput = (value) => {
  const digits = digitsOnly(value, CARD_NUMBER_DIGITS);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
};

/**
 * Почтовый индекс: буквы, цифры, пробел и дефис.
 * @param {unknown} value
 * @returns {string}
 */
export const formatPostalCodeInput = (value) =>
  String(value ?? "")
    .replace(/[^A-Za-z0-9\s-]/g, "")
    .slice(0, MAX_POSTAL_CODE_LENGTH);

/**
 * Санитизирует значение поля формы адреса при вводе.
 * @param {string} field
 * @param {unknown} value
 * @returns {string}
 */
export const formatAddressFieldInput = (field, value) => {
  if (field === "phone") {
    return formatPhoneInput(value);
  }
  if (field === "postalCode") {
    return formatPostalCodeInput(value);
  }
  return String(value ?? "");
};

export const MAX_PHONE_DIGITS = 15;
export const CARD_NUMBER_DIGITS = 16;
export const MAX_POSTAL_CODE_LENGTH = 12;

/**
 * Removes non-numeric characters and limits length.
 * @param {unknown} value
 * @param {number} maxLength
 * @returns {string}
 */
export const digitsOnly = (value, maxLength) =>
  String(value ?? "")
    .replace(/\D/g, "")
    .slice(0, maxLength);

/**
 * Leaves only phone numbers (up to 15).
 * @param {unknown} value
 * @returns {string}
 */
export const formatPhoneInput = (value) =>
  digitsOnly(value, MAX_PHONE_DIGITS);

/**
 * Formats the card number: up to 16 digits, groups of 4.
 * @param {unknown} value
 * @returns {string}
 */
export const formatCardNumberInput = (value) => {
  const digits = digitsOnly(value, CARD_NUMBER_DIGITS);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
};

/**
 * Postal code: letters, numbers, space and hyphen.
 * @param {unknown} value
 * @returns {string}
 */
export const formatPostalCodeInput = (value) =>
  String(value ?? "")
    .replace(/[^A-Za-z0-9\s-]/g, "")
    .slice(0, MAX_POSTAL_CODE_LENGTH);

/**
 * Sanitizes the address form field value as it is entered.
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

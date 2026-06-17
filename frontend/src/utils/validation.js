/*
 * General validation rules, reusable schemas and the validateForm runner.
 * Used by useFormValidation and the auth API mock layer.
 */

/**
 * Trims spaces from strings; non-string values ​​are returned unchanged.
 * @param {unknown} value
 * @returns {string|unknown}
 */
const trim = (value) => (typeof value === "string" ? value.trim() : "");

/**
 * Checks if the value looks like a valid email.
 * @param {unknown} value
 * @returns {boolean}
 */
export const isEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(trim(value));

/**
 * Checks whether a value contains 7-15 digits after removing non-digit characters.
 * @param {unknown} value
 * @returns {boolean}
 */
export const isPhone = (value) => {
  const digits = trim(value).replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
};

/**
 * Accepts a valid email or phone number depending on the presence of the @ symbol.
 * @param {unknown} value
 * @returns {boolean}
 */
export const isEmailOrPhone = (value) => {
  const normalized = trim(value);
  if (!normalized) {
    return false;
  }
  if (normalized.includes("@")) {
    return isEmail(normalized);
  }
  return isPhone(normalized);
};

/**
 * Accepts username, email or phone for the login form.
 * @param {unknown} value
 * @returns {boolean}
 */
export const isLoginIdentifier = (value) => {
  const normalized = trim(value);
  if (!normalized) {
    return false;
  }
  if (isEmailOrPhone(normalized)) {
    return true;
  }
  return /^[a-zA-Z0-9._-]{2,32}$/.test(normalized);
};

/**
 * Returns the first password policy violation message, or null if the password is valid.
 * @param {unknown} password
 * @returns {string|null}
 */
export const getPasswordError = (password) => {
  const value = trim(password);
  if (!value) {
    return "Password is required";
  }
  if (value.length < 8 || value.length > 20) {
    return "Use 8 to 20 characters";
  }
  if (!/\d/.test(value)) {
    return "Include at least one digit";
  }
  if ((value.match(/[a-z]/g) || []).length < 2) {
    return "Include at least two lowercase letters";
  }
  if ((value.match(/[A-Z]/g) || []).length < 2) {
    return "Include at least two uppercase letters";
  }
  if (!/^[A-Za-z0-9]+$/.test(value)) {
    return "Use Latin letters and digits only";
  }
  return null;
};

/**
 * Field rule factories. Each factory returns a validator `(value, allValues) => message|null`.
 */
export const rules = {
  /**
   * Required field rule factory with custom message for empty value.
   * @param {string} [message]
   * @returns {(value: unknown) => string|null}
   */
  required:
    (message = "This field is required") =>
    (value) =>
      trim(value) ? null : message,

  /**
   * Factory for email or phone fields (registration and recovery).
   * @returns {(value: unknown) => string|null}
   */
  emailOrPhone: () => (value) => {
    if (!trim(value)) {
      return "Enter email or phone number";
    }
    if (!isEmailOrPhone(value)) {
      return "Enter a valid email or phone number";
    }
    return null;
  },

  /**
   * Factory for login ID (username, email or phone).
   * @returns {(value: unknown) => string|null}
   */
  loginIdentifier: () => (value) => {
    if (!trim(value)) {
      return "Enter username, email or phone number";
    }
    if (!isLoginIdentifier(value)) {
      return "Enter a valid username, email or phone number";
    }
    return null;
  },

  /**
   * Factory enforcing the full login password policy via getPasswordError.
   * @returns {(value: unknown) => string|null}
   */
  password: () => (value) => getPasswordError(value),

  /**
   * A factory that checks that the password confirmation matches the password field in allValues.
   * @returns {(value: unknown, allValues: Record<string, unknown>) => string|null}
   */
  confirmPassword: () => (value, allValues) => {
    if (!trim(value)) {
      return "Confirm your password";
    }
    if (value !== allValues.password) {
      return "Passwords do not match";
    }
    return null;
  },

  /**
   * Login password factory with minimum length check (4+ characters).
   * @returns {(value: unknown) => string|null}
   */
  loginPassword: () => (value) => {
    if (!trim(value)) {
      return "Password is required";
    }
    if (trim(value).length < 4) {
      return "Password is too short";
    }
    return null;
  },

  /**
   * Factory for name fields with support for Latin and Cyrillic alphabet.
   * @param {string} [label]
   * @returns {(value: unknown) => string|null}
   */
  personName:
    (label = "Name") =>
    (value) => {
      if (!trim(value)) {
        return `${label} is required`;
      }
      if (!/^[A-Za-zА-Яа-яЁё\s'-]{2,}$/u.test(trim(value))) {
        return `${label} must be at least 2 letters`;
      }
      return null;
    },

  /**
   * Factory for required phone fields validated via isPhone.
   * @returns {(value: unknown) => string|null}
   */
  phone: () => (value) => {
    if (!trim(value)) {
      return "Phone is required";
    }
    if (!isPhone(value)) {
      return "Enter a valid phone number";
    }
    return null;
  },

  /**
   * Factory for minimum trimmed length with a fixed error message.
   * @param {number} min
   * @param {string} message
   * @returns {(value: unknown) => string|null}
   */
  minLength: (min, message) => (value) => {
    if (!trim(value)) {
      return message;
    }
    if (trim(value).length < min) {
      return message;
    }
    return null;
  },

  /**
   * Factory for postal codes (3–12 alphanumeric characters, space, or hyphen).
   * @returns {(value: unknown) => string|null}
   */
  postalCode: () => (value) => {
    if (!trim(value)) {
      return "Postal code is required";
    }
    if (!/^[A-Za-z0-9\s-]{3,12}$/.test(trim(value))) {
      return "Enter a valid postal code";
    }
    return null;
  },

  /**
   * Factory for optional password updates; skips validation when the value is empty.
   * @returns {(value: unknown) => string|null}
   */
  optionalPassword: () => (value) => {
    if (!trim(value)) {
      return null;
    }
    return getPasswordError(value);
  },

  /**
   * Factory for required email fields validated via isEmail.
   * @returns {(value: unknown) => string|null}
   */
  email: () => (value) => {
    if (!trim(value)) {
      return "Email is required";
    }
    if (!isEmail(value)) {
      return "Enter a valid email";
    }
    return null;
  },

  /**
   * Factory for numeric verification codes of a fixed digit length.
   * @param {number} [length]
   * @returns {(value: unknown) => string|null}
   */
  verificationCode:
    (length = 4) =>
    (value) => {
      const digits = String(value || "").replace(/\D/g, "");
      if (digits.length < length) {
        return `Enter the ${length}-digit code`;
      }
      return null;
    },

  /**
   * Factory for payment card numbers (exactly 16 digits after removing spaces).
   * @returns {(value: unknown) => string|null}
   */
  cardNumber: () => (value) => {
    const digits = trim(value).replace(/\s/g, "");
    if (!digits) {
      return "Card number is required";
    }
    if (!/^\d{16}$/.test(digits)) {
      return "Enter a 16-digit card number";
    }
    return null;
  },

  /**
   * Factory for card expiry month (01–12).
   * @returns {(value: unknown) => string|null}
   */
  expiryMonth: () => (value) => {
    if (!trim(value)) {
      return "Month is required";
    }
    const month = Number(value);
    if (month < 1 || month > 12) {
      return "Enter a valid month (01–12)";
    }
    return null;
  },

  /**
   * Factory for card expiry year (2 or 4 digits).
   * @returns {(value: unknown) => string|null}
   */
  expiryYear: () => (value) => {
    if (!trim(value)) {
      return "Year is required";
    }
    if (!/^\d{2,4}$/.test(trim(value))) {
      return "Enter a valid year";
    }
    return null;
  },

  /**
   * Factory for card CVV (3 or 4 digits).
   * @returns {(value: unknown) => string|null}
   */
  cvv: () => (value) => {
    if (!trim(value)) {
      return "CVV is required";
    }
    if (!/^\d{3,4}$/.test(trim(value))) {
      return "Enter a valid CVV";
    }
    return null;
  },

  /**
   * Factory for product review text with a minimum character count.
   * @param {number} [min]
   * @returns {(value: unknown) => string|null}
   */
  reviewText:
    (min = 10) =>
    (value) => {
      if (!trim(value)) {
        return "Please enter your feedback";
      }
      if (trim(value).length < min) {
        return `Use at least ${min} characters`;
      }
      return null;
    },

  /**
   * Factory for order return reason text with a minimum character count.
   * @param {number} [min]
   * @returns {(value: unknown) => string|null}
   */
  returnReason:
    (min = 10) =>
    (value) => {
      if (!trim(value)) {
        return "Describe the reason for return";
      }
      if (trim(value).length < min) {
        return `Use at least ${min} characters`;
      }
      return null;
    },

  /**
   * Factory that ensures the numeric rating is not below the minimum threshold.
   * @param {number} [min]
   * @returns {(value: unknown) => string|null}
   */
  rating:
    (min = 1) =>
    (value) => {
      if (!value || Number(value) < min) {
        return "Select a rating";
      }
      return null;
    },
};

/**
 * Validates a catalog filter min/max price pair and returns field error messages.
 * @param {string|number} minPrice
 * @param {string|number} maxPrice
 * @returns {Record<string, string>}
 */
export const validatePriceRange = (minPrice, maxPrice) => {
  const errors = {};
  if (minPrice !== "" && Number(minPrice) < 0) {
    errors.minPrice = "Enter a valid minimum price";
  }
  if (maxPrice !== "" && Number(maxPrice) < 0) {
    errors.maxPrice = "Enter a valid maximum price";
  }
  if (
    minPrice !== "" &&
    maxPrice !== "" &&
    Number(maxPrice) < Number(minPrice)
  ) {
    errors.maxPrice = "Max price must be greater than min";
  }
  return errors;
};

/**
 * Named field rule maps for validateForm. Keys match form field names; values are rule arrays from rules factories.
 * - login — sign-in form (identifier + login password)
 * - registerApi — registration API payload (email/phone, name, password)
 * - emailOrPhone — identifier-only step (recovery/registration)
 * - password — password set/reset with confirmation
 * - verificationCode — OTP entry
 * - address — checkout/profile delivery address
 * - personalInfo — profile personal data with optional password change
 * - card — checkout payment card
 * - profileCard — saved card editor in profile (field order differs from checkout)
 */
export const schemas = {
  login: {
    emailOrPhone: [rules.loginIdentifier()],
    password: [rules.loginPassword()],
  },
  registerApi: {
    emailOrPhone: [rules.emailOrPhone()],
    name: [rules.required("Name is required")],
    password: [rules.password()],
  },
  emailOrPhone: {
    emailOrPhone: [rules.emailOrPhone()],
  },
  password: {
    password: [rules.password()],
    confirmPassword: [rules.confirmPassword()],
  },
  verificationCode: {
    code: [rules.verificationCode(4)],
  },
  address: {
    firstName: [rules.personName("First name")],
    lastName: [rules.personName("Last name")],
    country: [rules.minLength(2, "Country is required")],
    phone: [rules.phone()],
    address: [rules.minLength(5, "Address must be at least 5 characters")],
    city: [rules.minLength(2, "City is required")],
    postalCode: [rules.postalCode()],
  },
  personalInfo: {
    firstName: [rules.personName("First name")],
    lastName: [rules.personName("Last name")],
    phone: [rules.phone()],
    email: [rules.email()],
    city: [rules.minLength(2, "City is required")],
    country: [rules.minLength(2, "Country is required")],
    address: [rules.minLength(5, "Address must be at least 5 characters")],
    password: [rules.optionalPassword()],
  },
  card: {
    cardNumber: [rules.cardNumber()],
    month: [rules.expiryMonth()],
    year: [rules.expiryYear()],
    cvv: [rules.cvv()],
  },
  profileCard: {
    month: [rules.expiryMonth()],
    year: [rules.expiryYear()],
    cardNumber: [rules.cardNumber()],
    cvv: [rules.cvv()],
  },
};

/**
 * Runs each schema rule against the matching values; stops at the first field error.
 * @param {Record<string, unknown>} values
 * @param {Record<string, Array<(value: unknown, allValues: Record<string, unknown>) => string|null>>} schema
 * @returns {Record<string, string>}
 */
export const validateForm = (values, schema) => {
  const errors = {};
  Object.entries(schema).forEach(([field, fieldRules]) => {
    fieldRules.forEach((rule) => {
      if (errors[field]) {
        return;
      }
      const message = rule(values[field], values);
      if (message) {
        errors[field] = message;
      }
    });
  });
  return errors;
};

/**
 * Returns true when at least one field error message is truthy.
 * @param {Record<string, string|undefined|null>} errors
 * @returns {boolean}
 */
export const hasValidationErrors = (errors) =>
  Object.values(errors).some(Boolean);

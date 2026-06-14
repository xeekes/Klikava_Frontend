/*
 * Общие правила валидации, переиспользуемые схемы и раннер validateForm.
 * Используется useFormValidation и mock-слоем auth API.
 */

/**
 * Обрезает пробелы у строк; нестроковые значения возвращает без изменений.
 * @param {unknown} value
 * @returns {string|unknown}
 */
const trim = (value) => (typeof value === "string" ? value.trim() : "");

/**
 * Проверяет, похоже ли значение на корректный email.
 * @param {unknown} value
 * @returns {boolean}
 */
export const isEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(trim(value));

/**
 * Проверяет, содержит ли значение 7–15 цифр после удаления нецифровых символов.
 * @param {unknown} value
 * @returns {boolean}
 */
export const isPhone = (value) => {
  const digits = trim(value).replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
};

/**
 * Принимает корректный email или телефон в зависимости от наличия символа @.
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
 * Принимает имя пользователя, email или телефон для формы входа.
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
 * Возвращает первое сообщение о нарушении политики пароля или null, если пароль валиден.
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
 * Фабрики правил полей. Каждая фабрика возвращает валидатор `(value, allValues) => message|null`.
 */
export const rules = {
  /**
   * Фабрика правила обязательного поля с настраиваемым сообщением для пустого значения.
   * @param {string} [message]
   * @returns {(value: unknown) => string|null}
   */
  required:
    (message = "This field is required") =>
    (value) =>
      trim(value) ? null : message,

  /**
   * Фабрика для полей email или телефона (регистрация и восстановление).
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
   * Фабрика для идентификатора входа (имя пользователя, email или телефон).
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
   * Фабрика, применяющая полную политику пароля регистрации через getPasswordError.
   * @returns {(value: unknown) => string|null}
   */
  password: () => (value) => getPasswordError(value),

  /**
   * Фабрика, проверяющая совпадение подтверждения пароля с полем password в allValues.
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
   * Фабрика пароля входа с минимальной проверкой длины (4+ символа).
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
   * Фабрика для полей имени с поддержкой латиницы и кириллицы.
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
   * Фабрика для обязательных полей телефона с проверкой через isPhone.
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
   * Фабрика минимальной длины после trim с фиксированным сообщением об ошибке.
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
   * Фабрика для почтового индекса (3–12 буквенно-цифровых символов, пробел или дефис).
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
   * Фабрика для опционального обновления пароля; пропускает валидацию при пустом значении.
   * @returns {(value: unknown) => string|null}
   */
  optionalPassword: () => (value) => {
    if (!trim(value)) {
      return null;
    }
    return getPasswordError(value);
  },

  /**
   * Фабрика для обязательных полей email с проверкой через isEmail.
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
   * Фабрика для числовых кодов верификации заданной длины в цифрах.
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
   * Фабрика для номеров платёжных карт (ровно 16 цифр после удаления пробелов).
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
   * Фабрика для месяца срока действия карты (01–12).
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
   * Фабрика для года срока действия карты (2 или 4 цифры).
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
   * Фабрика для CVV карты (3 или 4 цифры).
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
   * Фабрика для текста отзыва о товаре с минимальным числом символов.
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
   * Фабрика для текста причины возврата заказа с минимальным числом символов.
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
   * Фабрика, проверяющая, что числовой рейтинг не ниже минимального порога.
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
 * Валидирует пару min/max цены фильтра каталога; возвращает сообщения об ошибках по полям.
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
 * Именованные карты правил полей для validateForm. Ключи совпадают с именами полей формы; значения — массивы правил из фабрик rules.
 * - login — форма входа (идентификатор + пароль входа)
 * - registerApi — payload API регистрации (email/телефон, имя, пароль)
 * - emailOrPhone — шаг только с идентификатором (восстановление/регистрация)
 * - password — установка/сброс пароля с подтверждением
 * - verificationCode — ввод OTP-кода
 * - address — адрес доставки checkout/профиля
 * - personalInfo — личные данные профиля с опциональной сменой пароля
 * - card — платёжная карта checkout
 * - profileCard — редактор сохранённой карты в профиле (порядок полей отличается от checkout)
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
 * Запускает каждое правило схемы для соответствующих значений; останавливается на первой ошибке поля.
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
 * Возвращает true, если хотя бы одно сообщение об ошибке поля truthy.
 * @param {Record<string, string|undefined|null>} errors
 * @returns {boolean}
 */
export const hasValidationErrors = (errors) =>
  Object.values(errors).some(Boolean);

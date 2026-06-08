const trim = (value) => (typeof value === "string" ? value.trim() : "");

export const isEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(trim(value));

export const isPhone = (value) => {
  const digits = trim(value).replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
};

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

export const rules = {
  required:
    (message = "This field is required") =>
    (value) =>
      trim(value) ? null : message,

  emailOrPhone:
    () =>
    (value) => {
      if (!trim(value)) {
        return "Enter email or phone number";
      }
      if (!isEmailOrPhone(value)) {
        return "Enter a valid email or phone number";
      }
      return null;
    },

  loginIdentifier:
    () =>
    (value) => {
      if (!trim(value)) {
        return "Enter username, email or phone number";
      }
      if (!isLoginIdentifier(value)) {
        return "Enter a valid username, email or phone number";
      }
      return null;
    },

  password:
    () =>
    (value) =>
      getPasswordError(value),

  confirmPassword:
    () =>
    (value, allValues) => {
      if (!trim(value)) {
        return "Confirm your password";
      }
      if (value !== allValues.password) {
        return "Passwords do not match";
      }
      return null;
    },

  loginPassword:
    () =>
    (value) => {
      if (!trim(value)) {
        return "Password is required";
      }
      if (trim(value).length < 4) {
        return "Password is too short";
      }
      return null;
    },

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

  phone:
    () =>
    (value) => {
      if (!trim(value)) {
        return "Phone is required";
      }
      if (!isPhone(value)) {
        return "Enter a valid phone number";
      }
      return null;
    },

  minLength:
    (min, message) =>
    (value) => {
      if (!trim(value)) {
        return message;
      }
      if (trim(value).length < min) {
        return message;
      }
      return null;
    },

  postalCode:
    () =>
    (value) => {
      if (!trim(value)) {
        return "Postal code is required";
      }
      if (!/^[A-Za-z0-9\s-]{3,12}$/.test(trim(value))) {
        return "Enter a valid postal code";
      }
      return null;
    },

  optionalPassword:
    () =>
    (value) => {
      if (!trim(value)) {
        return null;
      }
      return getPasswordError(value);
    },

  email:
    () =>
    (value) => {
      if (!trim(value)) {
        return "Email is required";
      }
      if (!isEmail(value)) {
        return "Enter a valid email";
      }
      return null;
    },

  verificationCode:
    (length = 4) =>
    (value) => {
      const digits = String(value || "").replace(/\D/g, "");
      if (digits.length < length) {
        return `Enter the ${length}-digit code`;
      }
      return null;
    },

  cardNumber:
    () =>
    (value) => {
      const digits = trim(value).replace(/\s/g, "");
      if (!digits) {
        return "Card number is required";
      }
      if (!/^\d{13,19}$/.test(digits)) {
        return "Enter a valid card number";
      }
      return null;
    },

  expiryMonth:
    () =>
    (value) => {
      if (!trim(value)) {
        return "Month is required";
      }
      const month = Number(value);
      if (month < 1 || month > 12) {
        return "Enter a valid month (01–12)";
      }
      return null;
    },

  expiryYear:
    () =>
    (value) => {
      if (!trim(value)) {
        return "Year is required";
      }
      if (!/^\d{2,4}$/.test(trim(value))) {
        return "Enter a valid year";
      }
      return null;
    },

  cvv:
    () =>
    (value) => {
      if (!trim(value)) {
        return "CVV is required";
      }
      if (!/^\d{3,4}$/.test(trim(value))) {
        return "Enter a valid CVV";
      }
      return null;
    },

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

  rating:
    (min = 1) =>
    (value) => {
      if (!value || Number(value) < min) {
        return "Select a rating";
      }
      return null;
    },
};

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

export const hasValidationErrors = (errors) =>
  Object.values(errors).some(Boolean);

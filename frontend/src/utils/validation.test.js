import { describe, expect, it } from "vitest";
import {
  getPasswordError,
  hasValidationErrors,
  isEmail,
  isEmailOrPhone,
  isLoginIdentifier,
  isPhone,
  rules,
  schemas,
  validateForm,
  validatePriceRange,
} from "./validation";

describe("isEmail / isPhone / isEmailOrPhone", () => {
  it("validates email addresses", () => {
    expect(isEmail("user@example.com")).toBe(true);
    expect(isEmail("bad@mail")).toBe(false);
    expect(isEmail("  ")).toBe(false);
  });

  it("validates phone numbers by digit count", () => {
    expect(isPhone("+380 50 123 45 67")).toBe(true);
    expect(isPhone("123")).toBe(false);
    expect(isPhone("1".repeat(16))).toBe(false);
  });

  it("accepts email or phone depending on @ presence", () => {
    expect(isEmailOrPhone("user@example.com")).toBe(true);
    expect(isEmailOrPhone("+380501234567")).toBe(true);
    expect(isEmailOrPhone("username")).toBe(false);
  });
});

describe("isLoginIdentifier", () => {
  it("accepts username, email, or phone", () => {
    expect(isLoginIdentifier("artem_dev")).toBe(true);
    expect(isLoginIdentifier("user@example.com")).toBe(true);
    expect(isLoginIdentifier("+380501234567")).toBe(true);
    expect(isLoginIdentifier("a")).toBe(false);
  });
});

describe("getPasswordError", () => {
  it("returns user-friendly policy messages", () => {
    expect(getPasswordError("")).toBe("Password is required");
    expect(getPasswordError("short")).toBe("Use 8 to 20 characters");
    expect(getPasswordError("abcdefgh")).toBe("Include at least one digit");
    expect(getPasswordError("ABCDEFGH1")).toBe(
      "Include at least two lowercase letters",
    );
    expect(getPasswordError("abcdefgh12")).toBe(
      "Include at least two uppercase letters",
    );
    expect(getPasswordError("ABcdefgh12!")).toBe(
      "Use Latin letters and digits only",
    );
    expect(getPasswordError("ABcdefgh12")).toBeNull();
  });
});

describe("validateForm with schemas", () => {
  it("validates login schema", () => {
    const errors = validateForm(
      { emailOrPhone: "", password: "ab" },
      schemas.login,
    );

    expect(errors.emailOrPhone).toBe("Enter username, email or phone number");
    expect(errors.password).toBe("Password is too short");
  });

  it("accepts valid login payload", () => {
    const errors = validateForm(
      { emailOrPhone: "user@example.com", password: "secret" },
      schemas.login,
    );

    expect(errors).toEqual({});
  });

  it("validates password confirmation", () => {
    const errors = validateForm(
      { password: "Abcdefgh12", confirmPassword: "Abcdefgh13" },
      schemas.password,
    );

    expect(errors.confirmPassword).toBe("Passwords do not match");
  });

  it("validates address schema fields", () => {
    const errors = validateForm(
      {
        firstName: "A",
        lastName: "",
        country: "",
        phone: "123",
        address: "abc",
        city: "",
        postalCode: "1",
      },
      schemas.address,
    );

    expect(errors.firstName).toBe("First name must be at least 2 letters");
    expect(errors.lastName).toBe("Last name is required");
    expect(errors.phone).toBe("Enter a valid phone number");
    expect(errors.postalCode).toBe("Enter a valid postal code");
  });

  it("stops at the first failing rule per field", () => {
    const customSchema = {
      code: [rules.required("Required"), rules.verificationCode(4)],
    };

    const errors = validateForm({ code: "" }, customSchema);
    expect(errors.code).toBe("Required");
  });
  it("validates card number as exactly 16 digits", () => {
    expect(rules.cardNumber()("4111 1111 1111 4242")).toBeNull();
    expect(rules.cardNumber()("4111 1111 1111 424")).toBe(
      "Enter a 16-digit card number",
    );
    expect(rules.cardNumber()("4111 1111 1111 42421")).toBe(
      "Enter a 16-digit card number",
    );
  });
});

describe("validatePriceRange", () => {
  it("flags invalid min/max pairs", () => {
    expect(validatePriceRange("-1", "")).toEqual({
      minPrice: "Enter a valid minimum price",
    });
    expect(validatePriceRange("100", "50")).toEqual({
      maxPrice: "Max price must be greater than min",
    });
    expect(validatePriceRange("10", "100")).toEqual({});
  });
});

describe("hasValidationErrors", () => {
  it("detects any truthy field error", () => {
    expect(hasValidationErrors({ email: "Invalid" })).toBe(true);
    expect(hasValidationErrors({ email: "" })).toBe(false);
    expect(hasValidationErrors({})).toBe(false);
  });
});

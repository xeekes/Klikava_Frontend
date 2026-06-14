import { describe, expect, it } from "vitest";
import {
  CARD_NUMBER_DIGITS,
  formatAddressFieldInput,
  formatCardNumberInput,
  formatPhoneInput,
  formatPostalCodeInput,
} from "./inputFormatters";

describe("formatPhoneInput", () => {
  it("keeps digits only and limits length", () => {
    expect(formatPhoneInput("+380 (50) abc123-45-67")).toBe("380501234567");
    expect(formatPhoneInput("1".repeat(20))).toHaveLength(15);
  });
});

describe("formatCardNumberInput", () => {
  it("groups digits and caps at 16", () => {
    expect(formatCardNumberInput("4111abc1111 1111 4242")).toBe(
      "4111 1111 1111 4242",
    );
    const digits = formatCardNumberInput("1".repeat(20)).replace(/\s/g, "");
    expect(digits).toHaveLength(CARD_NUMBER_DIGITS);
  });
});

describe("formatPostalCodeInput", () => {
  it("removes invalid characters", () => {
    expect(formatPostalCodeInput("SW1A 1AA!@#")).toBe("SW1A 1AA");
  });
});

describe("formatAddressFieldInput", () => {
  it("sanitizes phone and postal code fields", () => {
    expect(formatAddressFieldInput("phone", "abc123")).toBe("123");
    expect(formatAddressFieldInput("postalCode", "12-34!")).toBe("12-34");
    expect(formatAddressFieldInput("city", "Kyiv")).toBe("Kyiv");
  });
});

import { describe, expect, it } from "vitest";
import {
  cardFromForm,
  decodeAddressItem,
  decodeCardItem,
  detectCardBrand,
  encodeAddressForm,
  encodeCardPayload,
  mapAuthUserToPersonalInfo,
  mapPersonalInfoToUserUpdate,
} from "./mapUserData";

describe("encodeAddressForm / decodeAddressItem", () => {
  const form = {
    firstName: "Artem",
    lastName: "Borisenko",
    country: "UA",
    phone: "+380501234567",
    address: "Khreshchatyk 1",
    city: "Kyiv",
    postalCode: "01001",
  };

  it("round-trips address metadata through address_line", () => {
    const encoded = encodeAddressForm(form);
    expect(encoded.address_line.startsWith("klikava_addr:")).toBe(true);

    const decoded = decodeAddressItem({ id: 12, address_line: encoded.address_line });
    expect(decoded).toEqual({ id: "12", ...form });
  });

  it("falls back to plain address_line when prefix is missing", () => {
    const decoded = decodeAddressItem({
      id: 3,
      address_line: "Simple street 5",
    });

    expect(decoded).toEqual({
      id: "3",
      firstName: "",
      lastName: "",
      country: "",
      phone: "",
      address: "Simple street 5",
      city: "",
      postalCode: "",
    });
  });

  it("falls back when encoded JSON is invalid", () => {
    const decoded = decodeAddressItem({
      id: 4,
      address_line: "klikava_addr:{broken",
    });

    expect(decoded.address).toBe("klikava_addr:{broken");
  });
});

describe("encodeCardPayload / decodeCardItem", () => {
  it("packs and unpacks card display fields", () => {
    const card = {
      brand: "visa",
      last4: "4242",
      expiryMonth: "12",
      expiryYear: "2030",
      label: "Work card",
      orderInList: 1,
    };

    const encoded = encodeCardPayload(card);
    expect(encoded).toEqual({
      card_info_encrypted: "visa|4242|12|2030|Work card",
      order_in_list: 1,
    });

    const decoded = decodeCardItem({
      id: 9,
      card_info_encrypted: encoded.card_info_encrypted,
    });

    expect(decoded).toEqual({
      id: "9",
      brand: "visa",
      last4: "4242",
      expiryMonth: "12",
      expiryYear: "2030",
      label: "Work card",
    });
  });

  it("uses defaults for empty card_info_encrypted", () => {
    const decoded = decodeCardItem({ id: 1 });

    expect(decoded.brand).toBe("card");
    expect(decoded.last4).toBe("0000");
    expect(decoded.label).toBe("Card");
  });
});

describe("mapAuthUserToPersonalInfo", () => {
  it("splits display name and maps email vs phone", () => {
    const result = mapAuthUserToPersonalInfo(
      {
        displayName: "Artem Borisenko",
        emailOrPhone: "artem@example.com",
        phone_number: "+380501234567",
        avatar_url: "https://cdn/avatar.png",
      },
      { city: "Kyiv" },
    );

    expect(result.firstName).toBe("Artem");
    expect(result.lastName).toBe("Borisenko");
    expect(result.email).toBe("artem@example.com");
    expect(result.phone).toBe("+380501234567");
    expect(result.avatar).toBe("https://cdn/avatar.png");
    expect(result.city).toBe("Kyiv");
  });

  it("returns current values when user is null", () => {
    const current = { firstName: "Keep" };
    expect(mapAuthUserToPersonalInfo(null, current)).toBe(current);
  });
});

describe("mapPersonalInfoToUserUpdate", () => {
  it("builds partial API update payload", () => {
    const result = mapPersonalInfoToUserUpdate({
      firstName: "Artem",
      lastName: "Borisenko",
      email: "artem@example.com",
      phone: "+380501234567",
    });

    expect(result).toEqual({
      name: "Artem Borisenko",
      email: "artem@example.com",
      phone_number: "+380501234567",
    });
  });

  it("omits empty fields", () => {
    expect(mapPersonalInfoToUserUpdate({ firstName: "", lastName: "" })).toEqual(
      {},
    );
  });
});

describe("detectCardBrand / cardFromForm", () => {
  it("detects Visa and Mastercard from leading digits", () => {
    expect(detectCardBrand("4111 1111")).toEqual({
      brand: "visa",
      label: "Visa",
    });
    expect(detectCardBrand("5500 0000")).toEqual({
      brand: "mastercard",
      label: "Mastercard",
    });
  });

  it("derives storable card summary from form input", () => {
    const result = cardFromForm({
      cardNumber: "4111 1111 1111 4242",
      month: "09",
      year: "2031",
    });

    expect(result).toEqual({
      brand: "visa",
      label: "Visa",
      last4: "4242",
      expiryMonth: "09",
      expiryYear: "2031",
    });
  });
});

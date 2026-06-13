/* Устаревшие статические фикстуры checkout (не используются при активном UserDataContext). */
export const MOCK_ADDRESSES = [
  {
    id: "addr-1",
    fullName: "Alex Buyer",
    phone: "+1 555 010 0001",
    lines: ["123 Market Street,", "Demo City, DC 10001,", "Demo Country"],
  },
  {
    id: "addr-2",
    fullName: "Alex Buyer",
    phone: "+1 555 010 0001",
    lines: ["123 Market Street,", "Demo City, DC 10001,", "Demo Country"],
  },
];
export const MOCK_PAYMENT_CARDS = [
  { id: "card-1", brand: "mastercard", label: "mastercard", last4: "9298" },
  { id: "card-2", brand: "visa", label: "visa", last4: "9298" },
  { id: "card-3", brand: "mastercard", label: "mastercard", last4: "5959" },
];
export const DEFAULT_BILLING_LINES = [
  "123 Market Street",
  "Demo City, DC 10001, Demo Country",
];
export const CHECKOUT_DELIVERY_FEE = 1;

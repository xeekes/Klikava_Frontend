const billing =
  "zoe tamayo, patterson-fletcher, 2349 court street, old monroe, mo 63369";

export const MOCK_ORDERS = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  sellerId: index < 3 ? 1 : 2,
  sku: "#65443",
  date: "27.04.25",
  status: "processing",
  billing,
  total: 56,
}));

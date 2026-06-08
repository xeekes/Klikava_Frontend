import { CATEGORIES } from "@storefront-data/categories.js";

const BRANDS = [
  "Aurora",
  "Velora",
  "Nordex",
  "Klikava",
  "Urbanex",
  "Lumina",
  "Craftline",
  "Pureform",
  "Stellar",
  "Harbor",
];

const getSlotsForCategory = (category) =>
  Math.max(4, Math.min(category.subcategories.length, 8));

const buildTitle = (id, category, slotIndex) => {
  const brand = BRANDS[(id * 3) % BRANDS.length];
  const line =
    category.subcategories[slotIndex % category.subcategories.length];
  return `${brand} ${line} ${1000 + id}`;
};

const buildPrice = (id, categoryIndex, slotIndex) =>
  19 + ((id * 47 + categoryIndex * 19 + slotIndex * 31) % 880);

const buildDate = (id) => {
  const day = String((id % 27) + 1).padStart(2, "0");
  const month = String((id % 12) + 1).padStart(2, "0");
  return `${day}.${month}.25`;
};

export const buildMockProducts = () => {
  const products = [];
  let id = 1;

  CATEGORIES.forEach((category, categoryIndex) => {
    const slotCount = getSlotsForCategory(category);

    for (let slotIndex = 0; slotIndex < slotCount; slotIndex += 1) {
      const subcategory =
        category.subcategories[slotIndex % category.subcategories.length];

      products.push({
        id,
        sellerId: ((id - 1) % 3) + 1,
        name: buildTitle(id, category, slotIndex),
        sku: `SKU-${String(id).padStart(5, "0")}`,
        stock: id % 9 === 0 ? "out of stock" : "in stock",
        price: buildPrice(id, categoryIndex, slotIndex),
        categories: category.name,
        tags: subcategory,
        date: buildDate(id),
      });

      id += 1;
    }
  });

  return products;
};

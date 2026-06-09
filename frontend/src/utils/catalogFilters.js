export const POPULAR_SEARCHES = [
  "phone",
  "bag",
  "ring",
  "lamp",
  "bear",
  "car",
];

export const sortProducts = (products, sortBy) => {
  const sorted = [...products];

  switch (sortBy) {
    case "price-low":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-high":
      return sorted.sort((a, b) => b.price - a.price);
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "sold":
      return sorted.sort((a, b) => b.sold - a.sold);
    case "popular":
    default:
      return sorted.sort((a, b) => b.sold - a.sold);
  }
};

export const filterProducts = (
  products,
  { minPrice, maxPrice, minRating, discountedOnly } = {},
) =>
  products.filter((product) => {
    if (discountedOnly && !product.discountPercent) {
      return false;
    }

    if (minPrice !== undefined && minPrice !== "" && product.price < Number(minPrice)) {
      return false;
    }

    if (maxPrice !== undefined && maxPrice !== "" && product.price > Number(maxPrice)) {
      return false;
    }

    if (minRating !== undefined && minRating !== "" && product.rating < Number(minRating)) {
      return false;
    }

    return true;
  });

import { getCategoryById } from "../data/categories";
import {
  filterProducts,
  POPULAR_SEARCHES,
  sortProducts,
} from "../data/products";

const defaultProductDetails = {
  sold: 422,
  recentLowestPrice: 80,
  colors: ["#d8c7a8", "#8f6f4f", "#3f6a5a", "#6a6f8f", "#2f2f2f"],
  imagesCount: 5,
  specs: [
    { label: "Material", value: "Corduroy" },
    { label: "Occasion", value: "Daily Commute" },
    { label: "Style", value: "Street" },
  ],
  tabs: [
    { id: "details", label: "Product Details" },
    { id: "shipping", label: "Shipping" },
    { id: "reviews", label: "Reviews" },
  ],
  shipping: {
    company: "nova post",
    deliveryTime: "7-18 business days",
    costs: "Free on all orders",
    stats: [],
  },
  reviews: [],
};

export const createCatalogHelpers = (products) => {
  const findProduct = (id) =>
    products.find((item) => String(item.id) === String(id)) || null;

  const getDiscountProducts = () =>
    products.filter(
      (product) =>
        typeof product.discountPercent === "number" && product.discountPercent > 0,
    );

  const getTopProducts = (topCategoryId = "all") => {
    const topProducts = products.filter((product) => product.isTop);

    if (topCategoryId === "all") {
      return topProducts.slice(0, 6);
    }

    const filtered = topProducts.filter(
      (product) => product.topCategoryId === topCategoryId,
    );

    if (filtered.length >= 6) {
      return filtered;
    }

    const usedIds = new Set(filtered.map((product) => product.id));
    return [
      ...filtered,
      ...topProducts.filter((product) => !usedIds.has(product.id)),
    ].slice(0, 6);
  };

  const getProductsByCategory = (categoryId, subcategory) => {
    let scoped = products.filter(
      (product) => String(product.categoryId) === String(categoryId),
    );

    if (subcategory) {
      scoped = scoped.filter((product) => product.subcategory === subcategory);
    }

    return scoped;
  };

  const getProductsForScope = (scope = {}) => {
    switch (scope.scope) {
      case "discounts":
        return getDiscountProducts();
      case "top":
        return getTopProducts(scope.topCategoryId || "all");
      case "category":
        if (!scope.categoryId) {
          return products;
        }
        return getProductsByCategory(scope.categoryId, scope.subcategory);
      default:
        return products;
    }
  };

  const searchProducts = (query, scope = {}) => {
    const pool = getProductsForScope(scope);
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return pool;
    }

    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

    return pool.filter((product) => {
      const haystack = [product.title, product.categoryName, product.subcategory]
        .join(" ")
        .toLowerCase();

      return tokens.every((token) => haystack.includes(token));
    });
  };

  const searchCategories = (query, categories = []) => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    return categories
      .filter((category) =>
        category.name.toLowerCase().includes(normalizedQuery),
      )
      .map((category) => ({
        categoryId: category.id,
        label: category.name,
        subcategory: null,
      }));
  };

  const getSearchSuggestions = (
    query,
    { productLimit = 5, categoryLimit = 4, categories = [], ...scope } = {},
  ) => {
    const normalizedQuery = query.trim();
    const showCategories = !scope.scope || scope.scope === "category";

    if (!normalizedQuery) {
      return {
        products: [],
        categories: [],
        popular: POPULAR_SEARCHES,
      };
    }

    return {
      products: searchProducts(normalizedQuery, scope).slice(0, productLimit),
      categories: showCategories
        ? searchCategories(normalizedQuery, categories).slice(0, categoryLimit)
        : [],
      popular: [],
    };
  };

  const getProductById = (id) => {
    const product = findProduct(id);
    if (!product) {
      return null;
    }

    const images = Array.from({ length: defaultProductDetails.imagesCount }, () =>
      typeof product.image === "string" ? product.image : product.image,
    );

    return {
      ...product,
      ...defaultProductDetails,
      images,
      sold: product.sold,
      price: product.price,
      recentLowestPrice: product.originalPrice ?? product.price,
      category: getCategoryById(product.categoryId),
    };
  };

  const getRelatedProducts = (id, limit = 8) => {
    const product = findProduct(id);

    if (!product) {
      return products.filter((item) => String(item.id) !== String(id)).slice(0, limit);
    }

    const sameCategory = products.filter(
      (item) =>
        String(item.id) !== String(id) &&
        item.categoryId === product.categoryId,
    );

    if (sameCategory.length >= limit) {
      return sameCategory.slice(0, limit);
    }

    const fallback = products.filter((item) => String(item.id) !== String(id));
    return [...sameCategory, ...fallback].slice(0, limit);
  };

  return {
    products,
    getDiscountProducts,
    getTopProducts,
    getProductsByCategory,
    getProductsForScope,
    searchProducts,
    getSearchSuggestions,
    getProductById,
    getRelatedProducts,
    filterProducts: (options) => filterProducts(products, options),
    sortProducts: (sortBy) => sortProducts(products, sortBy),
    POPULAR_SEARCHES,
  };
};

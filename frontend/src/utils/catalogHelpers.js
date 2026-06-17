/*
 * Pure catalog query helpers on top of a normalized product list
 * from CatalogContext (search, filters, related products, card enrichment).
 */
import {
  filterProducts,
  POPULAR_SEARCHES,
  sortProducts,
} from "./catalogFilters";
import {
  extractSpecsFromBackendRaw,
  getProductFeatures,
} from "../api/mapCatalogItem";

const DETAIL_TABS = [
  { id: "details", label: "Product Details" },
  { id: "shipping", label: "Shipping" },
  { id: "reviews", label: "Reviews" },
];

export const DEFAULT_PRODUCT_SHIPPING = {
  company: "Standard delivery",
  deliveryTime: "3–7 business days",
  costs: "Calculated at checkout",
  stats: [
    { label: "Delivered on time", percent: 94 },
    { label: "Shipped within 24h", percent: 88 },
  ],
};

/**
 * @param {object|null|undefined} shipping
 * @returns {object}
 */
export const resolveProductShipping = (shipping) => ({
  ...DEFAULT_PRODUCT_SHIPPING,
  ...(shipping || {}),
  stats:
    shipping?.stats?.length > 0
      ? shipping.stats
      : DEFAULT_PRODUCT_SHIPPING.stats,
});

export const buildDetailTabs = () => DETAIL_TABS;

/**
 * Collects the view model of the product page from the list cache and API details.
 * @param {object|null|undefined} base
 * @param {object} detailed
 * @returns {object}
 */
export const mergeProductDetailView = (base, detailed) => {
  const shipping = resolveProductShipping(detailed?.shipping ?? base?.shipping);
  const image =
    typeof detailed?.image === "string"
      ? detailed.image
      : typeof base?.image === "string"
        ? base.image
        : null;

  return {
    ...(base || {}),
    ...detailed,
    shipping,
    images: detailed?.images?.length
      ? detailed.images
      : base?.images?.length
        ? base.images
        : image
          ? [image]
          : [],
    colors: detailed?.colors?.length ? detailed.colors : base?.colors || [],
    tabs: buildDetailTabs(),
    specs: detailed?.specs?.length ? detailed.specs : base?.specs || [],
    reviews: detailed?.reviews?.length ? detailed.reviews : base?.reviews || [],
    sold: detailed?.sold ?? base?.sold,
    recentLowestPrice:
      detailed?.originalPrice ?? base?.recentLowestPrice ?? base?.price,
  };
};

/**
 * Creates a catalog helper API over a product list and optional category metadata.
 * @param {Array<object>} products
 * @param {Array<{ id: string|number, name: string }>} [categories]
 * @returns {object}
 */
export const createCatalogHelpers = (products, categories = []) => {
  /**
   * Finds a category entry by id.
   * @param {string|number} categoryId
   * @returns {object|null}
   */
  const findCategory = (categoryId) =>
    categories.find((item) => String(item.id) === String(categoryId)) || null;

  /**
   * Finds a product by id or slug in the linked list of products.
   * @param {string|number} idOrSlug
   * @returns {object|null}
   */
  const findProduct = (idOrSlug) =>
    products.find(
      (item) =>
        String(item.id) === String(idOrSlug) ||
        (item.slug && String(item.slug) === String(idOrSlug)),
    ) || null;

  /**
   * Returns items with a positive discountPercent.
   * @returns {Array<object>}
   */
  const getDiscountProducts = () =>
    products.filter(
      (product) =>
        typeof product.discountPercent === "number" &&
        product.discountPercent > 0,
    );

  /**
   * Returns up to six top products, optionally filtering by topCategoryId with additional ones.
   * @param {string} [topCategoryId]
   * @returns {Array<object>}
   */
  const getTopProducts = (topCategoryId = "all") => {
    const topProducts = products.filter((product) => product.isTop);
    if (topCategoryId === "all") {
      return topProducts.slice(0, 6);
    }
    const filtered = topProducts.filter(
      (product) =>
        String(product.categoryId) === String(topCategoryId) ||
        String(product.topCategoryId) === String(topCategoryId),
    );
    if (filtered.length >= 6) {
      return filtered.slice(0, 6);
    }
    const usedIds = new Set(filtered.map((product) => product.id));
    return [
      ...filtered,
      ...topProducts.filter((product) => !usedIds.has(product.id)),
    ].slice(0, 6);
  };

  /**
   * Returns products of a category, optionally narrowing by subcategory.
   * @param {string|number} categoryId
   * @param {string} [subcategory]
   * @returns {Array<object>}
   */
  const getProductsByCategory = (categoryId, subcategory) => {
    let scoped = products.filter(
      (product) => String(product.categoryId) === String(categoryId),
    );
    if (subcategory) {
      scoped = scoped.filter((product) => product.subcategory === subcategory);
    }
    return scoped;
  };

  /**
   * Defines a pool of products for the search scope or listing (discounts, top, category or all).
   * @param {{ scope?: string, topCategoryId?: string, categoryId?: string, subcategory?: string }} [scope]
   * @returns {Array<object>}
   */
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

  /**
   * Search by tokens in the name/category within the optional scope of the listing.
   * @param {string} query
   * @param {{ scope?: string, topCategoryId?: string, categoryId?: string, subcategory?: string }} [scope]
   * @returns {Array<object>}
   */
  const searchProducts = (query, scope = {}) => {
    const pool = getProductsForScope(scope);
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return pool;
    }
    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
    return pool.filter((product) => {
      const haystack = [
        product.title,
        product.categoryName,
        product.subcategory,
        ...getProductFeatures(product).map((entry) => entry.value),
      ]
        .join(" ")
        .toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    });
  };

  /**
   * Matches category names with the query for autocompletion suggestions.
   * @param {string} query
   * @param {Array<{ id: string|number, name: string }>} [categories]
   * @returns {Array<{ categoryId: string|number, label: string, subcategory: null }>}
   */
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

  /**
   * Generates suggestions for products, categories and popular queries for a drop-down search.
   * @param {string} query
   * @param {{ productLimit?: number, categoryLimit?: number, categories?: Array<object>, scope?: string, topCategoryId?: string, categoryId?: string, subcategory?: string }} [options]
   * @returns {{ products: Array<object>, categories: Array<object>, popular: Array<string> }}
   */
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

  /**
   * Returns the view model of the product card with default gallery tabs, characteristics and placeholders.
   * @param {string|number} idOrSlug
   * @returns {object|null}
   */
  const getProductById = (idOrSlug) => {
    const product = findProduct(idOrSlug);
    if (!product) {
      return null;
    }
    const image =
      typeof product.image === "string" ? product.image : product.image;
    return {
      ...product,
      images: product.images?.length ? product.images : image ? [image] : [],
      tabs: buildDetailTabs(),
    specs:
      product.specs?.length > 0
        ? product.specs
        : extractSpecsFromBackendRaw(product.backendRaw),
      reviews: product.reviews || [],
      colors: product.colors || [],
      recentLowestPrice: product.originalPrice ?? product.price,
      category: findCategory(product.categoryId),
      shipping: resolveProductShipping(product.shipping),
      description: product.description || "",
    };
  };

  /**
   * Returns related products from the same category with additional items from the full catalog if necessary.
   * @param {string|number} id
   * @param {number} [limit]
   * @returns {Array<object>}
   */
  const getRelatedProducts = (id, limit = 8) => {
    const product = findProduct(id);
    if (!product) {
      return products
        .filter((item) => String(item.id) !== String(id))
        .slice(0, limit);
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
    /** Applies price/rating/discount filters to a linked product list. */
    filterProducts: (options) => filterProducts(products, options),
    /** Sorts the linked list of products by the given key. */
    sortProducts: (sortBy) => sortProducts(products, sortBy),
    POPULAR_SEARCHES,
  };
};

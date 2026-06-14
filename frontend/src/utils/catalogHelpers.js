/*
 * Чистые хелперы запросов каталога поверх нормализованного списка товаров
 * из CatalogContext (поиск, фильтры, связанные товары, обогащение карточки).
 */
import {
  filterProducts,
  POPULAR_SEARCHES,
  sortProducts,
} from "./catalogFilters";

const DETAIL_TABS = [
  { id: "details", label: "Product Details" },
  { id: "shipping", label: "Shipping" },
  { id: "reviews", label: "Reviews" },
];

export const buildDetailTabs = (shipping) =>
  DETAIL_TABS.filter((tab) => tab.id !== "shipping" || shipping);

/**
 * Создаёт API хелперов каталога над списком товаров и опциональными метаданными категорий.
 * @param {Array<object>} products
 * @param {Array<{ id: string|number, name: string }>} [categories]
 * @returns {object}
 */
export const createCatalogHelpers = (products, categories = []) => {
  /**
   * Находит запись категории по id.
   * @param {string|number} categoryId
   * @returns {object|null}
   */
  const findCategory = (categoryId) =>
    categories.find((item) => String(item.id) === String(categoryId)) || null;

  /**
   * Находит товар по id в привязанном списке товаров.
   * @param {string|number} id
   * @returns {object|null}
   */
  const findProduct = (id) =>
    products.find((item) => String(item.id) === String(id)) || null;

  /**
   * Возвращает товары с положительным discountPercent.
   * @returns {Array<object>}
   */
  const getDiscountProducts = () =>
    products.filter(
      (product) =>
        typeof product.discountPercent === "number" &&
        product.discountPercent > 0,
    );

  /**
   * Возвращает до шести топ-товаров, опционально фильтруя по topCategoryId с добором.
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
   * Возвращает товары категории, опционально сужая по подкатегории.
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
   * Определяет пул товаров для scope поиска или листинга (скидки, топ, категория или все).
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
   * Поиск по токенам в названии/категории внутри опционального scope листинга.
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
      ]
        .join(" ")
        .toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    });
  };

  /**
   * Сопоставляет названия категорий с запросом для подсказок автодополнения.
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
   * Формирует подсказки товаров, категорий и популярных запросов для выпадающего поиска.
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
   * Возвращает view model карточки товара с вкладками, характеристиками и заглушками галереи по умолчанию.
   * @param {string|number} id
   * @returns {object|null}
   */
  const getProductById = (id) => {
    const product = findProduct(id);
    if (!product) {
      return null;
    }
    const image =
      typeof product.image === "string" ? product.image : product.image;
    return {
      ...product,
      images: product.images?.length ? product.images : image ? [image] : [],
      tabs: buildDetailTabs(product.shipping || null),
      specs: product.specs || [],
      reviews: product.reviews || [],
      colors: product.colors || [],
      recentLowestPrice: product.originalPrice ?? product.price,
      category: findCategory(product.categoryId),
      shipping: product.shipping || null,
      description: product.description || "",
    };
  };

  /**
   * Возвращает связанные товары из той же категории с добором из полного каталога при необходимости.
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
    /** Применяет фильтры цены/рейтинга/скидки к привязанному списку товаров. */
    filterProducts: (options) => filterProducts(products, options),
    /** Сортирует привязанный список товаров по заданному ключу. */
    sortProducts: (sortBy) => sortProducts(products, sortBy),
    POPULAR_SEARCHES,
  };
};

/*
 * Search URL builders and parsers: scope query parameters link SiteSearch
 * with discounts, top products or a specific catalog category.
 */
import { TOP_PRODUCT_CATEGORIES } from "../data/topCategories";

/**
 * Finds a category node by id in a flat array of categories.
 * @param {Array<{ id: string|number, name: string }>} categories
 * @param {string|number} categoryId
 * @returns {object|null}
 */
const findCategory = (categories, categoryId) =>
  categories.find((item) => String(item.id) === String(categoryId)) || null;

/**
 * Generates the URL /search with the request text and optional scope listing parameters.
 * @param {string} query
 * @param {{ scope?: string, topCategoryId?: string, categoryId?: string, subcategory?: string }} [scope]
 * @returns {string}
 */
export const buildSearchUrl = (query, scope = {}) => {
  const params = new URLSearchParams();
  const trimmed = query.trim();
  if (trimmed) {
    params.set("q", trimmed);
  }
  if (scope.scope === "discounts") {
    params.set("scope", "discounts");
  } else if (scope.scope === "top") {
    params.set("scope", "top");
    if (scope.topCategoryId && scope.topCategoryId !== "all") {
      params.set("topCategory", scope.topCategoryId);
    }
  } else if (scope.scope === "category" && scope.categoryId) {
    params.set("scope", "category");
    params.set("categoryId", scope.categoryId);
    if (scope.subcategory) {
      params.set("subcategory", scope.subcategory);
    }
  }
  const queryString = params.toString();
  return queryString ? `/search?${queryString}` : "/search";
};

/**
 * Parses scope search parameters from URLSearchParams into a scope object.
 * @param {URLSearchParams} searchParams
 * @returns {{ scope?: string, topCategoryId?: string, categoryId?: string, subcategory?: string }}
 */
export const parseSearchScope = (searchParams) => {
  const scope = searchParams.get("scope");
  if (!scope) {
    return {};
  }
  if (scope === "discounts") {
    return { scope: "discounts" };
  }
  if (scope === "top") {
    return {
      scope: "top",
      topCategoryId: searchParams.get("topCategory") || "all",
    };
  }
  if (scope === "category") {
    const categoryId = searchParams.get("categoryId");
    if (!categoryId) {
      return {};
    }
    return {
      scope: "category",
      categoryId,
      subcategory: searchParams.get("subcategory") || undefined,
    };
  }
  return {};
};

/**
 * Returns a human-readable signature of the active search scope for UI tooltips.
 * @param {{ scope?: string, topCategoryId?: string, categoryId?: string, subcategory?: string }} [scope]
 * @param {Array<{ id: string|number, name: string }>} [categories]
 * @returns {string}
 */
export const getSearchScopeLabel = (scope = {}, categories = []) => {
  if (scope.scope === "discounts") {
    return "discounted products";
  }
  if (scope.scope === "top") {
    if (scope.topCategoryId && scope.topCategoryId !== "all") {
      const category = TOP_PRODUCT_CATEGORIES.find(
        (item) => item.id === scope.topCategoryId,
      );
      return category ? `top products · ${category.name}` : "top products";
    }
    return "top products";
  }
  if (scope.scope === "category") {
    const category = findCategory(categories, scope.categoryId);
    if (!category) {
      return "this category";
    }
    if (scope.subcategory) {
      return `${category.name} · ${scope.subcategory}`;
    }
    return category.name;
  }
  return "all products";
};

/**
 * Returns true if a non-global search scope is active.
 * @param {{ scope?: string }} [scope]
 * @returns {boolean}
 */
export const hasSearchScope = (scope = {}) => Boolean(scope.scope);

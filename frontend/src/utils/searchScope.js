import { getCategoryById } from "../data/categories";
import { TOP_PRODUCT_CATEGORIES } from "../data/topCategories";

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

export const getSearchScopeLabel = (scope = {}) => {
  if (scope.scope === "discounts") {
    return "discounted products";
  }

  if (scope.scope === "top") {
    if (scope.topCategoryId && scope.topCategoryId !== "all") {
      const category = TOP_PRODUCT_CATEGORIES.find(
        (item) => item.id === scope.topCategoryId
      );
      return category
        ? `top products · ${category.name}`
        : "top products";
    }

    return "top products";
  }

  if (scope.scope === "category") {
    const category = getCategoryById(scope.categoryId);
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

export const hasSearchScope = (scope = {}) => Boolean(scope.scope);

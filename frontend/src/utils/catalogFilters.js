/* Утилиты сортировки и фильтрации для страниц каталога. */
import { getProductFeatures } from "../api/mapCatalogItem";

/** Популярные быстрые поисковые запросы при пустом поле ввода. */
export const POPULAR_SEARCHES = ["phone", "bag", "ring", "lamp", "bear", "car"];

/**
 * Собирает доступные значения характеристик из набора товаров.
 * @param {Array<object>} products
 * @param {Array<{ id: string|number, title?: string, isPrimary?: boolean }>} [featureCatalog]
 * @returns {Array<{ id: string, label: string, options: Array<{ value: string, count: number }> }>}
 */
export const buildFeatureFacets = (products, featureCatalog = []) => {
  const catalogMeta = new Map(
    featureCatalog.map((feature, index) => [
      String(feature.id),
      {
        label: feature.title || "Feature",
        isPrimary: Boolean(feature.isPrimary),
        order: index,
      },
    ]),
  );
  const facetMap = new Map();

  products.forEach((product) => {
    getProductFeatures(product).forEach((entry) => {
      const featureId = String(entry.featureId);
      const value = String(entry.value || "").trim();
      if (!value) {
        return;
      }
      const meta = catalogMeta.get(featureId);
      if (!facetMap.has(featureId)) {
        facetMap.set(featureId, {
          id: featureId,
          label: meta?.label || entry.label || "Feature",
          isPrimary: meta?.isPrimary ?? entry.isPrimary ?? false,
          order: meta?.order ?? 999,
          values: new Map(),
        });
      }
      const facet = facetMap.get(featureId);
      facet.values.set(value, (facet.values.get(value) || 0) + 1);
    });
  });

  return Array.from(facetMap.values())
    .sort((left, right) => {
      if (left.isPrimary !== right.isPrimary) {
        return left.isPrimary ? -1 : 1;
      }
      if (left.order !== right.order) {
        return left.order - right.order;
      }
      return left.label.localeCompare(right.label);
    })
    .map((facet) => ({
      id: facet.id,
      label: facet.label,
      options: Array.from(facet.values.entries())
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([value, count]) => ({ value, count })),
    }))
    .filter((facet) => facet.options.length > 0);
};

/**
 * Фильтрует товары по выбранным значениям характеристик.
 * @param {Array<object>} products
 * @param {Record<string, string[]>} selectedFeatures
 * @returns {Array<object>}
 */
export const filterProductsByFeatures = (products, selectedFeatures = {}) => {
  const activeGroups = Object.entries(selectedFeatures).filter(
    ([, values]) => Array.isArray(values) && values.length > 0,
  );
  if (!activeGroups.length) {
    return products;
  }

  return products.filter((product) => {
    const featureMap = new Map(
      getProductFeatures(product).map((entry) => [
        String(entry.featureId),
        entry.value,
      ]),
    );
    return activeGroups.every(([featureId, values]) =>
      values.some((value) => featureMap.get(String(featureId)) === value),
    );
  });
};

/**
 * Возвращает новый массив, отсортированный по выбранному ключу каталога.
 * @param {Array<{ price: number, rating: number, sold: number }>} products
 * @param {string} sortBy
 * @returns {Array<object>}
 */
export const sortProducts = (products, sortBy) => {
  const readPrice = (product) => Number(product?.price) || 0;
  const readRating = (product) => Number(product?.rating) || 0;
  const readSold = (product) => Number(product?.sold) || 0;
  const sorted = [...products];
  switch (sortBy) {
    case "price-low":
      return sorted.sort((a, b) => readPrice(a) - readPrice(b));
    case "price-high":
      return sorted.sort((a, b) => readPrice(b) - readPrice(a));
    case "rating":
      return sorted.sort((a, b) => readRating(b) - readRating(a));
    case "sold":
      return sorted.sort((a, b) => readSold(b) - readSold(a));
    case "popular":
    default:
      return sorted.sort((a, b) => readSold(b) - readSold(a));
  }
};

/**
 * Фильтрует товары по диапазону цены, минимальному рейтингу и флагу «только со скидкой».
 * @param {Array<{ price: number, rating: number, discountPercent?: number }>} products
 * @param {{ minPrice?: string|number, maxPrice?: string|number, minRating?: string|number, discountedOnly?: boolean }} [options]
 * @returns {Array<object>}
 */
export const filterProducts = (
  products,
  { minPrice, maxPrice, minRating, discountedOnly } = {},
) =>
  products.filter((product) => {
    if (discountedOnly && !product.discountPercent) {
      return false;
    }
    if (
      minPrice !== undefined &&
      minPrice !== "" &&
      product.price < Number(minPrice)
    ) {
      return false;
    }
    if (
      maxPrice !== undefined &&
      maxPrice !== "" &&
      product.price > Number(maxPrice)
    ) {
      return false;
    }
    if (
      minRating !== undefined &&
      minRating !== "" &&
      product.rating < Number(minRating)
    ) {
      return false;
    }
    return true;
  });

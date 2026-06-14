/*
 * Антикоррупционный слой: преобразует вложенные структуры product/category FastAPI
 * в плоскую модель товара, используемую в UI каталога.
 */
import {
  pickPlaceholderGallery,
  pickPlaceholderImage,
} from "../assets/productPlaceholderImages";

/**
 * Определяет URL изображения товара из вложенных полей picture или локальных заглушек.
 * @param {object} item
 * @param {number} index
 * @returns {string}
 */
export const pickImage = (item, index) => {
  const pictures =
    item?.pictures ||
    item?.current_version?.pictures ||
    item?.versions?.[0]?.pictures ||
    [];
  const url =
    pictures[0]?.url ||
    pictures[0]?.image_url ||
    pictures[0]?.path ||
    pictures[0]?.file_url ||
    pictures[0]?.thumbnail_url ||
    pictures[0]?.preview_url ||
    pictures[0]?.original_url ||
    item?.image_url ||
    item?.image;
  if (typeof url === "string" && url.length > 0) {
    return url;
  }
  const seed = item?.id ?? item?.product_id ?? index;
  return pickPlaceholderImage(seed);
};

/**
 * Собирает галерею товара из API или локальных webp-заглушек.
 * @param {object} item
 * @param {number} [index]
 * @param {number} [count]
 * @returns {string[]}
 */
export const pickProductImages = (item, index = 0, count = 3) => {
  const pictures =
    item?.pictures ||
    item?.current_version?.pictures ||
    item?.versions?.[0]?.pictures ||
    [];
  const apiImages = pictures
    .map(
      (picture) =>
        picture?.url ||
        picture?.image_url ||
        picture?.path ||
        picture?.file_url ||
        picture?.thumbnail_url ||
        picture?.preview_url ||
        picture?.original_url,
    )
    .filter((url) => typeof url === "string" && url.length > 0);
  if (apiImages.length) {
    return apiImages;
  }
  const seed = item?.id ?? item?.product_id ?? index;
  return pickPlaceholderGallery(seed, count);
};

/**
 * Извлекает отображаемое название из вложенных полей version или name.
 * @param {object} item
 * @returns {string}
 */
export const pickTitle = (item) =>
  item?.title ||
  item?.current_version?.title ||
  item?.versions?.[0]?.title ||
  item?.name ||
  `Product ${item?.id ?? "?"}`;

/**
 * Читает актуальную цену продажи из первого доступного варианта или полей price верхнего уровня.
 * @param {object} item
 * @returns {number}
 */
const pickPrice = (item) => {
  const variant =
    item?.variants?.[0] ||
    item?.current_version?.variants?.[0] ||
    item?.versions?.[0]?.variants?.[0];
  const raw =
    variant?.final_price ??
    variant?.price ??
    item?.price ??
    item?.current_version?.price ??
    item?.min_price;
  const price = Number(raw);
  return Number.isFinite(price) ? price : 0;
};

/**
 * Вычисляет цену со скидкой, зачёркнутую оригинальную и процент скидки из данных варианта.
 * @param {object} item
 * @param {number} price
 * @returns {{ price: number, originalPrice?: number, discountPercent?: number }}
 */
const pickDiscount = (item, price) => {
  const variant =
    item?.variants?.[0] ||
    item?.current_version?.variants?.[0] ||
    item?.versions?.[0]?.variants?.[0];
  const discount = Number(variant?.discount ?? item?.discount ?? 0);
  if (!discount || discount <= 0 || price <= 0) {
    return {
      price,
      originalPrice: undefined,
      discountPercent: undefined,
    };
  }
  /* Бэкенд отдаёт финальную цену и % скидки; выводим зачёркнутую оригинальную для UI. */
  const originalPrice = Number((price / (1 - discount / 100)).toFixed(2));
  return {
    price,
    originalPrice,
    discountPercent: discount,
  };
};

/**
 * Преобразует произвольный текст в URL-safe slug для маршрутов товара.
 * @param {string} value
 * @returns {string}
 */
const slugify = (value) =>
  String(value || "item")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * Преобразует запись категории бэкенда в плоскую модель для навигации и фильтров.
 * @param {object} category
 * @returns {object}
 */
export const mapBackendCategory = (category) => ({
  id: String(category.id),
  backendId: category.id,
  name: category.title || category.name || "Category",
  description: category.description || "",
  parentId: category.parent_id ?? null,
  subcategories: category.subcategories || [],
});

/**
 * Преобразует вложенный товар бэкенда в форму карточки каталога с ценой и категорией.
 * @param {object} item
 * @param {number} [index]
 * @param {Map<number|string, object>} [categoryLookup]
 * @returns {object}
 */
const pickFirstVariantId = (item) => {
  const variant =
    item?.variants?.[0] ||
    item?.current_version?.variants?.[0] ||
    item?.versions?.[0]?.variants?.[0];
  return variant?.id ?? null;
};

export const mapBackendProduct = (
  item,
  index = 0,
  categoryLookup = new Map(),
) => {
  const title = pickTitle(item);
  const basePrice = pickPrice(item);
  const pricing = pickDiscount(item, basePrice);
  const categoryId =
    item?.category_id ??
    item?.current_version?.category_id ??
    item?.versions?.[0]?.category_id;
  const embeddedCategory = item?.current_version?.category;
  const category =
    categoryLookup.get(categoryId) ||
    (embeddedCategory ? mapBackendCategory(embeddedCategory) : null);
  const images = pickProductImages(item, index);
  return {
    id: item?.id ?? item?.product_id ?? `api-${index}`,
    slug: item?.slug || item?.current_version?.slug || slugify(title),
    title,
    image: pickImage(item, index),
    images,
    ...pricing,
    categoryId: category ? String(category.id) : "all",
    categoryName: category?.name || "Catalog",
    subcategory: category?.name || "General",
    topCategoryId: category ? String(category.id) : "all",
    isTop: Boolean(item?.is_top ?? item?.is_popular ?? false),
    variantId: pickFirstVariantId(item),
    sold:
      item?.sold !== undefined && item?.sold !== null
        ? Number(item.sold)
        : undefined,
    rating:
      item?.rating !== undefined && item?.rating !== null
        ? Number(item.rating)
        : item?.average_rating !== undefined
          ? Number(item.average_rating)
          : undefined,
    features: extractFeaturesFromBackendRaw(item),
    backendRaw: item,
  };
};

/**
 * Преобразует массив товаров бэкенда с общим lookup категорий и индексами списка.
 * @param {Array<object>} [items]
 * @param {Map<number|string, object>} [categoryLookup]
 * @returns {Array<object>}
 */
export const mapBackendProductList = (items = [], categoryLookup = new Map()) =>
  items.map((item, index) => mapBackendProduct(item, index, categoryLookup));

/**
 * Преобразует запись отзыва бэкенда в формат страницы товара.
 * @param {object} review
 * @returns {object}
 */
export const mapBackendReview = (review) => ({
  id: review.id,
  userId: review.user_id ?? null,
  author: review.author_name || `User ${review.user_id ?? ""}`.trim(),
  rating: Number(review.rating) || 0,
  text: review.comment || "",
  date: review.created_at,
});

/**
 * Достаёт нормализованные характеристики варианта из сырого ответа API.
 * @param {object|null|undefined} raw
 * @returns {Array<{ featureId: string|number, label: string, value: string, isPrimary: boolean }>}
 */
export const extractFeaturesFromBackendRaw = (raw) => {
  const variant =
    raw?.current_version?.variants?.[0] || raw?.variants?.[0] || null;
  return (variant?.features || [])
    .map((entry) => ({
      featureId: entry.feature_id ?? entry.feature?.id,
      label: entry.feature?.title || "Feature",
      value: String(entry.value || "").trim(),
      isPrimary: Boolean(entry.feature?.is_primary),
    }))
    .filter((entry) => entry.featureId && entry.value);
};

/**
 * @param {object} product
 * @returns {Array<{ featureId: string|number, label: string, value: string, isPrimary: boolean }>}
 */
export const getProductFeatures = (product) => {
  if (product?.features?.length) {
    return product.features;
  }
  return extractFeaturesFromBackendRaw(product?.backendRaw);
};

/**
 * Разворачивает features варианта в строки характеристик label/value для страницы товара.
 * @param {object|null|undefined} variant
 * @returns {Array<{ label: string, value: string }>}
 */
export const mapVariantFeaturesToSpecs = (variant) =>
  (variant?.features || []).map((entry) => ({
    label: entry.feature?.title || "Feature",
    value: entry.value || "",
  }));

/**
 * Достаёт характеристики из сырого ответа списка/детали товара.
 * @param {object|null|undefined} raw
 * @returns {Array<{ label: string, value: string }>}
 */
export const extractSpecsFromBackendRaw = (raw) => {
  const variant =
    raw?.current_version?.variants?.[0] || raw?.variants?.[0] || null;
  return mapVariantFeaturesToSpecs(variant);
};

/**
 * Применяет отдельные правила скидок (категория, продавец, товар) к ценам товаров.
 * @param {Array<object>} products
 * @param {Array<object>} [discounts]
 * @returns {Array<object>}
 */
export const applyCatalogDiscounts = (products, discounts = []) => {
  if (!discounts.length) {
    return products;
  }
  const activeDiscounts = discounts.filter((item) => item.is_active !== false);
  return products.map((product) => {
    const sellerId = product.backendRaw?.seller_id;
    const categoryId = Number(product.categoryId);
    let bestPercent = Number(product.discountPercent) || 0;
    activeDiscounts.forEach((discount) => {
      const value = Number(discount.value);
      if (!Number.isFinite(value) || value <= 0) {
        return;
      }
      const matchesCategory =
        discount.target_type === "CATEGORY" &&
        Number(discount.target_id) === categoryId;
      const matchesSeller =
        discount.target_type === "SELLER" &&
        Number(discount.target_id) === sellerId;
      const matchesProduct =
        discount.target_type === "PRODUCT" &&
        Number(discount.target_id) === Number(product.id);
      if (matchesCategory || matchesSeller || matchesProduct) {
        bestPercent = Math.max(bestPercent, value);
      }
    });
    if (bestPercent <= 0) {
      return product;
    }
    const basePrice = Number(product.originalPrice ?? product.price) || 0;
    if (basePrice <= 0) {
      return { ...product, discountPercent: bestPercent };
    }
    const price = Number((basePrice * (1 - bestPercent / 100)).toFixed(2));
    return {
      ...product,
      price,
      originalPrice: basePrice,
      discountPercent: bestPercent,
    };
  });
};

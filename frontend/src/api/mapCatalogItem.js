/*
 * Anti-corruption layer: converts nested product/category FastAPI structures
 * into a flat product model used in the catalog UI.
 */
import {
  pickPlaceholderGallery,
  pickPlaceholderImage,
} from "../assets/productPlaceholderImages";
import { resolveMediaUrl } from "./client";

/**
 * Normalizes the product image URL via the origin API.
 * @param {string|null|undefined} url
 * @returns {string}
 */
const normalizeProductImageUrl = (url) => {
  const resolved = resolveMediaUrl(url);
  return typeof resolved === "string" ? resolved : "";
};

/**
 * Determines the product image URL from nested picture fields or local stubs.
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
    return normalizeProductImageUrl(url);
  }
  const seed = item?.id ?? item?.product_id ?? index;
  return pickPlaceholderImage(seed);
};

/**
 * Collects a product gallery from the API or local webp stubs.
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
    .map((pictureUrl) => normalizeProductImageUrl(pictureUrl))
    .filter((url) => url.length > 0);
  if (apiImages.length) {
    return apiImages;
  }
  const seed = item?.id ?? item?.product_id ?? index;
  return pickPlaceholderGallery(seed, count);
};

/**
 * Retrieves the display name from the version or name nested fields.
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
 * Reads the current sale price from the first available option or top-level price fields.
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
 * Calculates the discounted price, the original strikethrough, and the discount percentage from the variant data.
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
  /* The backend gives the final price and % discount; We display the crossed out original one for the UI. */
  const originalPrice = Number((price / (1 - discount / 100)).toFixed(2));
  return {
    price,
    originalPrice,
    discountPercent: discount,
  };
};

/**
 * Converts arbitrary text into a URL-safe slug for product routes.
 * @param {string} value
 * @returns {string}
 */
const slugify = (value) =>
  String(value || "item")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * Converts a backend category entry into a flat model for navigation and filters.
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
 * Converts the attached backend product into the form of a catalog card with price and category.
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
    slug:
      item?.slug ||
      item?.current_version?.slug ||
      item?.versions?.[0]?.slug ||
      slugify(title),
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
 * Converts an array of backend products with a general lookup of categories and list indexes.
 * @param {Array<object>} [items]
 * @param {Map<number|string, object>} [categoryLookup]
 * @returns {Array<object>}
 */
export const mapBackendProductList = (items = [], categoryLookup = new Map()) =>
  items.map((item, index) => mapBackendProduct(item, index, categoryLookup));

/**
 * Converts a backend review record to a product page format.
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
 * Retrieves the normalized characteristics of a variant from the raw API response.
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
 * Expands the variant's features into label/value characteristic lines for the product page.
 * @param {object|null|undefined} variant
 * @returns {Array<{ label: string, value: string }>}
 */
export const mapVariantFeaturesToSpecs = (variant) =>
  (variant?.features || []).map((entry) => ({
    label: entry.feature?.title || "Feature",
    value: entry.value || "",
  }));

/**
 * Extracts characteristics from the raw list response/product details.
 * @param {object|null|undefined} raw
 * @returns {Array<{ label: string, value: string }>}
 */
export const extractSpecsFromBackendRaw = (raw) => {
  const variant =
    raw?.current_version?.variants?.[0] || raw?.variants?.[0] || null;
  return mapVariantFeaturesToSpecs(variant);
};

/**
 * Applies individual discount rules (category, seller, product) to product prices.
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

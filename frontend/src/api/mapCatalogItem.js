import bagImage from "../assets/images/bag.png";
import phoneImage from "../assets/images/phone.png";
import carImage from "../assets/images/car.png";

const FALLBACK_IMAGES = [bagImage, phoneImage, carImage];

const pickImage = (item, index) => {
  const pictures =
    item?.pictures ||
    item?.current_version?.pictures ||
    item?.versions?.[0]?.pictures ||
    [];

  const url =
    pictures[0]?.url ||
    pictures[0]?.image_url ||
    pictures[0]?.path ||
    item?.image_url ||
    item?.image;

  if (typeof url === "string" && url.length > 0) {
    return url.startsWith("http") ? url : url;
  }

  return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
};

const pickTitle = (item) =>
  item?.title ||
  item?.current_version?.title ||
  item?.versions?.[0]?.title ||
  item?.name ||
  `Product ${item?.id ?? "?"}`;

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

  const originalPrice = Number((price / (1 - discount / 100)).toFixed(2));

  return {
    price,
    originalPrice,
    discountPercent: discount,
  };
};

const slugify = (value) =>
  String(value || "item")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const mapBackendCategory = (category) => ({
  id: String(category.id),
  backendId: category.id,
  name: category.title || category.name || "Category",
  description: category.description || "",
  parentId: category.parent_id ?? null,
  subcategories: category.subcategories || [],
});

export const mapBackendProduct = (item, index = 0, categoryLookup = new Map()) => {
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

  return {
    id: item?.id ?? item?.product_id ?? `api-${index}`,
    slug: item?.slug || item?.current_version?.slug || slugify(title),
    title,
    image: pickImage(item, index),
    ...pricing,
    categoryId: category ? String(category.id) : "all",
    categoryName: category?.name || "Catalog",
    subcategory: category?.name || "General",
    topCategoryId: "all",
    isTop: index < 12,
    sold: Number(item?.sold ?? item?.stock ?? 100 + index * 3),
    rating: Number(item?.rating ?? 4.2),
    backendRaw: item,
  };
};

export const mapBackendProductList = (items = [], categoryLookup = new Map()) =>
  items.map((item, index) => mapBackendProduct(item, index, categoryLookup));

export const mapBackendReview = (review) => ({
  id: review.id,
  author: `User ${review.user_id ?? ""}`.trim(),
  rating: Number(review.rating) || 0,
  text: review.comment || "",
  date: review.created_at,
});

export const mapVariantFeaturesToSpecs = (variant) =>
  (variant?.features || []).map((entry) => ({
    label: entry.feature?.title || "Feature",
    value: entry.value || "",
  }));

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

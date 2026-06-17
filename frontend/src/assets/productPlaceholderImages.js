/*
 * Local product stubs until the backend returns pictures.
 * Add .webp to assets/images/products/ - Vite will pick it up automatically.
 */
const placeholderModules = import.meta.glob("./images/products/*.webp", {
  eager: true,
  import: "default",
});

/** @type {string[]} */
export const PRODUCT_PLACEHOLDER_IMAGES = Object.keys(placeholderModules)
  .sort()
  .map((path) => placeholderModules[path]);

/**
 * @param {number|string} seed
 * @param {number} [offset]
 * @returns {string}
 */
export const pickPlaceholderImage = (seed, offset = 0) => {
  if (!PRODUCT_PLACEHOLDER_IMAGES.length) {
    return "";
  }
  const numericSeed = Number(seed);
  const base = Number.isFinite(numericSeed) ? numericSeed : 0;
  const index =
    Math.abs(base + offset) % PRODUCT_PLACEHOLDER_IMAGES.length;
  return PRODUCT_PLACEHOLDER_IMAGES[index];
};

/**
 * @param {number|string} seed
 * @param {number} [count]
 * @returns {string[]}
 */
export const pickPlaceholderGallery = (seed, count = 3) => {
  if (!PRODUCT_PLACEHOLDER_IMAGES.length || count <= 0) {
    return [];
  }
  const gallery = [];
  for (let offset = 0; offset < count; offset += 1) {
    gallery.push(pickPlaceholderImage(seed, offset));
  }
  return [...new Set(gallery)];
};

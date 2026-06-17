/**
 * Builds a product page route: prefers slug from product_version, otherwise id.
 * @param {{ slug?: string|null, id?: string|number|null }|null|undefined} product
 * @returns {string}
 */
export const getProductPath = (product) => {
  const segment = product?.slug || product?.id || product?.productId;
  return segment ? `/product/${segment}` : "/catalog";
};

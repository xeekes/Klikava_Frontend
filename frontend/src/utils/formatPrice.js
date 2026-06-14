/**
 * Цена в пузырьках OfferBubble — только целое число (без копеек).
 * @param {number|string} price
 * @returns {string}
 */
export const formatBubblePrice = (price) => {
  const numeric =
    typeof price === "number"
      ? price
      : Number(String(price).replace(/[^0-9.-]/g, ""));

  if (!Number.isFinite(numeric)) {
    return "0$";
  }

  return `${Math.floor(numeric)}$`;
};

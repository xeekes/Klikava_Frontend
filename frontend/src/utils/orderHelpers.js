/* Вспомогательные функции нормализации данных карточки заказа для legacy- и новых форматов. */

/**
 * Нормализует позиции заказа из массива products или legacy-списка images.
 * @param {{ products?: Array<object>, images?: string[], id?: string, productTitle?: string, productId?: string }|null|undefined} order
 * @returns {Array<object>}
 */
export const getOrderProducts = (order) => {
  if (!order) {
    return [];
  }
  if (order.products?.length) {
    return order.products;
  }
  return (order.images || []).map((image, index) => ({
    id: `${order.id}-item-${index}`,
    title: order.productTitle || "Product",
    image,
    productId: order.productId,
  }));
};

/**
 * Определяет id товара для действия «купить снова» на карточке заказа.
 * @param {{ productId?: string, products?: Array<{ productId?: string }>, images?: string[] }|null|undefined} order
 * @returns {string|null}
 */
export const getBuyAgainProductId = (order) => {
  if (order?.productId) {
    return order.productId;
  }
  const products = getOrderProducts(order);
  return products[0]?.productId ?? null;
};

/**
 * Фильтрует список заказов по статусу вкладки заказов профиля.
 * @param {Array<{ status: string }>} orders
 * @param {string} tab
 * @returns {Array<object>}
 */
export const filterOrdersByTabFromList = (orders, tab) => {
  if (!tab || tab === "all") {
    return orders;
  }
  return orders.filter((order) => order.status === tab);
};

/**
 * Находит один заказ в списке по id.
 * @param {Array<{ id: string }>} orders
 * @param {string} orderId
 * @returns {object|undefined}
 */
export const getOrderByIdFromList = (orders, orderId) =>
  orders.find((order) => order.id === orderId);

/**
 * Возвращает id кнопок действий, доступных для заказов на вкладке с данным статусом.
 * @param {string} tab
 * @returns {Array<string>}
 */
export const getOrderActions = (tab) => {
  if (tab === "processing" || tab === "sent") {
    return ["track", "buy-again"];
  }
  if (tab === "return") {
    return ["track", "review", "buy-again"];
  }
  return ["track", "review", "return", "buy-again"];
};

/* Вспомогательные функции нормализации данных карточки заказа для legacy- и новых форматов. */

/**
 * Нормализует позиции заказа из массива products или legacy-списка images.
 * @param {{ products?: Array<object>, images?: string[], image?: string, id?: string, productTitle?: string, productId?: string }|null|undefined} order
 * @returns {Array<object>}
 */
export const getOrderProducts = (order) => {
  if (!order) {
    return [];
  }
  if (order.products?.length) {
    return order.products;
  }
  const legacyImage = order.image || order.images?.find(Boolean);
  if (!legacyImage) {
    return [];
  }
  return [
    {
      id: `${order.id}-item-0`,
      title: order.productTitle || "Product",
      image: legacyImage,
      productId: order.productId,
    },
  ];
};

/**
 * Возвращает картинку первого товара в заказе.
 * @param {{ products?: Array<object>, images?: string[], image?: string, productId?: string }|null|undefined} order
 * @param {Array<{ id: string|number, image?: string }>} [catalogProducts]
 * @param {Array<{ productId: string|number, image?: string }>} [cartItems]
 * @returns {string|null}
 */
export const getOrderCoverImage = (
  order,
  catalogProducts = [],
  cartItems = [],
) => {
  if (!order) {
    return null;
  }
  if (order.image) {
    return order.image;
  }
  const products = getOrderProducts(order);
  const firstItem = products[0];
  if (firstItem?.image) {
    return firstItem.image;
  }
  const legacyImage = order.images?.find(Boolean);
  if (legacyImage) {
    return legacyImage;
  }
  const productId = firstItem?.productId ?? order.productId;
  if (productId) {
    const catalogImage = catalogProducts.find(
      (product) => String(product.id) === String(productId),
    )?.image;
    if (catalogImage) {
      return catalogImage;
    }
    const cartImage = cartItems.find(
      (item) => String(item.productId) === String(productId),
    )?.image;
    if (cartImage) {
      return cartImage;
    }
  }
  const variantId = firstItem?.variantId;
  if (variantId) {
    const variantImage = catalogProducts.find(
      (product) => String(product.variantId) === String(variantId),
    )?.image;
    if (variantImage) {
      return variantImage;
    }
  }
  return cartItems[0]?.image ?? null;
};

/**
 * Добавляет на заказ поле image с обложкой первого товара.
 * @param {object} order
 * @param {{ catalogProducts?: Array<object>, cartItems?: Array<object> }} [options]
 * @returns {object}
 */
export const withOrderCoverImage = (order, options = {}) => {
  const image = getOrderCoverImage(
    order,
    options.catalogProducts,
    options.cartItems,
  );
  return image ? { ...order, image } : order;
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
  orders.find((order) => String(order.id) === String(orderId));

/** Статусы заказа, после которых бэкенд разрешает оставить отзыв. */
export const REVIEW_ELIGIBLE_ORDER_STATUSES = new Set(["delivered", "return"]);

/**
 * Проверяет, есть ли в заказе товар с указанным productId или variantId.
 * @param {object} order
 * @param {string|number|null|undefined} productId
 * @param {string|number|null|undefined} variantId
 * @returns {boolean}
 */
export const orderContainsProduct = (order, productId, variantId) => {
  const products = getOrderProducts(order);
  return products.some((item) => {
    if (
      productId &&
      item.productId &&
      String(item.productId) === String(productId)
    ) {
      return true;
    }
    if (
      variantId &&
      item.variantId &&
      String(item.variantId) === String(variantId)
    ) {
      return true;
    }
    return false;
  });
};

/**
 * Находит доставленный заказ с товаром, по которому можно оставить отзыв.
 * @param {Array<object>} orders
 * @param {string|number|null|undefined} productId
 * @param {string|number|null|undefined} variantId
 * @returns {object|undefined}
 */
export const findEligibleReviewOrderForProduct = (
  orders,
  productId,
  variantId,
) =>
  orders.find(
    (order) =>
      REVIEW_ELIGIBLE_ORDER_STATUSES.has(order.status) &&
      orderContainsProduct(order, productId, variantId),
  );

/**
 * Может ли пользователь оставить отзыв на товар со страницы товара.
 * @param {Array<object>} orders
 * @param {string|number|null|undefined} productId
 * @param {string|number|null|undefined} variantId
 * @returns {boolean}
 */
export const canUserReviewProduct = (orders, productId, variantId) =>
  Boolean(findEligibleReviewOrderForProduct(orders, productId, variantId));

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

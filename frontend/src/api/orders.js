/*
 * Buyer orders API: creation, list, details, shipments.
 */
import { catalogApi } from "./catalogApi";
import { apiRequest } from "./client";
import { createLazyMockApi } from "./createLazyMockApi";
import { getListItems } from "./listUtils";
import { mapBackendOrder, mapBackendShipment } from "./mapOrder";

/**
 * Collects order creation payload from cart items.
 * @param {Array<object>} cartItems
 * @param {{ deliveryPrice?: number, discountItemId?: number|null }} [options]
 * @returns {Promise<object>}
 */
const buildOrderCreatePayload = async (
  cartItems,
  { deliveryPrice = 0, discountItemId = null } = {},
) => {
  const items = [];
  for (const item of cartItems) {
    let variantId = item.variantId;
    if (!variantId) {
      const raw = await catalogApi.getProductByIdOrSlug(item.productId);
      variantId =
        raw?.current_version?.variants?.[0]?.id ??
        raw?.variants?.[0]?.id ??
        null;
    }
    if (!variantId) {
      throw new Error(`Unable to resolve product variant for "${item.title}".`);
    }
    items.push({
      product_variant_id: Number(variantId),
      quantity: Number(item.quantity) || 1,
      price_snapshot: Number(item.price) || 0,
      final_price_snapshot: Number(item.price) || 0,
    });
  }
  return {
    delivery_price: Number(deliveryPrice) || 0,
    discount_item_id: discountItemId ?? null,
    items,
  };
};

/**
 * Loads order items if the list is returned without items.
 * @param {object} raw
 * @returns {Promise<object>}
 */
const hydrateRawOrder = async (raw) => {
  if (raw?.items?.length || raw?.order_items?.length) {
    return raw;
  }
  try {
    return await apiRequest(`/orders/${raw.id}`);
  } catch {
    try {
      const itemsPayload = await apiRequest(`/orders/${raw.id}/items`);
      return { ...raw, items: getListItems(itemsPayload) };
    } catch {
      return raw;
    }
  }
};

/**
 * Substitutes the image of the first product from the catalog by productId / variantId.
 * @param {Array<object>} orders
 * @returns {Promise<Array<object>>}
 */
const enrichOrdersWithCatalogImages = async (orders) => {
  const needsCatalog = orders.some(
    (order) => !order.image && order.products?.length,
  );
  if (!needsCatalog) {
    return orders;
  }
  const categories = await catalogApi.listCategories();
  const catalogProducts = catalogApi.mapProducts(
    await catalogApi.listAllProducts(),
    categories,
  );
  const imageByVariantId = new Map(
    catalogProducts
      .filter((product) => product.variantId && product.image)
      .map((product) => [String(product.variantId), product.image]),
  );
  const imageByProductId = new Map(
    catalogProducts
      .filter((product) => product.image)
      .map((product) => [String(product.id), product.image]),
  );

  return orders.map((order) => {
    if (order.image) {
      return order;
    }
    const firstItem = order.products?.[0];
    const image =
      (firstItem?.variantId &&
        imageByVariantId.get(String(firstItem.variantId))) ||
      (firstItem?.productId &&
        imageByProductId.get(String(firstItem.productId))) ||
      (order.productId && imageByProductId.get(String(order.productId))) ||
      "";
    if (!image) {
      return order;
    }
    return {
      ...order,
      image,
      products: order.products.map((item, index) =>
        index === 0 && !item.image ? { ...item, image } : item,
      ),
    };
  });
};

const mapOrdersFromPayload = async (payload) => {
  const rawOrders = getListItems(payload);
  const mapped = await Promise.all(
    rawOrders.map(async (raw) =>
      mapBackendOrder(await hydrateRawOrder(raw)),
    ),
  );
  return enrichOrdersWithCatalogImages(mapped);
};

const realOrdersApi = {
  /**
   * Returns the current user's orders.
   * @param {{ status?: string, page?: number, perPage?: number }} [params]
   * @returns {Promise<Array<object>>}
   */
  async listOrders({ status, page = 1, perPage = 50 } = {}) {
    const query = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    });
    if (status) {
      query.set("status", status);
    }
    const payload = await apiRequest(`/orders?${query.toString()}`);
    return mapOrdersFromPayload(payload);
  },

  /**
   * Loads one order by id.
   * @param {string|number} orderId
   * @returns {Promise<object>}
   */
  async getOrder(orderId) {
    const payload = await apiRequest(`/orders/${orderId}`);
    const [order] = await enrichOrdersWithCatalogImages([
      mapBackendOrder(await hydrateRawOrder(payload)),
    ]);
    return order;
  },

  /**
   * Creates an order from cart items.
   * @param {Array<object>} cartItems
   * @param {{ deliveryPrice?: number, discountItemId?: number|null }} [options]
   * @returns {Promise<object>}
   */
  async createOrder(cartItems, options = {}) {
    const body = await buildOrderCreatePayload(cartItems, options);
    const payload = await apiRequest("/orders", {
      method: "POST",
      body,
    });
    const [order] = await enrichOrdersWithCatalogImages([
      mapBackendOrder(await hydrateRawOrder(payload)),
    ]);
    return order;
  },

  /**
   * Returns the shipment of the order.
   * @param {string|number} orderId
   * @returns {Promise<Array<object>>}
   */
  async listShipments(orderId) {
    const payload = await apiRequest(`/orders/${orderId}/shipments`);
    return getListItems(payload).map(mapBackendShipment);
  },
};

const ORDERS_METHODS = [
  "listOrders",
  "getOrder",
  "createOrder",
  "listShipments",
];

/**
 * Orders API facade: real backend with VITE_API_BASE_URL at build stage;
 * otherwise - a lazy mock proxy in a separate chunk.
 */
export const ordersApi = import.meta.env.VITE_API_BASE_URL
  ? realOrdersApi
  : createLazyMockApi(ORDERS_METHODS, () =>
      import("./orders.mock.js").then((module) => module.mockOrdersApi),
    );

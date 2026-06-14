/*
 * Маппинг заказов и отгрузок бэкенда в модель UI профиля.
 */
import { pickImage, pickTitle } from "./mapCatalogItem";

const STATUS_MAP = {
  pending: "processing",
  processing: "processing",
  confirmed: "processing",
  paid: "processing",
  sent: "sent",
  shipped: "sent",
  shipping: "sent",
  in_transit: "sent",
  delivered: "delivered",
  completed: "delivered",
  return: "return",
  returned: "return",
  refunded: "return",
  cancelled: "processing",
  canceled: "processing",
};

/**
 * Нормализует статус заказа бэкенда во вкладку профиля.
 * @param {string|undefined|null} status
 * @returns {string}
 */
export const mapOrderStatusToTab = (status) => {
  const key = String(status || "pending").toLowerCase();
  return STATUS_MAP[key] || "processing";
};

/**
 * Извлекает URL картинки из позиции заказа.
 * @param {object} item
 * @param {number} index
 * @returns {string}
 */
const pickOrderItemImage = (item, index) => {
  const variant = item?.product_variant || item?.variant;
  const product = variant?.product || item?.product;
  if (product) {
    return pickImage(product, index);
  }
  return item?.image_url || item?.image || "";
};

/**
 * Преобразует позицию заказа бэкенда в продукт для UI.
 * @param {object} item
 * @param {string|number} orderId
 * @param {number} index
 * @returns {object}
 */
export const mapBackendOrderItem = (item, orderId, index) => {
  const variant = item?.product_variant || item?.variant;
  const product = variant?.product || item?.product;
  const title =
    pickTitle(product || {}) ||
    item?.title ||
    variant?.sku_code ||
    `Item ${index + 1}`;
  const image = pickOrderItemImage(item, index);
  return {
    id: String(item?.id ?? `${orderId}-item-${index}`),
    title,
    image,
    productId: product?.id ?? variant?.product_id ?? item?.product_id ?? null,
    variantId: variant?.id ?? item?.product_variant_id ?? null,
    quantity: Number(item?.quantity) || 1,
    price: Number(item?.final_price_snapshot ?? item?.price_snapshot ?? 0),
  };
};

/**
 * Преобразует заказ бэкенда в карточку профиля.
 * @param {object} order
 * @returns {object}
 */
export const mapBackendOrder = (order) => {
  const items = (order?.items || order?.order_items || []).map((item, index) =>
    mapBackendOrderItem(item, order.id, index),
  );
  const firstItem = items[0];
  const itemCount = items.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0,
  );
  const createdAt = order?.created_at || order?.order_time;
  return {
    id: String(order?.id),
    backendId: order?.id,
    status: mapOrderStatusToTab(order?.status),
    backendStatus: order?.status,
    itemCount: itemCount || items.length,
    total: Number(order?.total_price ?? order?.total ?? 0),
    deliveryPrice: Number(order?.delivery_price ?? 0),
    orderTime: createdAt
      ? new Date(createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "",
    image: firstItem?.image || "",
    productTitle: firstItem?.title ?? "Order items",
    productId: firstItem?.productId ?? null,
    products: items,
  };
};

/**
 * Преобразует отгрузку бэкенда в шаг таймлайна.
 * @param {object} shipment
 * @returns {object}
 */
export const mapBackendShipment = (shipment) => ({
  id: shipment?.id,
  status: shipment?.status || "Update",
  trackingNumber: shipment?.tracking_number || "",
  createdAt: shipment?.created_at || null,
});

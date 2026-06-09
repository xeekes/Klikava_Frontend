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

export const getBuyAgainProductId = (order) => {
  if (order?.productId) {
    return order.productId;
  }

  const products = getOrderProducts(order);
  return products[0]?.productId ?? null;
};

export const filterOrdersByTabFromList = (orders, tab) => {
  if (!tab || tab === "all") {
    return orders;
  }

  return orders.filter((order) => order.status === tab);
};

export const getOrderByIdFromList = (orders, orderId) =>
  orders.find((order) => order.id === orderId);

export const getOrderActions = (tab) => {
  if (tab === "processing" || tab === "sent") {
    return ["track", "buy-again"];
  }

  if (tab === "return") {
    return ["track", "review", "buy-again"];
  }

  return ["track", "review", "return", "buy-again"];
};

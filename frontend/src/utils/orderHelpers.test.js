import { describe, expect, it } from "vitest";
import {
  canUserReviewProduct,
  findEligibleReviewOrderForProduct,
  orderContainsProduct,
} from "./orderHelpers";

describe("orderContainsProduct", () => {
  it("matches by productId and variantId", () => {
    const order = {
      products: [
        { productId: "10", variantId: "100" },
        { productId: "20", variantId: "200" },
      ],
    };

    expect(orderContainsProduct(order, "10", null)).toBe(true);
    expect(orderContainsProduct(order, "99", "200")).toBe(true);
    expect(orderContainsProduct(order, "99", "999")).toBe(false);
  });
});

describe("canUserReviewProduct", () => {
  const orders = [
    {
      id: "1",
      status: "processing",
      products: [{ productId: "10", variantId: "100" }],
    },
    {
      id: "2",
      status: "sent",
      products: [{ productId: "10", variantId: "100" }],
    },
    {
      id: "3",
      status: "delivered",
      products: [{ productId: "10", variantId: "100" }],
    },
    {
      id: "4",
      status: "delivered",
      products: [{ productId: "55", variantId: "550" }],
    },
  ];

  it("allows review only for delivered or return orders with the product", () => {
    expect(canUserReviewProduct(orders, "10", "100")).toBe(true);
    expect(canUserReviewProduct(orders, "55", null)).toBe(true);
    expect(canUserReviewProduct(orders, "99", null)).toBe(false);
  });

  it("finds the first eligible order", () => {
    expect(findEligibleReviewOrderForProduct(orders, "10", "100")?.id).toBe("3");
  });
});

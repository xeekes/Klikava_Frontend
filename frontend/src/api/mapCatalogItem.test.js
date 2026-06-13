import { describe, expect, it } from "vitest";
import {
  applyCatalogDiscounts,
  mapBackendCategory,
  mapBackendProduct,
  mapBackendProductList,
  mapBackendReview,
  mapVariantFeaturesToSpecs,
} from "./mapCatalogItem";

describe("mapBackendCategory", () => {
  it("maps nested backend fields to flat category model", () => {
    const result = mapBackendCategory({
      id: 5,
      title: "Phones",
      description: "Mobile devices",
      parent_id: 1,
      subcategories: [{ id: 6 }],
    });

    expect(result).toEqual({
      id: "5",
      backendId: 5,
      name: "Phones",
      description: "Mobile devices",
      parentId: 1,
      subcategories: [{ id: 6 }],
    });
  });

  it("falls back to name and empty description", () => {
    const result = mapBackendCategory({ id: 2, name: "Bags" });

    expect(result.name).toBe("Bags");
    expect(result.description).toBe("");
    expect(result.parentId).toBeNull();
  });
});

describe("mapBackendProduct", () => {
  it("maps nested version payload with discount pricing", () => {
    const categoryLookup = new Map([
      [10, mapBackendCategory({ id: 10, title: "Electronics" })],
    ]);

    const result = mapBackendProduct(
      {
        id: 42,
        current_version: {
          title: "Smartphone X",
          category_id: 10,
          variants: [{ final_price: 90, discount: 10 }],
          pictures: [{ url: "https://cdn.example/img.jpg" }],
        },
      },
      0,
      categoryLookup,
    );

    expect(result.id).toBe(42);
    expect(result.title).toBe("Smartphone X");
    expect(result.image).toBe("https://cdn.example/img.jpg");
    expect(result.price).toBe(90);
    expect(result.originalPrice).toBe(100);
    expect(result.discountPercent).toBe(10);
    expect(result.categoryId).toBe("10");
    expect(result.categoryName).toBe("Electronics");
    expect(result.isTop).toBe(true);
  });

  it("uses slugify fallback and local image when API omits media", () => {
    const result = mapBackendProduct({ name: "Red Bag!" }, 3);

    expect(result.slug).toBe("red-bag");
    expect(result.title).toBe("Red Bag!");
    expect(result.price).toBe(0);
    expect(result.categoryName).toBe("Catalog");
    expect(typeof result.image).toBe("string");
    expect(result.image.length).toBeGreaterThan(0);
  });
});

describe("mapBackendProductList", () => {
  it("maps each item with shared category lookup", () => {
    const items = [{ id: 1, title: "A" }, { id: 2, name: "B" }];
    const result = mapBackendProductList(items);

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("A");
    expect(result[1].title).toBe("B");
  });
});

describe("mapBackendReview", () => {
  it("normalizes review fields for product detail UI", () => {
    const result = mapBackendReview({
      id: 7,
      user_id: 99,
      rating: "4",
      comment: "Great product",
      created_at: "2026-01-01",
    });

    expect(result).toEqual({
      id: 7,
      author: "User 99",
      rating: 4,
      text: "Great product",
      date: "2026-01-01",
    });
  });
});

describe("mapVariantFeaturesToSpecs", () => {
  it("flattens variant features into label/value rows", () => {
    const result = mapVariantFeaturesToSpecs({
      features: [
        { feature: { title: "Color" }, value: "Black" },
        { value: "128 GB" },
      ],
    });

    expect(result).toEqual([
      { label: "Color", value: "Black" },
      { label: "Feature", value: "128 GB" },
    ]);
  });

  it("returns empty array for missing variant", () => {
    expect(mapVariantFeaturesToSpecs(null)).toEqual([]);
  });
});

describe("applyCatalogDiscounts", () => {
  const baseProduct = {
    id: 100,
    price: 80,
    originalPrice: 100,
    discountPercent: 20,
    categoryId: "5",
    backendRaw: { seller_id: 3 },
  };

  it("returns products unchanged when no discounts", () => {
    const products = [baseProduct];
    expect(applyCatalogDiscounts(products, [])).toBe(products);
  });

  it("applies the best matching active discount", () => {
    const [result] = applyCatalogDiscounts([baseProduct], [
      { target_type: "CATEGORY", target_id: 5, value: 30, is_active: true },
      { target_type: "PRODUCT", target_id: 100, value: 10, is_active: false },
    ]);

    expect(result.discountPercent).toBe(30);
    expect(result.price).toBe(70);
    expect(result.originalPrice).toBe(100);
  });

  it("matches seller and product targets", () => {
    const product = {
      id: 200,
      price: 50,
      categoryId: "1",
      backendRaw: { seller_id: 9 },
    };

    const [bySeller] = applyCatalogDiscounts([product], [
      { target_type: "SELLER", target_id: 9, value: 15, is_active: true },
    ]);
    expect(bySeller.discountPercent).toBe(15);
    expect(bySeller.price).toBe(42.5);

    const [byProduct] = applyCatalogDiscounts([product], [
      { target_type: "PRODUCT", target_id: 200, value: 20, is_active: true },
    ]);
    expect(byProduct.discountPercent).toBe(20);
    expect(byProduct.price).toBe(40);
  });
});

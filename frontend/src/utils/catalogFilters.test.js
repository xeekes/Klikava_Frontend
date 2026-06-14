import { describe, expect, it } from "vitest";
import {
  buildFeatureFacets,
  filterProductsByFeatures,
  sortProducts,
} from "./catalogFilters";

const sampleProducts = [
  {
    id: 1,
    features: [
      { featureId: 2, label: "Color", value: "Red", isPrimary: true },
      { featureId: 1, label: "Brand", value: "Nike", isPrimary: true },
    ],
  },
  {
    id: 2,
    features: [
      { featureId: 2, label: "Color", value: "Black", isPrimary: true },
      { featureId: 1, label: "Brand", value: "Columbia", isPrimary: true },
    ],
  },
];

describe("buildFeatureFacets", () => {
  it("builds grouped feature options with counts", () => {
    const facets = buildFeatureFacets(sampleProducts, [
      { id: "1", title: "Brand", isPrimary: true },
      { id: "2", title: "Color", isPrimary: true },
    ]);

    expect(facets).toHaveLength(2);
    expect(facets[0]).toMatchObject({ id: "1", label: "Brand" });
    expect(facets[1]).toMatchObject({ id: "2", label: "Color" });
  });
});

describe("filterProductsByFeatures", () => {
  it("filters by one feature value", () => {
    const result = filterProductsByFeatures(sampleProducts, { 2: ["Red"] });
    expect(result.map((item) => item.id)).toEqual([1]);
  });
});

describe("sortProducts", () => {
  it("sorts by price without mutating the source array", () => {
    const source = [
      { id: 1, price: 300 },
      { id: 2, price: 100 },
      { id: 3, price: 200 },
    ];
    const sorted = sortProducts(source, "price-low");

    expect(source.map((item) => item.id)).toEqual([1, 2, 3]);
    expect(sorted.map((item) => item.id)).toEqual([2, 3, 1]);
  });
});

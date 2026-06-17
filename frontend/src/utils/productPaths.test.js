import { describe, expect, it } from "vitest";
import { getProductPath } from "./productPaths";

describe("getProductPath", () => {
  it("prefers slug over numeric id", () => {
    expect(getProductPath({ id: 46, slug: "wireless-mouse" })).toBe(
      "/product/wireless-mouse",
    );
  });

  it("falls back to id when slug is missing", () => {
    expect(getProductPath({ id: 46 })).toBe("/product/46");
  });

  it("supports cart item shape with productId", () => {
    expect(getProductPath({ productId: 46, slug: "wireless-mouse" })).toBe(
      "/product/wireless-mouse",
    );
  });

  it("returns catalog route when no identifier is available", () => {
    expect(getProductPath(null)).toBe("/catalog");
  });
});

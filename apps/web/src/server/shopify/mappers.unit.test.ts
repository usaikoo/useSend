import { describe, expect, it } from "vitest";
import { mapProductToUpsert } from "~/server/shopify/mappers";
import type { ShopifyRestProduct } from "~/server/shopify/types";

const sampleProduct: ShopifyRestProduct = {
  id: 123,
  title: "Running Shoes",
  handle: "running-shoes",
  body_html: "<p>Great shoes</p>",
  vendor: "RioReply",
  product_type: "Footwear",
  status: "active",
  tags: "running,sale",
  updated_at: "2026-09-12T12:00:00Z",
  variants: [
    {
      price: "99.00",
      compare_at_price: "129.00",
      inventory_quantity: 10,
    },
    {
      price: "109.00",
      compare_at_price: null,
      inventory_quantity: 5,
    },
  ],
  images: [{ src: "https://cdn.shopify.com/shoe.jpg" }],
};

describe("mapProductToUpsert", () => {
  it("maps Shopify product fields for database upsert", () => {
    const result = mapProductToUpsert("store_1", "demo.myshopify.com", sampleProduct);

    expect(result.create.shopifyId).toBe("123");
    expect(result.create.title).toBe("Running Shoes");
    expect(result.create.priceMin).toBe(99);
    expect(result.create.priceMax).toBe(109);
    expect(result.create.inventoryTotal).toBe(15);
    expect(result.create.productUrl).toBe(
      "https://demo.myshopify.com/products/running-shoes",
    );
  });
});

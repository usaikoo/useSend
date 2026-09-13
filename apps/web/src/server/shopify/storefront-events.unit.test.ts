import { describe, expect, it } from "vitest";
import { storefrontEventInputSchema } from "~/server/shopify/storefront-events";

describe("storefrontEventInputSchema", () => {
  it("accepts a valid page view payload", () => {
    const result = storefrontEventInputSchema.parse({
      key: "track_key_123",
      eventType: "PAGE_VIEW",
      sessionId: "session_abc",
      visitorId: "visitor_xyz",
      url: "https://demo.myshopify.com/products/shoes",
      path: "/products/shoes",
    });

    expect(result.eventType).toBe("PAGE_VIEW");
    expect(result.sessionId).toBe("session_abc");
  });

  it("accepts add to cart payload with quantity", () => {
    const result = storefrontEventInputSchema.parse({
      key: "track_key_123",
      eventType: "ADD_TO_CART",
      sessionId: "session_abc",
      productId: "123",
      variantId: "456",
      quantity: 2,
    });

    expect(result.quantity).toBe(2);
    expect(result.productId).toBe("123");
  });

  it("rejects unknown event types", () => {
    expect(() =>
      storefrontEventInputSchema.parse({
        key: "track_key_123",
        eventType: "UNKNOWN",
        sessionId: "session_abc",
      }),
    ).toThrow();
  });
});

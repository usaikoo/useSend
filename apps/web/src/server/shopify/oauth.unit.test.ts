import { describe, expect, it } from "vitest";
import {
  normalizeShopDomain,
  verifyOAuthHmac,
  verifyWebhookHmac,
} from "~/server/shopify/oauth";

describe("normalizeShopDomain", () => {
  it("normalizes a bare store name", () => {
    expect(normalizeShopDomain("My-Store")).toBe("my-store.myshopify.com");
  });

  it("normalizes a full myshopify domain", () => {
    expect(normalizeShopDomain("https://demo-store.myshopify.com/")).toBe(
      "demo-store.myshopify.com",
    );
  });

  it("rejects invalid domains", () => {
    expect(() => normalizeShopDomain("bad store!")).toThrow(
      "Invalid Shopify store domain",
    );
  });
});

describe("verifyOAuthHmac", () => {
  it("validates a Shopify OAuth callback signature", () => {
    const secret = "test-secret";
    const query = {
      code: "abc123",
      shop: "demo-store.myshopify.com",
      state: "nonce",
      timestamp: "1234567890",
      hmac: "d39989319df6978095ea408b111a0120daa8d343dba4a7ee7a41680eb26dfc12",
    };

    expect(verifyOAuthHmac(query, secret)).toBe(true);
  });
});

describe("verifyWebhookHmac", () => {
  it("rejects invalid webhook signatures", () => {
    expect(verifyWebhookHmac("{}", "invalid", "secret")).toBe(false);
  });
});

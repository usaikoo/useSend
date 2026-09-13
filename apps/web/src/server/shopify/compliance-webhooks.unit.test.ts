import { describe, expect, it } from "vitest";
import {
  customersDataRequestSchema,
  customersRedactSchema,
  isComplianceWebhookTopic,
  shopRedactSchema,
} from "~/server/shopify/compliance-webhooks";

describe("compliance webhook schemas", () => {
  it("accepts customers/data_request payload", () => {
    const payload = customersDataRequestSchema.parse({
      shop_id: 954889,
      shop_domain: "demo.myshopify.com",
      orders_requested: [299938],
      customer: {
        id: 191167,
        email: "john@example.com",
      },
      data_request: { id: 9999 },
    });

    expect(payload.shop_domain).toBe("demo.myshopify.com");
  });

  it("accepts customers/redact payload", () => {
    const payload = customersRedactSchema.parse({
      shop_id: 954889,
      shop_domain: "demo.myshopify.com",
      customer: {
        id: 191167,
        email: "john@example.com",
      },
      orders_to_redact: [299938],
    });

    expect(payload.orders_to_redact).toEqual([299938]);
  });

  it("accepts shop/redact payload", () => {
    const payload = shopRedactSchema.parse({
      shop_id: 954889,
      shop_domain: "demo.myshopify.com",
    });

    expect(payload.shop_id).toBe(954889);
  });
});

describe("isComplianceWebhookTopic", () => {
  it("recognizes mandatory compliance topics", () => {
    expect(isComplianceWebhookTopic("customers/data_request")).toBe(true);
    expect(isComplianceWebhookTopic("customers/redact")).toBe(true);
    expect(isComplianceWebhookTopic("shop/redact")).toBe(true);
    expect(isComplianceWebhookTopic("products/create")).toBe(false);
  });
});

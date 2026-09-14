import { describe, expect, it } from "vitest";
import {
  DEMO_CUSTOMER_SHOPIFY_ID,
  DEMO_ORDER_SHOPIFY_ID,
  DEMO_SESSION_ID,
  DEMO_VISITOR_ID,
} from "~/server/service/shopify-demo-data-service";

describe("ShopifyDemoDataService constants", () => {
  it("uses stable demo identifiers", () => {
    expect(DEMO_VISITOR_ID).toBe("rioreply-demo-visitor");
    expect(DEMO_SESSION_ID).toBe("rioreply-demo-session");
    expect(DEMO_CUSTOMER_SHOPIFY_ID).toBe("rioreply-demo-customer");
    expect(DEMO_ORDER_SHOPIFY_ID).toBe("rioreply-demo-order");
  });
});

import { describe, expect, it } from "vitest";
import {
  createDemoSessionId,
  createDemoVisitorId,
  DEMO_CUSTOMER_SHOPIFY_ID,
  DEMO_ORDER_SHOPIFY_ID,
  DEMO_VISITOR_ID_PREFIX,
} from "~/server/service/shopify-demo-data-service";

describe("ShopifyDemoDataService helpers", () => {
  it("uses stable demo customer identifiers", () => {
    expect(DEMO_CUSTOMER_SHOPIFY_ID).toBe("rioreply-demo-customer");
    expect(DEMO_ORDER_SHOPIFY_ID).toBe("rioreply-demo-order");
  });

  it("creates unique visitor ids for each demo run", () => {
    const first = createDemoVisitorId();
    const second = createDemoVisitorId();

    expect(first).toMatch(
      new RegExp(`^${DEMO_VISITOR_ID_PREFIX}-\\d+-[a-z0-9]+$`),
    );
    expect(second).toMatch(
      new RegExp(`^${DEMO_VISITOR_ID_PREFIX}-\\d+-[a-z0-9]+$`),
    );
    expect(first).not.toBe(second);
  });

  it("creates unique session ids for each demo run", () => {
    const first = createDemoSessionId();
    const second = createDemoSessionId();

    expect(first).not.toBe(second);
  });
});

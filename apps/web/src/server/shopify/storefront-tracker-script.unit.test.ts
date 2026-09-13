import { describe, expect, it } from "vitest";
import {
  buildStorefrontTrackerScript,
  buildTrackingSnippet,
  buildTrackingScriptUrl,
  buildTrackingScriptUrlByShop,
} from "~/server/shopify/storefront-tracker-script";

describe("storefront tracker script", () => {
  it("builds a script URL with encoded tracking key", () => {
    expect(
      buildTrackingScriptUrl("https://app.rioreply.app", "key/with/slash"),
    ).toBe("https://app.rioreply.app/api/track/shopify.js?key=key%2Fwith%2Fslash");
  });

  it("builds a script URL with shop domain for app embeds", () => {
    expect(
      buildTrackingScriptUrlByShop(
        "https://app.rioreply.app",
        "larashopone.myshopify.com",
      ),
    ).toBe(
      "https://app.rioreply.app/api/track/shopify.js?shop=larashopone.myshopify.com",
    );
  });

  it("builds an installable HTML snippet", () => {
    expect(buildTrackingSnippet("https://app.rioreply.app", "abc123")).toBe(
      '<script async src="https://app.rioreply.app/api/track/shopify.js?key=abc123"></script>',
    );
  });

  it("embeds tracking key and endpoint in generated JavaScript", () => {
    const script = buildStorefrontTrackerScript({
      trackingKey: "abc123",
      endpoint: "https://app.rioreply.app/api/track/shopify",
    });

    expect(script).toContain('"abc123"');
    expect(script).toContain('"https://app.rioreply.app/api/track/shopify"');
    expect(script).toContain("PAGE_VIEW");
    expect(script).toContain("ADD_TO_CART");
    expect(script).toContain("PURCHASE");
  });
});

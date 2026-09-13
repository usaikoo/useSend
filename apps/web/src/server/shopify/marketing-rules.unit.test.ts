import { describe, expect, it } from "vitest";
import {
  buildSendExplanation,
  buildSkipExplanation,
  evaluateMarketingRules,
} from "~/server/shopify/marketing-rules";

const baseInput = {
  enabled: true,
  fromEmail: "hello@store.com",
  recipientEmail: "customer@example.com",
  emailMarketingConsent: true,
  isSuppressed: false,
  productViewCount: 3,
  minProductViews: 3,
  hasPurchasedProduct: false,
  productInStock: true,
  recentMarketingEmailCount: 0,
  maxEmailsPerVisitorWeek: 2,
  hasRecentProductAction: false,
};

describe("evaluateMarketingRules", () => {
  it("allows send when all rules pass", () => {
    expect(evaluateMarketingRules(baseInput)).toEqual({ allowed: true });
  });

  it("blocks when autopilot is disabled", () => {
    const result = evaluateMarketingRules({ ...baseInput, enabled: false });
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toBe("AUTOPILOT_DISABLED");
    }
  });

  it("blocks when consent is missing", () => {
    const result = evaluateMarketingRules({
      ...baseInput,
      emailMarketingConsent: null,
    });
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toBe("CONSENT_UNKNOWN");
    }
  });

  it("blocks when frequency limit is reached", () => {
    const result = evaluateMarketingRules({
      ...baseInput,
      recentMarketingEmailCount: 2,
    });
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toBe("FREQUENCY_LIMIT");
    }
  });
});

describe("marketing explanations", () => {
  it("builds a human-readable send explanation", () => {
    expect(
      buildSendExplanation({
        productTitle: "Running Shoes",
        productViewCount: 3,
      }),
    ).toContain("Running Shoes");
  });

  it("builds a human-readable skip explanation", () => {
    expect(buildSkipExplanation("NO_EMAIL")).toContain("No email address");
  });
});

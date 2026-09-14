import { describe, expect, it } from "vitest";
import {
  buildTokenExpiryDates,
  isNonExpiringTokenError,
  shouldRefreshAccessToken,
} from "~/server/shopify/token-types";

describe("shopify token helpers", () => {
  it("detects non-expiring token API errors", () => {
    expect(
      isNonExpiringTokenError(
        new Error(
          'Shopify API error (403): {"errors":"[API] Non-expiring access tokens are no longer accepted for the Admin API"}',
        ),
      ),
    ).toBe(true);
  });

  it("refreshes when access token is near expiry", () => {
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    expect(
      shouldRefreshAccessToken(expiresAt, "refresh-token", Date.now()),
    ).toBe(true);
  });

  it("does not refresh when token is still valid", () => {
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    expect(
      shouldRefreshAccessToken(expiresAt, "refresh-token", Date.now()),
    ).toBe(false);
  });

  it("builds expiry timestamps from Shopify TTL values", () => {
    const now = Date.parse("2026-01-01T00:00:00.000Z");
    const expiryDates = buildTokenExpiryDates(3600, 7776000, now);

    expect(expiryDates.accessTokenExpiresAt.toISOString()).toBe(
      "2026-01-01T01:00:00.000Z",
    );
    expect(expiryDates.refreshTokenExpiresAt.toISOString()).toBe(
      "2026-04-01T00:00:00.000Z",
    );
  });
});

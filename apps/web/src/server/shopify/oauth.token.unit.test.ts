import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  env: {
    SHOPIFY_API_KEY: "test-api-key",
    SHOPIFY_API_SECRET: "test-api-secret",
    SHOPIFY_APP_URL: "https://app.rioreply.app",
    NEXTAUTH_URL: "https://app.rioreply.app",
  },
}));

vi.mock("~/env", () => ({ env: mocks.env }));

import {
  exchangeAccessToken,
  refreshOfflineAccessToken,
} from "~/server/shopify/oauth";

describe("shopify expiring offline tokens", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("requests expiring tokens during OAuth code exchange", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: "shpat_access",
          scope: "read_products",
          expires_in: 3600,
          refresh_token: "shprt_refresh",
          refresh_token_expires_in: 7776000,
        }),
        { status: 200 },
      ),
    );

    const tokenSet = await exchangeAccessToken(
      "demo-store.myshopify.com",
      "auth-code",
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "https://demo-store.myshopify.com/admin/oauth/access_token",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/x-www-form-urlencoded",
        }),
      }),
    );

    const body = fetchMock.mock.calls[0]?.[1]?.body;
    expect(body).toBeInstanceOf(URLSearchParams);
    expect((body as URLSearchParams).get("expiring")).toBe("1");
    expect(tokenSet.accessToken).toBe("shpat_access");
    expect(tokenSet.refreshToken).toBe("shprt_refresh");
  });

  it("refreshes expiring offline tokens", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: "shpat_new_access",
          scope: "read_products",
          expires_in: 3600,
          refresh_token: "shprt_new_refresh",
          refresh_token_expires_in: 7776000,
        }),
        { status: 200 },
      ),
    );

    const tokenSet = await refreshOfflineAccessToken(
      "demo-store.myshopify.com",
      "shprt_refresh",
    );

    expect(tokenSet.accessToken).toBe("shpat_new_access");
    expect(tokenSet.refreshToken).toBe("shprt_new_refresh");
  });
});

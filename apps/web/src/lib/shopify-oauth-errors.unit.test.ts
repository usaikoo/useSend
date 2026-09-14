import { describe, expect, it } from "vitest";
import {
  getShopifyOAuthErrorMessage,
  isShopifyOAuthErrorCode,
} from "~/lib/shopify-oauth-errors";

describe("shopify oauth error messages", () => {
  it("maps database schema errors to a migration hint", () => {
    expect(getShopifyOAuthErrorMessage("database_schema")).toContain(
      "Database schema is out of date",
    );
  });

  it("validates known error codes", () => {
    expect(isShopifyOAuthErrorCode("token_exchange_failed")).toBe(true);
    expect(isShopifyOAuthErrorCode("not-a-code")).toBe(false);
  });
});

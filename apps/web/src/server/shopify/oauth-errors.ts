import { TRPCError } from "@trpc/server";
import {
  type ShopifyOAuthErrorCode,
  getShopifyOAuthErrorMessage,
} from "~/lib/shopify-oauth-errors";

export type { ShopifyOAuthErrorCode };
export { getShopifyOAuthErrorMessage };

export function classifyShopifyOAuthError(
  error: unknown,
): ShopifyOAuthErrorCode {
  if (error instanceof TRPCError) {
    if (error.message.includes("signature")) {
      return "invalid_hmac";
    }

    if (error.message.includes("state")) {
      return "invalid_state";
    }

    if (error.message.includes("mismatch")) {
      return "shop_mismatch";
    }
  }

  if (error instanceof Error) {
    if (error.message.includes("did not return expiring offline token")) {
      return "expiring_token_required";
    }

    if (error.message.includes("Failed to exchange Shopify access token")) {
      return "token_exchange_failed";
    }

    if (error.message.includes("Shopify API error")) {
      return "shop_api_failed";
    }

    if (
      error.message.includes("column") ||
      error.message.includes("ShopifyStore") ||
      error.message.includes("Prisma")
    ) {
      return "database_schema";
    }
  }

  return "unknown";
}

export function getShopifyOAuthErrorLogFields(error: unknown) {
  if (error instanceof TRPCError) {
    return {
      errorType: "TRPCError",
      code: error.code,
      message: error.message,
    };
  }

  if (error instanceof Error) {
    return {
      errorType: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    errorType: "unknown",
    message: String(error),
  };
}

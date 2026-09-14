export type ShopifyOAuthErrorCode =
  | "invalid_hmac"
  | "invalid_state"
  | "shop_mismatch"
  | "token_exchange_failed"
  | "expiring_token_required"
  | "shop_api_failed"
  | "database_schema"
  | "unknown";

export function getShopifyOAuthErrorMessage(code: ShopifyOAuthErrorCode) {
  switch (code) {
    case "invalid_hmac":
      return "Shopify OAuth signature verification failed. Check SHOPIFY_API_SECRET on the server.";
    case "invalid_state":
      return "OAuth session expired. Start the connection again from Settings → Shopify.";
    case "shop_mismatch":
      return "The Shopify store domain did not match the connection request.";
    case "token_exchange_failed":
      return "Shopify rejected the access token exchange. Check server logs for the HTTP status and response.";
    case "expiring_token_required":
      return "Shopify did not return expiring offline token credentials. Verify the app uses expiring tokens.";
    case "shop_api_failed":
      return "Connected to Shopify, but loading shop details failed. Check server logs.";
    case "database_schema":
      return "Database schema is out of date. Run the Shopify token migration on the server, then retry.";
    default:
      return "Failed to connect Shopify store. Check server logs for details.";
  }
}

export function isShopifyOAuthErrorCode(
  value: string | null,
): value is ShopifyOAuthErrorCode {
  return (
    value === "invalid_hmac" ||
    value === "invalid_state" ||
    value === "shop_mismatch" ||
    value === "token_exchange_failed" ||
    value === "expiring_token_required" ||
    value === "shop_api_failed" ||
    value === "database_schema" ||
    value === "unknown"
  );
}

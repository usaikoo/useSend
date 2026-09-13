export const SHOPIFY_API_VERSION = "2024-10";

export const SHOPIFY_DEFAULT_SCOPES = [
  "read_products",
  "read_customers",
  "read_orders",
  "read_content",
] as const;

export const SHOPIFY_OAUTH_STATE_TTL_SECONDS = 600;

export const SHOPIFY_OAUTH_STATE_PREFIX = "shopify:oauth:";

export const SHOPIFY_PAGE_LIMIT = 250;

export const SHOPIFY_PRODUCT_WEBHOOK_TOPICS = [
  "app/uninstalled",
  "products/create",
  "products/update",
  "products/delete",
] as const;

export const SHOPIFY_PROTECTED_WEBHOOK_TOPICS = [
  "customers/create",
  "customers/update",
  "orders/create",
  "orders/updated",
] as const;

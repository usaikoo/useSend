import { env } from "~/env";
import { normalizeShopDomain } from "~/server/shopify/oauth";

export const RIOREPLY_APP_EMBED_HANDLE = "rioreply-tracker";

export function getShopHandle(shopDomain: string) {
  return normalizeShopDomain(shopDomain).replace(/\.myshopify\.com$/i, "");
}

export function buildThemeEditorAppEmbedUrl(shopDomain: string) {
  const apiKey = env.SHOPIFY_API_KEY;

  if (!apiKey) {
    throw new Error("Shopify API key is not configured");
  }

  const shopHandle = getShopHandle(shopDomain);
  const extensionId = env.SHOPIFY_THEME_EXTENSION_UID ?? RIOREPLY_APP_EMBED_HANDLE;
  const activateAppId = `${apiKey}/${extensionId}`;

  const params = new URLSearchParams({
    context: "apps",
    activateAppId,
  });

  return `https://admin.shopify.com/store/${shopHandle}/themes/current/editor?${params.toString()}`;
}

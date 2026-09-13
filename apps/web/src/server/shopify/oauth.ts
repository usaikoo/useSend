import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { env } from "~/env";
import {
  SHOPIFY_DEFAULT_SCOPES,
  SHOPIFY_OAUTH_STATE_PREFIX,
  SHOPIFY_OAUTH_STATE_TTL_SECONDS,
} from "~/server/shopify/constants";
import { getRedis, redisKey } from "~/server/redis";

export type ShopifyOAuthState = {
  teamId: number;
  shopDomain: string;
};

export function getShopifyConfig() {
  const apiKey = env.SHOPIFY_API_KEY;
  const apiSecret = env.SHOPIFY_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("Shopify integration is not configured");
  }

  const appUrl = env.SHOPIFY_APP_URL ?? env.NEXTAUTH_URL;
  const scopes = env.SHOPIFY_SCOPES ?? SHOPIFY_DEFAULT_SCOPES.join(",");

  return {
    apiKey,
    apiSecret,
    appUrl,
    scopes,
    redirectUri: `${appUrl.replace(/\/$/, "")}/api/shopify/callback`,
  };
}

export function normalizeShopDomain(input: string): string {
  const trimmed = input.trim().toLowerCase();
  const withoutProtocol = trimmed.replace(/^https?:\/\//, "");
  const withoutTrailingSlash = withoutProtocol.replace(/\/$/, "");
  const shopName = withoutTrailingSlash.replace(/\.myshopify\.com$/, "");

  if (!/^[a-z0-9][a-z0-9-]*$/.test(shopName)) {
    throw new Error("Invalid Shopify store domain");
  }

  return `${shopName}.myshopify.com`;
}

export async function createOAuthState(
  teamId: number,
  shopDomain: string,
): Promise<string> {
  const state = randomBytes(32).toString("hex");
  const payload: ShopifyOAuthState = { teamId, shopDomain };

  await getRedis().setex(
    redisKey(`${SHOPIFY_OAUTH_STATE_PREFIX}${state}`),
    SHOPIFY_OAUTH_STATE_TTL_SECONDS,
    JSON.stringify(payload),
  );

  return state;
}

export async function consumeOAuthState(
  state: string,
): Promise<ShopifyOAuthState | null> {
  const key = redisKey(`${SHOPIFY_OAUTH_STATE_PREFIX}${state}`);
  const redis = getRedis();
  const raw = await redis.get(key);

  if (!raw) {
    return null;
  }

  await redis.del(key);

  try {
    return JSON.parse(raw) as ShopifyOAuthState;
  } catch {
    return null;
  }
}

export function buildInstallUrl(shopDomain: string, state: string): string {
  const { apiKey, scopes, redirectUri } = getShopifyConfig();
  const params = new URLSearchParams({
    client_id: apiKey,
    scope: scopes,
    redirect_uri: redirectUri,
    state,
  });

  return `https://${shopDomain}/admin/oauth/authorize?${params.toString()}`;
}

export function verifyOAuthHmac(
  query: Record<string, string | string[] | undefined>,
  secret: string,
): boolean {
  const hmac = query.hmac;
  if (typeof hmac !== "string") {
    return false;
  }

  const message = Object.entries(query)
    .filter(([key]) => key !== "hmac" && key !== "signature")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => {
      const normalizedValue = Array.isArray(value) ? value.join(",") : value;
      return `${key}=${normalizedValue ?? ""}`;
    })
    .join("&");

  const digest = createHmac("sha256", secret).update(message).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(digest, "utf8"), Buffer.from(hmac, "utf8"));
  } catch {
    return false;
  }
}

export function verifyWebhookHmac(body: string, hmacHeader: string, secret: string) {
  const digest = createHmac("sha256", secret).update(body, "utf8").digest("base64");

  try {
    return timingSafeEqual(
      Buffer.from(digest, "utf8"),
      Buffer.from(hmacHeader, "utf8"),
    );
  } catch {
    return false;
  }
}

export async function exchangeAccessToken(
  shopDomain: string,
  code: string,
): Promise<{ accessToken: string; scope: string }> {
  const { apiKey, apiSecret } = getShopifyConfig();

  const response = await fetch(
    `https://${shopDomain}/admin/oauth/access_token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: apiKey,
        client_secret: apiSecret,
        code,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to exchange Shopify access token");
  }

  const data = (await response.json()) as {
    access_token: string;
    scope: string;
  };

  return {
    accessToken: data.access_token,
    scope: data.scope,
  };
}

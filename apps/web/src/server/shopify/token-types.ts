export type ShopifyOfflineTokenSet = {
  accessToken: string;
  scope: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
};

export const SHOPIFY_ACCESS_TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

export const SHOPIFY_REAUTH_REQUIRED_MESSAGE =
  "Shopify access expired. Disconnect and reconnect your store in Settings → Shopify.";

export function isNonExpiringTokenError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.includes(
    "Non-expiring access tokens are no longer accepted",
  );
}

export function shouldRefreshAccessToken(
  accessTokenExpiresAt: Date | null | undefined,
  refreshToken: string | null | undefined,
  now = Date.now(),
) {
  if (!refreshToken) {
    return false;
  }

  if (!accessTokenExpiresAt) {
    return true;
  }

  return (
    accessTokenExpiresAt.getTime() <=
    now + SHOPIFY_ACCESS_TOKEN_REFRESH_BUFFER_MS
  );
}

export function buildTokenExpiryDates(
  expiresIn: number,
  refreshTokenExpiresIn: number,
  now = Date.now(),
) {
  return {
    accessTokenExpiresAt: new Date(now + expiresIn * 1000),
    refreshTokenExpiresAt: new Date(now + refreshTokenExpiresIn * 1000),
  };
}

import { ShopifyStoreStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { ShopifyClient } from "~/server/shopify/client";
import {
  buildInstallUrl,
  consumeOAuthState,
  createOAuthState,
  exchangeAccessToken,
  getShopifyConfig,
  normalizeShopDomain,
  verifyOAuthHmac,
} from "~/server/shopify/oauth";
import { db } from "~/server/db";
import { logger } from "~/server/logger/log";
import { ShopifySyncService } from "~/server/service/shopify-sync-service";
import {
  classifyShopifyOAuthError,
  getShopifyOAuthErrorLogFields,
} from "~/server/shopify/oauth-errors";
import { isCustomerDataSyncEnabled } from "~/server/shopify/protected-data";

export class ShopifyService {
  static isConfigured() {
    try {
      getShopifyConfig();
      return true;
    } catch {
      return false;
    }
  }

  static isCustomerDataSyncEnabled() {
    return isCustomerDataSyncEnabled();
  }

  static async getInstallUrl(teamId: number, shopInput: string) {
    const shopDomain = normalizeShopDomain(shopInput);
    const state = await createOAuthState(teamId, shopDomain);

    logger.info({ teamId, shopDomain }, "Starting Shopify OAuth install flow");

    return {
      url: buildInstallUrl(shopDomain, state),
      shopDomain,
    };
  }

  static async handleOAuthCallback(params: {
    code: string;
    shop: string;
    state: string;
    query: Record<string, string | string[] | undefined>;
  }) {
    const shopDomain = normalizeShopDomain(params.shop);

    logger.info(
      { shopDomain, hasCode: Boolean(params.code), hasState: Boolean(params.state) },
      "Shopify OAuth callback received",
    );

    const { apiSecret } = getShopifyConfig();

    if (!verifyOAuthHmac(params.query, apiSecret)) {
      logger.warn({ shopDomain }, "Shopify OAuth HMAC verification failed");

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid Shopify OAuth signature",
      });
    }

    const oauthState = await consumeOAuthState(params.state);
    if (!oauthState) {
      logger.warn({ shopDomain }, "Shopify OAuth state expired or invalid");

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "OAuth state expired or invalid",
      });
    }

    if (shopDomain !== oauthState.shopDomain) {
      logger.warn(
        {
          shopDomain,
          expectedShopDomain: oauthState.shopDomain,
          teamId: oauthState.teamId,
        },
        "Shopify OAuth shop domain mismatch",
      );

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Shop domain mismatch",
      });
    }

    let tokenSet;

    try {
      tokenSet = await exchangeAccessToken(shopDomain, params.code);
    } catch (error) {
      logger.error(
        {
          shopDomain,
          teamId: oauthState.teamId,
          ...getShopifyOAuthErrorLogFields(error),
        },
        "Shopify OAuth token exchange failed",
      );
      throw error;
    }

    let shop;

    try {
      const client = new ShopifyClient(shopDomain, tokenSet.accessToken);
      shop = await client.getShop();
    } catch (error) {
      logger.error(
        {
          shopDomain,
          teamId: oauthState.teamId,
          ...getShopifyOAuthErrorLogFields(error),
        },
        "Shopify shop lookup failed after OAuth",
      );
      throw error;
    }

    let store;

    try {
      store = await db.shopifyStore.upsert({
        where: { shopDomain },
        create: {
          teamId: oauthState.teamId,
          shopDomain,
          accessToken: tokenSet.accessToken,
          refreshToken: tokenSet.refreshToken,
          accessTokenExpiresAt: tokenSet.accessTokenExpiresAt,
          refreshTokenExpiresAt: tokenSet.refreshTokenExpiresAt,
          scope: tokenSet.scope,
          status: ShopifyStoreStatus.ACTIVE,
          shopName: shop.name,
          shopEmail: shop.email,
          currency: shop.currency,
          timezone: shop.iana_timezone,
          installedAt: new Date(),
          lastSyncAt: new Date(),
        },
        update: {
          teamId: oauthState.teamId,
          accessToken: tokenSet.accessToken,
          refreshToken: tokenSet.refreshToken,
          accessTokenExpiresAt: tokenSet.accessTokenExpiresAt,
          refreshTokenExpiresAt: tokenSet.refreshTokenExpiresAt,
          scope: tokenSet.scope,
          status: ShopifyStoreStatus.ACTIVE,
          shopName: shop.name,
          shopEmail: shop.email,
          currency: shop.currency,
          timezone: shop.iana_timezone,
          uninstalledAt: null,
          lastSyncAt: new Date(),
          syncError: null,
        },
      });
    } catch (error) {
      logger.error(
        {
          shopDomain,
          teamId: oauthState.teamId,
          oauthErrorCode: classifyShopifyOAuthError(error),
          ...getShopifyOAuthErrorLogFields(error),
        },
        "Shopify store upsert failed after OAuth",
      );
      throw error;
    }

    logger.info(
      {
        shopDomain,
        teamId: oauthState.teamId,
        storeId: store.id,
        scope: tokenSet.scope,
      },
      "Shopify store connected successfully",
    );

    ShopifySyncService.scheduleSync(store.id);

    return {
      teamId: oauthState.teamId,
      store,
    };
  }

  static async getStoreForTeam(teamId: number) {
    return db.shopifyStore.findFirst({
      where: {
        teamId,
        status: ShopifyStoreStatus.ACTIVE,
      },
      select: {
        id: true,
        teamId: true,
        shopDomain: true,
        shopName: true,
        shopEmail: true,
        currency: true,
        timezone: true,
        scope: true,
        status: true,
        syncStatus: true,
        syncError: true,
        productCount: true,
        customerCount: true,
        orderCount: true,
        installedAt: true,
        lastSyncAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  static async disconnectStore(teamId: number) {
    const store = await db.shopifyStore.findFirst({
      where: {
        teamId,
        status: ShopifyStoreStatus.ACTIVE,
      },
    });

    if (!store) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No connected Shopify store found",
      });
    }

    return db.shopifyStore.update({
      where: { id: store.id },
      data: {
        status: ShopifyStoreStatus.DISCONNECTED,
        uninstalledAt: new Date(),
      },
    });
  }

  static async markUninstalled(shopDomain: string) {
    const normalizedDomain = normalizeShopDomain(shopDomain);

    const store = await db.shopifyStore.findUnique({
      where: { shopDomain: normalizedDomain },
    });

    if (!store) {
      return null;
    }

    return db.shopifyStore.update({
      where: { id: store.id },
      data: {
        status: ShopifyStoreStatus.UNINSTALLED,
        uninstalledAt: new Date(),
      },
    });
  }
}

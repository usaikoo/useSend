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
import { ShopifySyncService } from "~/server/service/shopify-sync-service";

export class ShopifyService {
  static isConfigured() {
    try {
      getShopifyConfig();
      return true;
    } catch {
      return false;
    }
  }

  static async getInstallUrl(teamId: number, shopInput: string) {
    const shopDomain = normalizeShopDomain(shopInput);
    const state = await createOAuthState(teamId, shopDomain);

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
    const { apiSecret } = getShopifyConfig();

    if (!verifyOAuthHmac(params.query, apiSecret)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid Shopify OAuth signature",
      });
    }

    const oauthState = await consumeOAuthState(params.state);
    if (!oauthState) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "OAuth state expired or invalid",
      });
    }

    const shopDomain = normalizeShopDomain(params.shop);
    if (shopDomain !== oauthState.shopDomain) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Shop domain mismatch",
      });
    }

    const { accessToken, scope } = await exchangeAccessToken(
      shopDomain,
      params.code,
    );

    const client = new ShopifyClient(shopDomain, accessToken);
    const shop = await client.getShop();

    const store = await db.shopifyStore.upsert({
      where: { shopDomain },
      create: {
        teamId: oauthState.teamId,
        shopDomain,
        accessToken,
        scope,
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
        accessToken,
        scope,
        status: ShopifyStoreStatus.ACTIVE,
        shopName: shop.name,
        shopEmail: shop.email,
        currency: shop.currency,
        timezone: shop.iana_timezone,
        uninstalledAt: null,
        lastSyncAt: new Date(),
      },
    });

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

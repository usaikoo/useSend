import { ShopifyStoreStatus } from "@prisma/client";
import { ShopifyClient } from "~/server/shopify/client";
import {
  cycleToExpiringOfflineToken,
  refreshOfflineAccessToken,
} from "~/server/shopify/oauth";
import {
  isNonExpiringTokenError,
  SHOPIFY_REAUTH_REQUIRED_MESSAGE,
  shouldRefreshAccessToken,
  type ShopifyOfflineTokenSet,
} from "~/server/shopify/token-types";
import { db } from "~/server/db";

const refreshLocks = new Map<string, Promise<void>>();

export class ShopifyTokenService {
  static async persistTokenSet(storeId: string, tokenSet: ShopifyOfflineTokenSet) {
    await db.shopifyStore.update({
      where: { id: storeId },
      data: {
        accessToken: tokenSet.accessToken,
        refreshToken: tokenSet.refreshToken,
        accessTokenExpiresAt: tokenSet.accessTokenExpiresAt,
        refreshTokenExpiresAt: tokenSet.refreshTokenExpiresAt,
        scope: tokenSet.scope,
      },
    });
  }

  static async refreshStoreToken(storeId: string) {
    const existingLock = refreshLocks.get(storeId);
    if (existingLock) {
      await existingLock;
      return;
    }

    const refreshPromise = this.refreshStoreTokenInternal(storeId).finally(() => {
      refreshLocks.delete(storeId);
    });

    refreshLocks.set(storeId, refreshPromise);
    await refreshPromise;
  }

  private static async refreshStoreTokenInternal(storeId: string) {
    const store = await db.shopifyStore.findUnique({ where: { id: storeId } });

    if (!store || store.status !== ShopifyStoreStatus.ACTIVE) {
      throw new Error("No active Shopify store found");
    }

    if (!store.refreshToken) {
      throw new Error(SHOPIFY_REAUTH_REQUIRED_MESSAGE);
    }

    try {
      const tokenSet = await refreshOfflineAccessToken(
        store.shopDomain,
        store.refreshToken,
      );
      await this.persistTokenSet(storeId, tokenSet);
    } catch (error) {
      if (error instanceof Error && error.message.includes("(401)")) {
        throw new Error(SHOPIFY_REAUTH_REQUIRED_MESSAGE);
      }

      throw error;
    }
  }

  static async cycleLegacyTokenIfNeeded(storeId: string) {
    const store = await db.shopifyStore.findUnique({ where: { id: storeId } });

    if (!store || store.status !== ShopifyStoreStatus.ACTIVE) {
      throw new Error("No active Shopify store found");
    }

    if (store.refreshToken) {
      return false;
    }

    const tokenSet = await cycleToExpiringOfflineToken(
      store.shopDomain,
      store.accessToken,
    );
    await this.persistTokenSet(storeId, tokenSet);
    return true;
  }

  static async ensureValidAccessToken(storeId: string) {
    const store = await db.shopifyStore.findUnique({ where: { id: storeId } });

    if (!store || store.status !== ShopifyStoreStatus.ACTIVE) {
      throw new Error("No active Shopify store found");
    }

    if (shouldRefreshAccessToken(store.accessTokenExpiresAt, store.refreshToken)) {
      await this.refreshStoreToken(storeId);

      const refreshedStore = await db.shopifyStore.findUnique({
        where: { id: storeId },
      });

      if (!refreshedStore) {
        throw new Error("No active Shopify store found");
      }

      return {
        shopDomain: refreshedStore.shopDomain,
        accessToken: refreshedStore.accessToken,
      };
    }

    return {
      shopDomain: store.shopDomain,
      accessToken: store.accessToken,
    };
  }

  static async getClientForStore(storeId: string) {
    const store = await db.shopifyStore.findUnique({ where: { id: storeId } });

    if (!store || store.status !== ShopifyStoreStatus.ACTIVE) {
      throw new Error("No active Shopify store found");
    }

    if (!store.refreshToken) {
      try {
        await this.cycleLegacyTokenIfNeeded(storeId);
      } catch {
        throw new Error(SHOPIFY_REAUTH_REQUIRED_MESSAGE);
      }
    }

    const credentials = await this.ensureValidAccessToken(storeId);
    return new ShopifyClient(
      credentials.shopDomain,
      credentials.accessToken,
    );
  }

  static async withClient<T>(
    storeId: string,
    operation: (client: ShopifyClient) => Promise<T>,
  ) {
    try {
      const client = await this.getClientForStore(storeId);
      return await operation(client);
    } catch (error) {
      if (!isNonExpiringTokenError(error)) {
        throw error;
      }

      const cycled = await this.cycleLegacyTokenIfNeeded(storeId);
      if (!cycled) {
        throw new Error(SHOPIFY_REAUTH_REQUIRED_MESSAGE);
      }

      const client = await this.getClientForStore(storeId);
      return operation(client);
    }
  }
}

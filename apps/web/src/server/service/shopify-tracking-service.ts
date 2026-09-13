import { Prisma, ShopifyStoreStatus } from "@prisma/client";
import { env } from "~/env";
import { db } from "~/server/db";
import {
  buildTrackingScriptUrl,
  buildTrackingSnippet,
} from "~/server/shopify/storefront-tracker-script";
import {
  storefrontEventInputSchema,
  type StorefrontEventInput,
} from "~/server/shopify/storefront-events";
import { ShopifyVisitorService } from "~/server/service/shopify-visitor-service";

export class ShopifyTrackingService {
  static getAppUrl() {
    const appUrl = env.SHOPIFY_APP_URL ?? env.NEXTAUTH_URL;

    if (!appUrl) {
      throw new Error("App URL is not configured");
    }

    return appUrl.replace(/\/$/, "");
  }

  static async getTrackingSetupForTeam(teamId: number) {
    const store = await db.shopifyStore.findFirst({
      where: {
        teamId,
        status: ShopifyStoreStatus.ACTIVE,
      },
      select: {
        id: true,
        trackingPublicKey: true,
        shopDomain: true,
      },
    });

    if (!store) {
      return null;
    }

    const appUrl = this.getAppUrl();

    return {
      trackingPublicKey: store.trackingPublicKey,
      scriptUrl: buildTrackingScriptUrl(appUrl, store.trackingPublicKey),
      snippet: buildTrackingSnippet(appUrl, store.trackingPublicKey),
      endpoint: `${appUrl}/api/track/shopify`,
    };
  }

  static async getRecentEventsForTeam(teamId: number, limit = 20) {
    const store = await db.shopifyStore.findFirst({
      where: {
        teamId,
        status: ShopifyStoreStatus.ACTIVE,
      },
      select: { id: true },
    });

    if (!store) {
      return [];
    }

    return db.shopifyStorefrontEvent.findMany({
      where: { storeId: store.id },
      orderBy: { occurredAt: "desc" },
      take: limit,
      select: {
        id: true,
        eventType: true,
        path: true,
        productHandle: true,
        searchQuery: true,
        quantity: true,
        value: true,
        currency: true,
        occurredAt: true,
      },
    });
  }

  static async getEventStatsForTeam(teamId: number) {
    const store = await db.shopifyStore.findFirst({
      where: {
        teamId,
        status: ShopifyStoreStatus.ACTIVE,
      },
      select: { id: true },
    });

    if (!store) {
      return [];
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const grouped = await db.shopifyStorefrontEvent.groupBy({
      by: ["eventType"],
      where: {
        storeId: store.id,
        occurredAt: { gte: since },
      },
      _count: { _all: true },
    });

    return grouped.map((row) => ({
      eventType: row.eventType,
      count: row._count._all,
    }));
  }

  static async getStoreByTrackingKey(trackingKey: string) {
    return db.shopifyStore.findFirst({
      where: {
        trackingPublicKey: trackingKey,
        status: ShopifyStoreStatus.ACTIVE,
      },
      select: {
        id: true,
        shopDomain: true,
      },
    });
  }

  static parseEventInput(body: unknown) {
    return storefrontEventInputSchema.parse(body);
  }

  static async recordEvent(
    input: StorefrontEventInput,
    requestMeta?: { userAgent?: string | null },
  ) {
    const store = await this.getStoreByTrackingKey(input.key);

    if (!store) {
      return null;
    }

    const metadata =
      input.metadata === undefined
        ? undefined
        : (input.metadata as Prisma.InputJsonValue);

    const event = await db.shopifyStorefrontEvent.create({
      data: {
        storeId: store.id,
        sessionId: input.sessionId,
        visitorId: input.visitorId,
        eventType: input.eventType,
        url: input.url,
        path: input.path,
        referrer: input.referrer,
        productId: input.productId,
        productHandle: input.productHandle,
        variantId: input.variantId,
        collectionHandle: input.collectionHandle,
        searchQuery: input.searchQuery,
        orderId: input.orderId,
        value: input.value,
        currency: input.currency,
        quantity: input.quantity,
        metadata,
        userAgent: requestMeta?.userAgent ?? undefined,
        occurredAt: input.occurredAt ? new Date(input.occurredAt) : new Date(),
      },
    });

    if (input.visitorId) {
      await ShopifyVisitorService.upsertFromEvent({
        storeId: store.id,
        visitorId: input.visitorId,
        email: input.email,
        shopifyCustomerId: input.shopifyCustomerId,
        firstName: input.firstName,
        lastName: input.lastName,
      });
    }

    return event;
  }
}

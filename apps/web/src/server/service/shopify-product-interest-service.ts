import { subHours } from "date-fns";
import { db } from "~/server/db";

export type ProductInterestCandidate = {
  visitorId: string;
  shopifyProductId: string;
  productViewCount: number;
  recipientEmail: string | null;
  firstName: string | null;
  emailMarketingConsent: boolean | null;
  productTitle: string;
  productDescription: string | null;
  productUrl: string | null;
  productPrice: number | null;
  productInStock: boolean;
  hasPurchasedProduct: boolean;
  recentMarketingEmailCount: number;
  hasRecentProductAction: boolean;
};

export class ShopifyProductInterestService {
  static async findCandidates(storeId: string) {
    const settings = await db.shopifyMarketingSettings.findUnique({
      where: { storeId },
    });

    if (!settings) {
      return [];
    }

    const since = subHours(new Date(), settings.viewWindowHours);
    const productViews = await db.shopifyStorefrontEvent.findMany({
      where: {
        storeId,
        eventType: "PRODUCT_VIEW",
        occurredAt: { gte: since },
        visitorId: { not: null },
        productId: { not: null },
      },
      select: {
        visitorId: true,
        productId: true,
      },
    });

    const grouped = new Map<string, number>();

    for (const event of productViews) {
      if (!event.visitorId || !event.productId) {
        continue;
      }

      const key = `${event.visitorId}:${event.productId}`;
      grouped.set(key, (grouped.get(key) ?? 0) + 1);
    }

    const candidates: ProductInterestCandidate[] = [];

    for (const [key, count] of grouped.entries()) {
      if (count < settings.minProductViews) {
        continue;
      }

      const [visitorId, shopifyProductId] = key.split(":");
      if (!visitorId || !shopifyProductId) {
        continue;
      }

      const candidate = await this.buildCandidate({
        storeId,
        visitorId,
        shopifyProductId,
        productViewCount: count,
        settings,
        since,
      });

      if (candidate) {
        candidates.push(candidate);
      }
    }

    return candidates;
  }

  private static async buildCandidate(input: {
    storeId: string;
    visitorId: string;
    shopifyProductId: string;
    productViewCount: number;
    settings: {
      cooldownHours: number;
      maxEmailsPerVisitorWeek: number;
    };
    since: Date;
  }) {
    const product = await db.shopifyProduct.findUnique({
      where: {
        storeId_shopifyId: {
          storeId: input.storeId,
          shopifyId: input.shopifyProductId,
        },
      },
    });

    if (!product) {
      return null;
    }

    const visitor = await db.shopifyVisitorProfile.findUnique({
      where: {
        storeId_visitorId: {
          storeId: input.storeId,
          visitorId: input.visitorId,
        },
      },
    });

    const purchase = await db.shopifyStorefrontEvent.findFirst({
      where: {
        storeId: input.storeId,
        visitorId: input.visitorId,
        eventType: "PURCHASE",
        productId: input.shopifyProductId,
        occurredAt: { gte: input.since },
      },
    });

    let purchasedFromOrders = false;

    if (visitor?.email) {
      const recentOrders = await db.shopifyOrder.findMany({
        where: {
          storeId: input.storeId,
          email: visitor.email,
          shopifyCreatedAt: { gte: input.since },
        },
        select: { lineItems: true },
      });

      purchasedFromOrders = recentOrders.some((order) => {
        if (!Array.isArray(order.lineItems)) {
          return false;
        }

        return order.lineItems.some((item) => {
          if (!item || typeof item !== "object") {
            return false;
          }

          const productId = (item as { product_id?: number | string }).product_id;
          return productId != null && String(productId) === input.shopifyProductId;
        });
      });
    }

    const cooldownSince = subHours(new Date(), input.settings.cooldownHours);
    const recentProductAction = await db.rioReplyAction.findFirst({
      where: {
        storeId: input.storeId,
        visitorId: input.visitorId,
        shopifyProductId: input.shopifyProductId,
        status: "SENT",
        createdAt: { gte: cooldownSince },
      },
    });

    const weekSince = subHours(new Date(), 24 * 7);
    const recentMarketingEmailCount = await db.rioReplyAction.count({
      where: {
        storeId: input.storeId,
        visitorId: input.visitorId,
        status: "SENT",
        createdAt: { gte: weekSince },
      },
    });

    return {
      visitorId: input.visitorId,
      shopifyProductId: input.shopifyProductId,
      productViewCount: input.productViewCount,
      recipientEmail: visitor?.email ?? null,
      firstName: visitor?.firstName ?? null,
      emailMarketingConsent: visitor?.emailMarketingConsent ?? null,
      productTitle: product.title,
      productDescription: product.description,
      productUrl: product.productUrl,
      productPrice: product.priceMin,
      productInStock: product.inventoryTotal > 0,
      hasPurchasedProduct: Boolean(purchase) || purchasedFromOrders,
      recentMarketingEmailCount,
      hasRecentProductAction: Boolean(recentProductAction),
    } satisfies ProductInterestCandidate;
  }
}

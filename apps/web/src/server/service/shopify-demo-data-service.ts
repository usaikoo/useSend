import { TRPCError } from "@trpc/server";
import { subMinutes } from "date-fns";
import { db } from "~/server/db";

export const DEMO_VISITOR_ID_PREFIX = "rioreply-demo-visitor";
export const DEMO_SESSION_ID_PREFIX = "rioreply-demo-session";
export const DEMO_CUSTOMER_SHOPIFY_ID = "rioreply-demo-customer";
export const DEMO_ORDER_SHOPIFY_ID = "rioreply-demo-order";

/** @deprecated Use createDemoVisitorId() for fresh test runs */
export const DEMO_VISITOR_ID = `${DEMO_VISITOR_ID_PREFIX}-legacy`;
export const DEMO_SESSION_ID = `${DEMO_SESSION_ID_PREFIX}-legacy`;

function createDemoScopedId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createDemoVisitorId() {
  return createDemoScopedId(DEMO_VISITOR_ID_PREFIX);
}

export function createDemoSessionId() {
  return createDemoScopedId(DEMO_SESSION_ID_PREFIX);
}

export type SeedDemoDataInput = {
  storeId: string;
  recipientEmail: string;
};

export type SeedDemoDataResult = {
  recipientEmail: string;
  visitorId: string;
  productTitle: string;
  productViewsCreated: number;
  customerCount: number;
  orderCount: number;
};

export class ShopifyDemoDataService {
  static async seedForStore(input: SeedDemoDataInput): Promise<SeedDemoDataResult> {
    const store = await db.shopifyStore.findUnique({
      where: { id: input.storeId },
    });

    if (!store) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Shopify store not found",
      });
    }

    const product = await db.shopifyProduct.findFirst({
      where: { storeId: store.id },
      orderBy: { createdAt: "asc" },
    });

    if (!product) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Sync at least one product before generating demo data.",
      });
    }

    if (product.inventoryTotal <= 0) {
      await db.shopifyProduct.update({
        where: { id: product.id },
        data: { inventoryTotal: 10 },
      });
    }

    const customer = await db.shopifyCustomer.upsert({
      where: {
        storeId_shopifyId: {
          storeId: store.id,
          shopifyId: DEMO_CUSTOMER_SHOPIFY_ID,
        },
      },
      create: {
        storeId: store.id,
        shopifyId: DEMO_CUSTOMER_SHOPIFY_ID,
        email: input.recipientEmail.toLowerCase(),
        firstName: "Demo",
        lastName: "Shopper",
        ordersCount: 1,
        totalSpent: product.priceMin ?? 29.99,
        emailMarketingConsent: true,
        shopifyCreatedAt: subMinutes(new Date(), 60 * 24 * 30),
      },
      update: {
        email: input.recipientEmail.toLowerCase(),
        firstName: "Demo",
        lastName: "Shopper",
        emailMarketingConsent: true,
      },
    });

    await db.shopifyOrder.upsert({
      where: {
        storeId_shopifyId: {
          storeId: store.id,
          shopifyId: DEMO_ORDER_SHOPIFY_ID,
        },
      },
      create: {
        storeId: store.id,
        shopifyId: DEMO_ORDER_SHOPIFY_ID,
        customerId: customer.id,
        orderNumber: "DEMO-1001",
        email: input.recipientEmail.toLowerCase(),
        financialStatus: "paid",
        fulfillmentStatus: "fulfilled",
        totalPrice: product.priceMin ?? 29.99,
        currency: store.currency ?? "USD",
        lineItems: [
          {
            product_id: product.shopifyId,
            title: product.title,
            quantity: 1,
            price: product.priceMin ?? 29.99,
          },
        ],
        shopifyCreatedAt: subMinutes(new Date(), 60 * 24 * 14),
      },
      update: {
        customerId: customer.id,
        email: input.recipientEmail.toLowerCase(),
        lineItems: [
          {
            product_id: product.shopifyId,
            title: product.title,
            quantity: 1,
            price: product.priceMin ?? 29.99,
          },
        ],
      },
    });

    const visitorId = createDemoVisitorId();
    const sessionId = createDemoSessionId();

    await db.shopifyVisitorProfile.create({
      data: {
        storeId: store.id,
        visitorId,
        email: input.recipientEmail.toLowerCase(),
        shopifyCustomerId: DEMO_CUSTOMER_SHOPIFY_ID,
        firstName: "Demo",
        lastName: "Shopper",
        emailMarketingConsent: true,
      },
    });

    const viewTimes = [45, 30, 15];
    const productViewsCreated = viewTimes.length;

    await db.shopifyStorefrontEvent.createMany({
      data: viewTimes.map((minutesAgo) => ({
        storeId: store.id,
        sessionId,
        visitorId,
        eventType: "PRODUCT_VIEW" as const,
        path: product.handle ? `/products/${product.handle}` : "/products/demo",
        productId: product.shopifyId,
        productHandle: product.handle,
        url: product.productUrl,
        occurredAt: subMinutes(new Date(), minutesAgo),
      })),
    });

    await db.shopifyStorefrontEvent.create({
      data: {
        storeId: store.id,
        sessionId,
        visitorId,
        eventType: "PAGE_VIEW",
        path: "/",
        occurredAt: subMinutes(new Date(), 50),
      },
    });

    const [customerCount, orderCount] = await Promise.all([
      db.shopifyCustomer.count({ where: { storeId: store.id } }),
      db.shopifyOrder.count({ where: { storeId: store.id } }),
    ]);

    await db.shopifyStore.update({
      where: { id: store.id },
      data: {
        customerCount,
        orderCount,
        syncError: null,
      },
    });

    return {
      recipientEmail: input.recipientEmail.toLowerCase(),
      visitorId,
      productTitle: product.title,
      productViewsCreated,
      customerCount,
      orderCount,
    };
  }
}

import { ShopifySyncStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { ShopifyClient } from "~/server/shopify/client";
import { ShopifyTokenService } from "~/server/service/shopify-token-service";
import {
  SHOPIFY_PRODUCT_WEBHOOK_TOPICS,
  SHOPIFY_PROTECTED_WEBHOOK_TOPICS,
} from "~/server/shopify/constants";
import {
  mapCustomerToUpsert,
  mapOrderToUpsert,
  mapProductToUpsert,
} from "~/server/shopify/mappers";
import { getShopifyConfig } from "~/server/shopify/oauth";
import {
  isCustomerDataSyncEnabled,
  isProtectedCustomerDataError,
  PROTECTED_CUSTOMER_DATA_MESSAGE,
} from "~/server/shopify/protected-data";
import type {
  ShopifyRestCustomer,
  ShopifyRestOrder,
  ShopifyRestProduct,
} from "~/server/shopify/types";
import { logger } from "~/server/logger/log";
import { ShopifyVisitorService } from "~/server/service/shopify-visitor-service";

export class ShopifySyncService {
  static async getActiveStoreForTeam(teamId: number) {
    const store = await db.shopifyStore.findFirst({
      where: { teamId, status: "ACTIVE" },
    });

    if (!store) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No connected Shopify store found",
      });
    }

    return store;
  }

  static async registerWebhooks(storeId: string) {
    const store = await db.shopifyStore.findUnique({ where: { id: storeId } });
    if (!store) {
      return;
    }

    const { appUrl } = getShopifyConfig();
    const webhookUrl = `${appUrl.replace(/\/$/, "")}/api/webhook/shopify`;
    const client = await ShopifyTokenService.getClientForStore(storeId);
    const existing = await client.listWebhooks();
    const existingTopics = new Set(existing.map((webhook) => webhook.topic));

    const topics = isCustomerDataSyncEnabled()
      ? [...SHOPIFY_PRODUCT_WEBHOOK_TOPICS, ...SHOPIFY_PROTECTED_WEBHOOK_TOPICS]
      : [...SHOPIFY_PRODUCT_WEBHOOK_TOPICS];

    for (const topic of topics) {
      if (existingTopics.has(topic)) {
        continue;
      }

      await client.createWebhook(topic, webhookUrl);
    }
  }

  static async syncAll(storeId: string) {
    const store = await db.shopifyStore.findUnique({ where: { id: storeId } });
    if (!store || store.status !== "ACTIVE") {
      return null;
    }

    await db.shopifyStore.update({
      where: { id: storeId },
      data: {
        syncStatus: ShopifySyncStatus.SYNCING,
        syncError: null,
      },
    });

    let customerDataNote: string | null = null;

    try {
      await ShopifyTokenService.withClient(store.id, async (client) => {
        await this.syncProducts(store.id, store.shopDomain, client);

        if (isCustomerDataSyncEnabled()) {
          try {
            await this.syncCustomers(store.id, client);
            await this.syncOrders(store.id, client);
          } catch (error) {
            if (isProtectedCustomerDataError(error)) {
              customerDataNote = PROTECTED_CUSTOMER_DATA_MESSAGE;
              logger.warn(
                { storeId },
                "Shopify protected customer data not approved; skipping customers and orders",
              );
            } else {
              throw error;
            }
          }
        } else {
          customerDataNote = PROTECTED_CUSTOMER_DATA_MESSAGE;
        }
      });

      await this.registerWebhooks(store.id);

      const [productCount, customerCount, orderCount] = await Promise.all([
        db.shopifyProduct.count({ where: { storeId: store.id } }),
        db.shopifyCustomer.count({ where: { storeId: store.id } }),
        db.shopifyOrder.count({ where: { storeId: store.id } }),
      ]);

      return await db.shopifyStore.update({
        where: { id: store.id },
        data: {
          syncStatus: ShopifySyncStatus.IDLE,
          syncError: customerDataNote,
          productCount,
          customerCount,
          orderCount,
          lastSyncAt: new Date(),
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown sync error";

      logger.error({ storeId, error: message }, "Shopify sync failed");

      await db.shopifyStore.update({
        where: { id: storeId },
        data: {
          syncStatus: ShopifySyncStatus.FAILED,
          syncError: message,
        },
      });

      throw error;
    }
  }

  static async syncAllForTeam(teamId: number) {
    const store = await this.getActiveStoreForTeam(teamId);
    return this.syncAll(store.id);
  }

  static scheduleSync(storeId: string) {
    void this.syncAll(storeId).catch((error) => {
      logger.error({ storeId, error }, "Background Shopify sync failed");
    });
  }

  static async syncProducts(
    storeId: string,
    shopDomain: string,
    client: ShopifyClient,
  ) {
    const products = await client.listProducts();

    for (const product of products) {
      await db.shopifyProduct.upsert(
        mapProductToUpsert(storeId, shopDomain, product),
      );
    }
  }

  static async syncCustomers(storeId: string, client: ShopifyClient) {
    const customers = await client.listCustomers();

    for (const customer of customers) {
      await db.shopifyCustomer.upsert(mapCustomerToUpsert(storeId, customer));
    }
  }

  static async syncOrders(storeId: string, client: ShopifyClient) {
    const orders = await client.listOrders();

    for (const order of orders) {
      await this.upsertOrder(storeId, order, client);
    }
  }

  static async upsertOrder(
    storeId: string,
    order: ShopifyRestOrder,
    client?: ShopifyClient,
  ) {
    let customerId: string | null = null;

    if (order.customer?.id && isCustomerDataSyncEnabled()) {
      const shopifyCustomerId = String(order.customer.id);
      let customer = await db.shopifyCustomer.findUnique({
        where: {
          storeId_shopifyId: {
            storeId,
            shopifyId: shopifyCustomerId,
          },
        },
      });

      if (!customer && client) {
        const remoteCustomer = await client.getCustomer(shopifyCustomerId);
        customer = await db.shopifyCustomer.upsert(
          mapCustomerToUpsert(storeId, remoteCustomer),
        );
      }

      customerId = customer?.id ?? null;
    }

    const savedOrder = await db.shopifyOrder.upsert(
      mapOrderToUpsert(storeId, order, customerId),
    );

    if (customerId && order.created_at) {
      const orderDate = new Date(order.created_at);
      const customer = await db.shopifyCustomer.findUnique({
        where: { id: customerId },
      });

      if (
        customer &&
        (!customer.lastOrderAt || customer.lastOrderAt < orderDate)
      ) {
        await db.shopifyCustomer.update({
          where: { id: customerId },
          data: { lastOrderAt: orderDate },
        });
      }
    }

    return savedOrder;
  }

  static async upsertProduct(
    storeId: string,
    shopDomain: string,
    product: ShopifyRestProduct,
  ) {
    return db.shopifyProduct.upsert(
      mapProductToUpsert(storeId, shopDomain, product),
    );
  }

  static async upsertCustomer(storeId: string, customer: ShopifyRestCustomer) {
    const saved = await db.shopifyCustomer.upsert(
      mapCustomerToUpsert(storeId, customer),
    );

    await ShopifyVisitorService.syncConsentFromCustomer(
      storeId,
      String(customer.id),
    );

    return saved;
  }

  static async deleteProduct(storeId: string, shopifyProductId: string) {
    await db.shopifyProduct.deleteMany({
      where: { storeId, shopifyId: shopifyProductId },
    });
  }

  static async handleWebhookTopic(
    shopDomain: string,
    topic: string,
    payload: Record<string, unknown>,
  ) {
    const store = await db.shopifyStore.findUnique({
      where: { shopDomain },
    });

    if (!store || store.status !== "ACTIVE") {
      return;
    }

    const client = await ShopifyTokenService.getClientForStore(store.id);
    const isProtectedTopic = SHOPIFY_PROTECTED_WEBHOOK_TOPICS.includes(
      topic as (typeof SHOPIFY_PROTECTED_WEBHOOK_TOPICS)[number],
    );

    if (isProtectedTopic && !isCustomerDataSyncEnabled()) {
      return;
    }

    switch (topic) {
      case "products/create":
      case "products/update": {
        const product = payload as unknown as ShopifyRestProduct;
        await this.upsertProduct(store.id, store.shopDomain, product);
        break;
      }
      case "products/delete": {
        const productId = String(payload.id);
        await this.deleteProduct(store.id, productId);
        break;
      }
      case "customers/create":
      case "customers/update": {
        const customer = payload as unknown as ShopifyRestCustomer;
        await this.upsertCustomer(store.id, customer);
        break;
      }
      case "orders/create":
      case "orders/updated": {
        const order = payload as unknown as ShopifyRestOrder;
        await this.upsertOrder(store.id, order, client);
        break;
      }
      default:
        break;
    }

    const [productCount, customerCount, orderCount] = await Promise.all([
      db.shopifyProduct.count({ where: { storeId: store.id } }),
      db.shopifyCustomer.count({ where: { storeId: store.id } }),
      db.shopifyOrder.count({ where: { storeId: store.id } }),
    ]);

    await db.shopifyStore.update({
      where: { id: store.id },
      data: {
        productCount,
        customerCount,
        orderCount,
        lastSyncAt: new Date(),
      },
    });
  }
}

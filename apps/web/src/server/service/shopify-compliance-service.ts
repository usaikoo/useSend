import { db } from "~/server/db";
import { normalizeShopDomain } from "~/server/shopify/oauth";
import type {
  CustomersDataRequestPayload,
  CustomersRedactPayload,
  ShopRedactPayload,
} from "~/server/shopify/compliance-webhooks";
import { logger } from "~/server/logger/log";

export class ShopifyComplianceService {
  static async handleCustomersDataRequest(
    payload: CustomersDataRequestPayload,
  ) {
    const shopDomain = normalizeShopDomain(payload.shop_domain);
    const store = await db.shopifyStore.findUnique({
      where: { shopDomain },
      select: { id: true, teamId: true, shopEmail: true },
    });

    const customerData = store
      ? await this.collectCustomerData(store.id, payload)
      : null;

    logger.info(
      {
        topic: "customers/data_request",
        shopDomain,
        storeId: store?.id,
        dataRequestId: payload.data_request?.id,
        customerId: payload.customer.id,
        customerEmail: payload.customer.email,
        ordersRequested: payload.orders_requested ?? [],
        customerData,
      },
      "Shopify customer data request received",
    );

    return {
      acknowledged: true,
      storeFound: Boolean(store),
      customerData,
    };
  }

  static async handleCustomersRedact(payload: CustomersRedactPayload) {
    const shopDomain = normalizeShopDomain(payload.shop_domain);
    const store = await db.shopifyStore.findUnique({
      where: { shopDomain },
      select: { id: true },
    });

    if (!store) {
      logger.info(
        { topic: "customers/redact", shopDomain },
        "Shopify customer redact received for unknown store",
      );
      return { redacted: false, reason: "STORE_NOT_FOUND" as const };
    }

    const result = await this.redactCustomerData(store.id, payload);

    logger.info(
      {
        topic: "customers/redact",
        shopDomain,
        storeId: store.id,
        customerId: payload.customer.id,
        customerEmail: payload.customer.email,
        ordersToRedact: payload.orders_to_redact ?? [],
        result,
      },
      "Shopify customer redact completed",
    );

    return result;
  }

  static async handleShopRedact(payload: ShopRedactPayload) {
    const shopDomain = normalizeShopDomain(payload.shop_domain);
    const store = await db.shopifyStore.findUnique({
      where: { shopDomain },
      select: { id: true, teamId: true },
    });

    if (!store) {
      logger.info(
        { topic: "shop/redact", shopDomain },
        "Shopify shop redact received for unknown store",
      );
      return { redacted: false, reason: "STORE_NOT_FOUND" as const };
    }

    await db.shopifyStore.delete({
      where: { id: store.id },
    });

    logger.info(
      {
        topic: "shop/redact",
        shopDomain,
        storeId: store.id,
        teamId: store.teamId,
      },
      "Shopify shop redact completed",
    );

    return { redacted: true };
  }

  private static async collectCustomerData(
    storeId: string,
    payload: CustomersDataRequestPayload,
  ) {
    const shopifyCustomerId = payload.customer.id
      ? String(payload.customer.id)
      : undefined;
    const email = payload.customer.email;

    const customer = await db.shopifyCustomer.findFirst({
      where: {
        storeId,
        OR: [
          ...(shopifyCustomerId ? [{ shopifyId: shopifyCustomerId }] : []),
          ...(email ? [{ email }] : []),
        ],
      },
      select: {
        id: true,
        shopifyId: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        ordersCount: true,
        totalSpent: true,
        emailMarketingConsent: true,
        lastOrderAt: true,
        shopifyCreatedAt: true,
      },
    });

    const orders = await db.shopifyOrder.findMany({
      where: {
        storeId,
        OR: [
          ...(customer ? [{ customerId: customer.id }] : []),
          ...(email ? [{ email }] : []),
          ...(payload.orders_requested?.length
            ? [
                {
                  shopifyId: {
                    in: payload.orders_requested.map(String),
                  },
                },
              ]
            : []),
        ],
      },
      select: {
        shopifyId: true,
        orderNumber: true,
        email: true,
        totalPrice: true,
        currency: true,
        financialStatus: true,
        shopifyCreatedAt: true,
      },
    });

    const visitorProfiles = await db.shopifyVisitorProfile.findMany({
      where: {
        storeId,
        OR: [
          ...(shopifyCustomerId ? [{ shopifyCustomerId }] : []),
          ...(email ? [{ email }] : []),
        ],
      },
      select: {
        visitorId: true,
        email: true,
        firstName: true,
        lastName: true,
        emailMarketingConsent: true,
        lastMarketingEmailAt: true,
      },
    });

    const actions = await db.rioReplyAction.findMany({
      where: {
        storeId,
        ...(email ? { recipientEmail: email } : {}),
      },
      select: {
        triggerType: true,
        status: true,
        productTitle: true,
        subject: true,
        explanation: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return {
      customer,
      orders,
      visitorProfiles,
      actions,
    };
  }

  private static async redactCustomerData(
    storeId: string,
    payload: CustomersRedactPayload,
  ) {
    const shopifyCustomerId = payload.customer.id
      ? String(payload.customer.id)
      : undefined;
    const email = payload.customer.email;

    const customers = await db.shopifyCustomer.findMany({
      where: {
        storeId,
        OR: [
          ...(shopifyCustomerId ? [{ shopifyId: shopifyCustomerId }] : []),
          ...(email ? [{ email }] : []),
        ],
      },
      select: { id: true },
    });

    const customerIds = customers.map((customer) => customer.id);

    if (customerIds.length > 0) {
      await db.shopifyOrder.deleteMany({
        where: { customerId: { in: customerIds } },
      });
      await db.shopifyCustomer.deleteMany({
        where: { id: { in: customerIds } },
      });
    }

    if (payload.orders_to_redact?.length) {
      await db.shopifyOrder.deleteMany({
        where: {
          storeId,
          shopifyId: {
            in: payload.orders_to_redact.map(String),
          },
        },
      });
    }

    if (email) {
      await db.shopifyOrder.deleteMany({
        where: { storeId, email },
      });
    }

    await db.shopifyVisitorProfile.deleteMany({
      where: {
        storeId,
        OR: [
          ...(shopifyCustomerId ? [{ shopifyCustomerId }] : []),
          ...(email ? [{ email }] : []),
        ],
      },
    });

    if (email) {
      await db.rioReplyAction.deleteMany({
        where: {
          storeId,
          recipientEmail: email,
        },
      });
    }

    return {
      redacted: true,
      deletedCustomers: customerIds.length,
    };
  }
}

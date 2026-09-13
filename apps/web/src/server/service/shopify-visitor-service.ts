import { db } from "~/server/db";

export class ShopifyVisitorService {
  static async upsertFromEvent(input: {
    storeId: string;
    visitorId: string;
    email?: string | null;
    shopifyCustomerId?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  }) {
    const existing = await db.shopifyVisitorProfile.findUnique({
      where: {
        storeId_visitorId: {
          storeId: input.storeId,
          visitorId: input.visitorId,
        },
      },
    });

    let emailMarketingConsent = existing?.emailMarketingConsent ?? null;

    if (input.shopifyCustomerId) {
      const customer = await db.shopifyCustomer.findUnique({
        where: {
          storeId_shopifyId: {
            storeId: input.storeId,
            shopifyId: input.shopifyCustomerId,
          },
        },
        select: {
          email: true,
          firstName: true,
          lastName: true,
          emailMarketingConsent: true,
        },
      });

      if (customer) {
        emailMarketingConsent = customer.emailMarketingConsent;
      }
    }

    return db.shopifyVisitorProfile.upsert({
      where: {
        storeId_visitorId: {
          storeId: input.storeId,
          visitorId: input.visitorId,
        },
      },
      create: {
        storeId: input.storeId,
        visitorId: input.visitorId,
        email: input.email ?? undefined,
        shopifyCustomerId: input.shopifyCustomerId ?? undefined,
        firstName: input.firstName ?? undefined,
        lastName: input.lastName ?? undefined,
        emailMarketingConsent: emailMarketingConsent ?? undefined,
      },
      update: {
        email: input.email ?? existing?.email ?? undefined,
        shopifyCustomerId:
          input.shopifyCustomerId ?? existing?.shopifyCustomerId ?? undefined,
        firstName: input.firstName ?? existing?.firstName ?? undefined,
        lastName: input.lastName ?? existing?.lastName ?? undefined,
        emailMarketingConsent: emailMarketingConsent ?? undefined,
      },
    });
  }

  static async syncConsentFromCustomer(storeId: string, shopifyCustomerId: string) {
    const customer = await db.shopifyCustomer.findUnique({
      where: {
        storeId_shopifyId: {
          storeId,
          shopifyId: shopifyCustomerId,
        },
      },
    });

    if (!customer) {
      return null;
    }

    await db.shopifyVisitorProfile.updateMany({
      where: {
        storeId,
        shopifyCustomerId,
      },
      data: {
        email: customer.email ?? undefined,
        firstName: customer.firstName ?? undefined,
        lastName: customer.lastName ?? undefined,
        emailMarketingConsent: customer.emailMarketingConsent,
      },
    });

    return customer;
  }
}

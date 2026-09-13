import {
  Prisma,
  RioReplyActionStatus,
  RioReplyTriggerType,
  ShopifyStoreStatus,
} from "@prisma/client";
import { subHours } from "date-fns";
import { db } from "~/server/db";
import {
  buildSendExplanation,
  buildSkipExplanation,
  evaluateMarketingRules,
} from "~/server/shopify/marketing-rules";
import { OpenAiEmailService } from "~/server/service/openai-email-service";
import { ShopifyMarketingSendService } from "~/server/service/shopify-marketing-send-service";
import { ShopifyProductInterestService } from "~/server/service/shopify-product-interest-service";
import { SuppressionService } from "~/server/service/suppression-service";
import { logger } from "~/server/logger/log";

export class ShopifyMarketingEngine {
  static async getOrCreateSettings(storeId: string) {
    return db.shopifyMarketingSettings.upsert({
      where: { storeId },
      create: { storeId },
      update: {},
    });
  }

  static async evaluateStore(storeId: string) {
    const store = await db.shopifyStore.findUnique({
      where: { id: storeId },
    });

    if (!store || store.status !== ShopifyStoreStatus.ACTIVE) {
      return [];
    }

    const settings = await this.getOrCreateSettings(storeId);
    const candidates =
      await ShopifyProductInterestService.findCandidates(storeId);
    const results = [];

    for (const candidate of candidates) {
      results.push(
        await this.processCandidate({
          store,
          settings,
          candidate,
        }),
      );
    }

    return results;
  }

  static async evaluateAllActiveStores() {
    const stores = await db.shopifyStore.findMany({
      where: { status: ShopifyStoreStatus.ACTIVE },
      select: { id: true },
    });

    for (const store of stores) {
      try {
        await this.evaluateStore(store.id);
      } catch (error) {
        logger.error(
          { storeId: store.id, error },
          "RioReply marketing evaluation failed",
        );
      }
    }
  }

  private static async processCandidate(input: {
    store: {
      id: string;
      teamId: number;
      shopName: string | null;
      currency: string | null;
    };
    settings: {
      enabled: boolean;
      fromEmail: string | null;
      minProductViews: number;
      maxEmailsPerVisitorWeek: number;
    };
    candidate: Awaited<
      ReturnType<typeof ShopifyProductInterestService.findCandidates>
    >[number];
  }) {
    const suppressionResults = input.candidate.recipientEmail
      ? await SuppressionService.checkMultipleEmails(
          [input.candidate.recipientEmail],
          input.store.teamId,
        )
      : {};

    const rules = evaluateMarketingRules({
      enabled: input.settings.enabled,
      fromEmail: input.settings.fromEmail,
      recipientEmail: input.candidate.recipientEmail,
      emailMarketingConsent: input.candidate.emailMarketingConsent,
      isSuppressed: input.candidate.recipientEmail
        ? Boolean(suppressionResults[input.candidate.recipientEmail])
        : false,
      productViewCount: input.candidate.productViewCount,
      minProductViews: input.settings.minProductViews,
      hasPurchasedProduct: input.candidate.hasPurchasedProduct,
      productInStock: input.candidate.productInStock,
      recentMarketingEmailCount: input.candidate.recentMarketingEmailCount,
      maxEmailsPerVisitorWeek: input.settings.maxEmailsPerVisitorWeek,
      hasRecentProductAction: input.candidate.hasRecentProductAction,
    });

    if (!rules.allowed) {
      const duplicateSkip = await db.rioReplyAction.findFirst({
        where: {
          storeId: input.store.id,
          visitorId: input.candidate.visitorId,
          shopifyProductId: input.candidate.shopifyProductId,
          status: RioReplyActionStatus.SKIPPED,
          skipReason: rules.reason,
          createdAt: { gte: subHours(new Date(), 1) },
        },
      });

      if (duplicateSkip) {
        return duplicateSkip;
      }

      return this.createAction({
        storeId: input.store.id,
        teamId: input.store.teamId,
        visitorId: input.candidate.visitorId,
        shopifyProductId: input.candidate.shopifyProductId,
        productTitle: input.candidate.productTitle,
        recipientEmail: input.candidate.recipientEmail,
        status: RioReplyActionStatus.SKIPPED,
        skipReason: rules.reason,
        explanation: buildSkipExplanation(rules.reason),
      });
    }

    try {
      const generatedEmail = await OpenAiEmailService.generateProductInterestEmail(
        {
          storeName: input.store.shopName ?? "your store",
          productTitle: input.candidate.productTitle,
          productDescription: input.candidate.productDescription,
          productUrl: input.candidate.productUrl,
          productPrice: input.candidate.productPrice,
          currency: input.store.currency,
          customerFirstName: input.candidate.firstName,
        },
      );

      const sendResult = await ShopifyMarketingSendService.sendProductInterestEmail(
        {
          teamId: input.store.teamId,
          storeId: input.store.id,
          fromEmail: input.settings.fromEmail!,
          recipientEmail: input.candidate.recipientEmail!,
          firstName: input.candidate.firstName,
          productTitle: input.candidate.productTitle,
          generatedEmail,
        },
      );

      await db.shopifyVisitorProfile.updateMany({
        where: {
          storeId: input.store.id,
          visitorId: input.candidate.visitorId,
        },
        data: {
          lastMarketingEmailAt: new Date(),
        },
      });

      return this.createAction({
        storeId: input.store.id,
        teamId: input.store.teamId,
        visitorId: input.candidate.visitorId,
        shopifyProductId: input.candidate.shopifyProductId,
        productTitle: input.candidate.productTitle,
        recipientEmail: input.candidate.recipientEmail,
        status: RioReplyActionStatus.SENT,
        subject: generatedEmail.subject,
        emailId: sendResult.emailId,
        campaignId: sendResult.campaignId,
        explanation: buildSendExplanation({
          productTitle: input.candidate.productTitle,
          productViewCount: input.candidate.productViewCount,
        }),
        metadata: {
          emailSource: generatedEmail.source,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send email";

      return this.createAction({
        storeId: input.store.id,
        teamId: input.store.teamId,
        visitorId: input.candidate.visitorId,
        shopifyProductId: input.candidate.shopifyProductId,
        productTitle: input.candidate.productTitle,
        recipientEmail: input.candidate.recipientEmail,
        status: RioReplyActionStatus.FAILED,
        skipReason: "SEND_FAILED",
        explanation: message,
      });
    }
  }

  private static createAction(input: {
    storeId: string;
    teamId: number;
    visitorId: string;
    shopifyProductId: string;
    productTitle: string;
    recipientEmail: string | null;
    status: RioReplyActionStatus;
    explanation: string;
    skipReason?: string;
    subject?: string;
    emailId?: string | null;
    campaignId?: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    return db.rioReplyAction.create({
      data: {
        storeId: input.storeId,
        teamId: input.teamId,
        triggerType: RioReplyTriggerType.PRODUCT_INTEREST,
        status: input.status,
        visitorId: input.visitorId,
        shopifyProductId: input.shopifyProductId,
        productTitle: input.productTitle,
        recipientEmail: input.recipientEmail ?? undefined,
        explanation: input.explanation,
        skipReason: input.skipReason,
        subject: input.subject,
        emailId: input.emailId ?? undefined,
        campaignId: input.campaignId,
        metadata: input.metadata,
      },
    });
  }
}

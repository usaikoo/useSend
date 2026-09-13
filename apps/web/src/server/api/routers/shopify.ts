import { z } from "zod";
import {
  createTRPCRouter,
  teamAdminProcedure,
  teamProcedure,
} from "~/server/api/trpc";
import { ShopifyService } from "~/server/service/shopify-service";
import { ShopifySyncService } from "~/server/service/shopify-sync-service";
import { ShopifyTrackingService } from "~/server/service/shopify-tracking-service";
import { ShopifyMarketingEngine } from "~/server/service/shopify-marketing-engine";
import { OpenAiEmailService } from "~/server/service/openai-email-service";
import { db } from "~/server/db";
import { TRPCError } from "@trpc/server";

export const shopifyRouter = createTRPCRouter({
  isConfigured: teamProcedure.query(() => {
    return {
      configured: ShopifyService.isConfigured(),
      customerDataSyncEnabled: ShopifyService.isCustomerDataSyncEnabled(),
    };
  }),

  getStore: teamProcedure.query(async ({ ctx }) => {
    return ShopifyService.getStoreForTeam(ctx.team.id);
  }),

  getInstallUrl: teamAdminProcedure
    .input(
      z.object({
        shopDomain: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ShopifyService.isConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Shopify integration is not configured",
        });
      }

      return ShopifyService.getInstallUrl(ctx.team.id, input.shopDomain);
    }),

  disconnect: teamAdminProcedure.mutation(async ({ ctx }) => {
    return ShopifyService.disconnectStore(ctx.team.id);
  }),

  syncNow: teamAdminProcedure.mutation(async ({ ctx }) => {
    return ShopifySyncService.syncAllForTeam(ctx.team.id);
  }),

  getTrackingSetup: teamProcedure.query(async ({ ctx }) => {
    return ShopifyTrackingService.getTrackingSetupForTeam(ctx.team.id);
  }),

  getRecentStorefrontEvents: teamProcedure.query(async ({ ctx }) => {
    return ShopifyTrackingService.getRecentEventsForTeam(ctx.team.id);
  }),

  getStorefrontEventStats: teamProcedure.query(async ({ ctx }) => {
    return ShopifyTrackingService.getEventStatsForTeam(ctx.team.id);
  }),

  getMarketingSettings: teamProcedure.query(async ({ ctx }) => {
    const store = await ShopifyService.getStoreForTeam(ctx.team.id);

    if (!store) {
      return null;
    }

    const settings = await ShopifyMarketingEngine.getOrCreateSettings(store.id);

    return {
      ...settings,
      openAiConfigured: OpenAiEmailService.isConfigured(),
    };
  }),

  updateMarketingSettings: teamAdminProcedure
    .input(
      z.object({
        enabled: z.boolean().optional(),
        fromEmail: z.string().email().optional().nullable(),
        minProductViews: z.number().int().min(2).max(20).optional(),
        cooldownHours: z.number().int().min(1).max(720).optional(),
        maxEmailsPerVisitorWeek: z.number().int().min(1).max(20).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const store = await db.shopifyStore.findFirst({
        where: { teamId: ctx.team.id, status: "ACTIVE" },
      });

      if (!store) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No connected Shopify store found",
        });
      }

      await ShopifyMarketingEngine.getOrCreateSettings(store.id);

      return db.shopifyMarketingSettings.update({
        where: { storeId: store.id },
        data: input,
      });
    }),

  getRioReplyActions: teamProcedure.query(async ({ ctx }) => {
    return db.rioReplyAction.findMany({
      where: { teamId: ctx.team.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
  }),

  runMarketingNow: teamAdminProcedure.mutation(async ({ ctx }) => {
    const store = await db.shopifyStore.findFirst({
      where: { teamId: ctx.team.id, status: "ACTIVE" },
    });

    if (!store) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No connected Shopify store found",
      });
    }

    return ShopifyMarketingEngine.evaluateStore(store.id);
  }),
});

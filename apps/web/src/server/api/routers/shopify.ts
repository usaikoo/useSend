import { z } from "zod";
import {
  createTRPCRouter,
  teamAdminProcedure,
  teamProcedure,
} from "~/server/api/trpc";
import { ShopifyService } from "~/server/service/shopify-service";
import { ShopifySyncService } from "~/server/service/shopify-sync-service";
import { ShopifyTrackingService } from "~/server/service/shopify-tracking-service";
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
});

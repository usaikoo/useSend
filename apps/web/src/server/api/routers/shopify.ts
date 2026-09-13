import { z } from "zod";
import {
  createTRPCRouter,
  teamAdminProcedure,
  teamProcedure,
} from "~/server/api/trpc";
import { ShopifyService } from "~/server/service/shopify-service";
import { TRPCError } from "@trpc/server";

export const shopifyRouter = createTRPCRouter({
  isConfigured: teamProcedure.query(() => {
    return { configured: ShopifyService.isConfigured() };
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
});

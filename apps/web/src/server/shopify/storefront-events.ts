import { ShopifyStorefrontEventType } from "@prisma/client";
import { z } from "zod";

export const STOREFRONT_EVENT_TYPES = [
  "PAGE_VIEW",
  "PRODUCT_VIEW",
  "COLLECTION_VIEW",
  "SEARCH",
  "ADD_TO_CART",
  "REMOVE_FROM_CART",
  "CHECKOUT_STARTED",
  "PURCHASE",
] as const satisfies readonly ShopifyStorefrontEventType[];

export const storefrontEventInputSchema = z.object({
  key: z.string().min(1),
  eventType: z.enum(STOREFRONT_EVENT_TYPES),
  sessionId: z.string().min(1).max(128),
  visitorId: z.string().min(1).max(128).optional(),
  url: z.string().max(2048).optional(),
  path: z.string().max(2048).optional(),
  referrer: z.string().max(2048).optional(),
  productId: z.string().max(64).optional(),
  productHandle: z.string().max(256).optional(),
  variantId: z.string().max(64).optional(),
  collectionHandle: z.string().max(256).optional(),
  searchQuery: z.string().max(512).optional(),
  orderId: z.string().max(64).optional(),
  value: z.number().finite().optional(),
  currency: z.string().max(8).optional(),
  quantity: z.number().int().positive().optional(),
  occurredAt: z.string().datetime().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type StorefrontEventInput = z.infer<typeof storefrontEventInputSchema>;

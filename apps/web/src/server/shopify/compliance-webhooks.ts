import { z } from "zod";

const complianceCustomerSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

export const customersDataRequestSchema = z.object({
  shop_id: z.union([z.number(), z.string()]),
  shop_domain: z.string(),
  orders_requested: z.array(z.union([z.number(), z.string()])).optional(),
  customer: complianceCustomerSchema,
  data_request: z
    .object({
      id: z.union([z.number(), z.string()]),
    })
    .optional(),
});

export const customersRedactSchema = z.object({
  shop_id: z.union([z.number(), z.string()]),
  shop_domain: z.string(),
  customer: complianceCustomerSchema,
  orders_to_redact: z.array(z.union([z.number(), z.string()])).optional(),
});

export const shopRedactSchema = z.object({
  shop_id: z.union([z.number(), z.string()]),
  shop_domain: z.string(),
});

export type CustomersDataRequestPayload = z.infer<
  typeof customersDataRequestSchema
>;
export type CustomersRedactPayload = z.infer<typeof customersRedactSchema>;
export type ShopRedactPayload = z.infer<typeof shopRedactSchema>;

export const SHOPIFY_COMPLIANCE_WEBHOOK_TOPICS = [
  "customers/data_request",
  "customers/redact",
  "shop/redact",
] as const;

export type ShopifyComplianceWebhookTopic =
  (typeof SHOPIFY_COMPLIANCE_WEBHOOK_TOPICS)[number];

export function isComplianceWebhookTopic(
  topic: string,
): topic is ShopifyComplianceWebhookTopic {
  return SHOPIFY_COMPLIANCE_WEBHOOK_TOPICS.includes(
    topic as ShopifyComplianceWebhookTopic,
  );
}

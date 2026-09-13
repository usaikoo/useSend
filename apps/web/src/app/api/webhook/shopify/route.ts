import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getShopifyConfig, verifyWebhookHmac } from "~/server/shopify/oauth";
import { ShopifyService } from "~/server/service/shopify-service";
import { ShopifySyncService } from "~/server/service/shopify-sync-service";
import { ShopifyComplianceService } from "~/server/service/shopify-compliance-service";
import {
  customersDataRequestSchema,
  customersRedactSchema,
  isComplianceWebhookTopic,
  shopRedactSchema,
} from "~/server/shopify/compliance-webhooks";

export async function POST(req: Request) {
  const body = await req.text();
  const hmacHeader = (await headers()).get("X-Shopify-Hmac-Sha256");
  const topic = (await headers()).get("X-Shopify-Topic");
  const shopDomain = (await headers()).get("X-Shopify-Shop-Domain");

  if (!hmacHeader || !topic || !shopDomain) {
    return new NextResponse("Missing Shopify webhook headers", { status: 400 });
  }

  try {
    const { apiSecret } = getShopifyConfig();

    if (!verifyWebhookHmac(body, hmacHeader, apiSecret)) {
      return new NextResponse("Invalid webhook signature", { status: 401 });
    }

    const payload = JSON.parse(body) as Record<string, unknown>;

    if (topic === "app/uninstalled") {
      await ShopifyService.markUninstalled(shopDomain);
      return new NextResponse("OK", { status: 200 });
    }

    if (isComplianceWebhookTopic(topic)) {
      switch (topic) {
        case "customers/data_request":
          await ShopifyComplianceService.handleCustomersDataRequest(
            customersDataRequestSchema.parse(payload),
          );
          break;
        case "customers/redact":
          await ShopifyComplianceService.handleCustomersRedact(
            customersRedactSchema.parse(payload),
          );
          break;
        case "shop/redact":
          await ShopifyComplianceService.handleShopRedact(
            shopRedactSchema.parse(payload),
          );
          break;
      }

      return new NextResponse("OK", { status: 200 });
    }

    await ShopifySyncService.handleWebhookTopic(shopDomain, topic, payload);

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("Shopify compliance webhook validation error:", error);
      return new NextResponse("Invalid webhook payload", { status: 400 });
    }

    console.error("Shopify webhook error:", error);
    return new NextResponse("Webhook error", { status: 400 });
  }
}

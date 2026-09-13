import { NextResponse } from "next/server";
import { ShopifyTrackingService } from "~/server/service/shopify-tracking-service";
import { buildStorefrontTrackerScript } from "~/server/shopify/storefront-tracker-script";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const trackingKey = searchParams.get("key");
  const shopDomain = searchParams.get("shop");

  if (!trackingKey && !shopDomain) {
    return new NextResponse("// Missing tracking key or shop domain", {
      status: 400,
      headers: { "Content-Type": "application/javascript; charset=utf-8" },
    });
  }

  const store = await ShopifyTrackingService.resolveStoreForScript({
    key: trackingKey,
    shop: shopDomain,
  });

  if (!store) {
    return new NextResponse("// Store not found", {
      status: 404,
      headers: { "Content-Type": "application/javascript; charset=utf-8" },
    });
  }

  let appUrl: string;

  try {
    appUrl = ShopifyTrackingService.getAppUrl();
  } catch {
    return new NextResponse("// Tracking is not configured", {
      status: 503,
      headers: { "Content-Type": "application/javascript; charset=utf-8" },
    });
  }

  const script = buildStorefrontTrackerScript({
    trackingKey: store.trackingPublicKey,
    endpoint: `${appUrl}/api/track/shopify`,
  });

  return new NextResponse(script, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

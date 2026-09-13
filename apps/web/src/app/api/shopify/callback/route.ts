import { NextResponse } from "next/server";
import { env } from "~/env";
import { ShopifyService } from "~/server/service/shopify-service";

function getSettingsUrl(params?: Record<string, string>) {
  const baseUrl = (env.SHOPIFY_APP_URL ?? env.NEXTAUTH_URL).replace(/\/$/, "");
  const url = new URL("/settings/shopify", baseUrl);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}

export async function GET(req: Request) {
  const requestUrl = new URL(req.url);
  const query = Object.fromEntries(requestUrl.searchParams.entries());

  const code = query.code;
  const shop = query.shop;
  const state = query.state;

  if (!code || !shop || !state) {
    return NextResponse.redirect(getSettingsUrl({ error: "missing_params" }));
  }

  try {
    await ShopifyService.handleOAuthCallback({
      code,
      shop,
      state,
      query,
    });

    return NextResponse.redirect(getSettingsUrl({ connected: "1" }));
  } catch (error) {
    console.error("Shopify OAuth callback failed:", error);
    return NextResponse.redirect(getSettingsUrl({ error: "oauth_failed" }));
  }
}

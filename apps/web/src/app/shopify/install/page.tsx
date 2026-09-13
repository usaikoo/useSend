import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { ShopifyService } from "~/server/service/shopify-service";
import { normalizeShopDomain } from "~/server/shopify/oauth";
import { ShopifyInstallClient } from "./shopify-install-client";
import { ShopifyInstallLanding } from "./shopify-install-landing";

export default async function ShopifyInstallPage({
  searchParams,
}: {
  searchParams: Promise<{ shop?: string }>;
}) {
  const { shop } = await searchParams;

  if (!shop) {
    redirect("/settings/shopify");
  }

  const shopDomain = normalizeShopDomain(shop);
  const session = await getServerAuthSession();

  if (!session?.user) {
    const loginUrl = `/login?callbackUrl=${encodeURIComponent(`/shopify/install?shop=${shopDomain}`)}`;

    return (
      <ShopifyInstallLanding shopDomain={shopDomain} loginUrl={loginUrl} />
    );
  }

  if (!ShopifyService.isConfigured()) {
    redirect("/settings/shopify?error=not_configured");
  }

  const teamUser = await db.teamUser.findFirst({
    where: { userId: session.user.id },
  });

  if (!teamUser) {
    redirect("/dashboard");
  }

  const { url } = await ShopifyService.getInstallUrl(teamUser.teamId, shopDomain);

  return <ShopifyInstallClient installUrl={url} shopDomain={shopDomain} />;
}

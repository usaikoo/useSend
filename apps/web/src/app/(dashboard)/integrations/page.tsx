"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ChevronRight, Plug2 } from "lucide-react";
import { H1 } from "@usesend/ui";
import { Badge } from "@usesend/ui/src/badge";
import { Card } from "@usesend/ui/src/card";
import { Spinner } from "@usesend/ui/src/spinner";
import { useTeam } from "~/providers/team-context";
import { api } from "~/trpc/react";

function ShopifyIcon() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#95BF47]/15 text-[#5E8E3E]">
      <span className="text-lg font-bold">S</span>
    </div>
  );
}

export default function IntegrationsPage() {
  const { currentIsAdmin } = useTeam();
  const { data: config } = api.shopify.isConfigured.useQuery();
  const { data: store, isLoading } = api.shopify.getStore.useQuery(undefined, {
    refetchInterval: (query) =>
      query.state.data?.syncStatus === "SYNCING" ? 3000 : false,
  });
  const { data: marketingSettings } = api.shopify.getMarketingSettings.useQuery(
    undefined,
    { enabled: !!store },
  );
  const { data: trackingSetup } = api.shopify.getTrackingSetup.useQuery(
    undefined,
    { enabled: !!store },
  );

  if (!currentIsAdmin) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="h-4 w-4" />
      </div>
    );
  }

  const isSyncing = store?.syncStatus === "SYNCING";
  const trackingActive = trackingSetup?.embedStatus === "receiving_events";

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <H1>Integrations</H1>
        <p className="mt-2 text-sm text-muted-foreground">
          Connect RioReply to your store and tools to power AI marketing autopilot.
        </p>
      </div>

      {store ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Connected</h2>
          <Link href="/integrations/shopify">
            <Card className="rounded-xl p-4 transition-colors hover:bg-muted/40">
              <div className="flex items-center gap-4">
                <ShopifyIcon />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">Shopify</p>
                    <Badge
                      variant="outline"
                      className="border-green-200 bg-green-50 text-green-800"
                    >
                      {isSyncing ? "Syncing" : "Enabled"}
                    </Badge>
                    {marketingSettings?.enabled ? (
                      <Badge variant="secondary">Autopilot on</Badge>
                    ) : null}
                    {trackingActive ? (
                      <Badge variant="secondary">Tracking active</Badge>
                    ) : null}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {store.shopName ?? store.shopDomain}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    eCommerce platform
                    {store.lastSyncAt
                      ? ` · Synced ${format(new Date(store.lastSyncAt), "PP")}`
                      : ""}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </div>
            </Card>
          </Link>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">
          {store ? "Available" : "Get started"}
        </h2>
        {!store ? (
          <Link href="/integrations/shopify">
            <Card className="rounded-xl p-6 transition-colors hover:bg-muted/40">
              <div className="flex items-start gap-4">
                <ShopifyIcon />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">Shopify</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Sync products, customers, and orders. Enable storefront tracking
                    and AI marketing autopilot for your store.
                  </p>
                  {!config?.configured ? (
                    <p className="mt-2 text-xs text-amber-600">
                      Server configuration required before connecting.
                    </p>
                  ) : null}
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </div>
            </Card>
          </Link>
        ) : (
          <Card className="rounded-xl p-6 opacity-60">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Plug2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">More integrations</p>
                  <Badge variant="outline">Coming soon</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Additional eCommerce and marketing tools will appear here.
                </p>
              </div>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}

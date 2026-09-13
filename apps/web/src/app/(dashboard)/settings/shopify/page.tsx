"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@usesend/ui/src/button";
import { Card } from "@usesend/ui/src/card";
import { Input } from "@usesend/ui/src/input";
import { Spinner } from "@usesend/ui/src/spinner";
import { format } from "date-fns";
import { useTeam } from "~/providers/team-context";
import { api } from "~/trpc/react";

export default function ShopifySettingsPage() {
  const { currentIsAdmin } = useTeam();
  const searchParams = useSearchParams();
  const [shopDomain, setShopDomain] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const apiUtils = api.useUtils();
  const { data: config } = api.shopify.isConfigured.useQuery();
  const { data: store, isLoading } = api.shopify.getStore.useQuery(undefined, {
    refetchInterval: (query) =>
      query.state.data?.syncStatus === "SYNCING" ? 3000 : false,
  });
  const getInstallUrl = api.shopify.getInstallUrl.useMutation();
  const disconnect = api.shopify.disconnect.useMutation();
  const syncNow = api.shopify.syncNow.useMutation();
  const customerDataPending = config?.customerDataSyncEnabled === false;
  const { data: trackingSetup } = api.shopify.getTrackingSetup.useQuery(
    undefined,
    { enabled: !!store },
  );
  const { data: eventStats } = api.shopify.getStorefrontEventStats.useQuery(
    undefined,
    { enabled: !!store, refetchInterval: 30000 },
  );
  const { data: recentEvents } = api.shopify.getRecentStorefrontEvents.useQuery(
    undefined,
    { enabled: !!store, refetchInterval: 30000 },
  );
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");

    if (connected === "1") {
      setMessage("Shopify store connected successfully. Sync started.");
      void apiUtils.shopify.getStore.invalidate();
    } else if (error === "oauth_failed") {
      setMessage("Failed to connect Shopify store. Please try again.");
    } else if (error === "missing_params") {
      setMessage("Shopify returned an incomplete authorization response.");
    } else if (error === "not_configured") {
      setMessage("Shopify integration is not configured on the server.");
    }
  }, [searchParams, apiUtils.shopify.getStore]);

  const onConnect = async () => {
    setMessage(null);

    try {
      const result = await getInstallUrl.mutateAsync({ shopDomain });
      window.location.href = result.url;
    } catch (error) {
      console.error("Failed to start Shopify OAuth:", error);
      setMessage("Could not start Shopify connection.");
    }
  };

  const onDisconnect = async () => {
    setMessage(null);

    try {
      await disconnect.mutateAsync();
      await apiUtils.shopify.getStore.invalidate();
      setMessage("Shopify store disconnected.");
    } catch (error) {
      console.error("Failed to disconnect Shopify store:", error);
      setMessage("Could not disconnect Shopify store.");
    }
  };

  const onCopySnippet = async () => {
    if (!trackingSetup?.snippet) {
      return;
    }

    try {
      await navigator.clipboard.writeText(trackingSetup.snippet);
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    } catch (error) {
      console.error("Failed to copy tracking snippet:", error);
      setMessage("Could not copy tracking snippet.");
    }
  };

  const onSyncNow = async () => {
    setMessage(null);

    try {
      await syncNow.mutateAsync();
      await apiUtils.shopify.getStore.invalidate();
      setMessage(
        customerDataPending
          ? "Products synced. Customer and order sync will start after Shopify approval."
          : "Shopify data synced successfully.",
      );
    } catch (error) {
      console.error("Failed to sync Shopify store:", error);
      setMessage("Shopify sync failed. Check server logs for details.");
      await apiUtils.shopify.getStore.invalidate();
    }
  };

  if (!currentIsAdmin) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner className="w-4 h-4" />
      </div>
    );
  }

  const isSyncing = store?.syncStatus === "SYNCING";

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="rounded-xl p-8">
        <h2 className="text-base font-semibold">Connect Shopify</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Connect your Shopify store so RioReply can analyze products,
          customers, and orders to run AI marketing automatically.
        </p>

        {customerDataPending ? (
          <p className="text-sm mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
            Customer and order sync is paused until Shopify approves protected
            customer data access for this app. Products sync normally.
          </p>
        ) : null}

        {message ? (
          <p className="text-sm mt-4 rounded-md bg-muted px-3 py-2">{message}</p>
        ) : null}

        {!config?.configured ? (
          <p className="text-sm mt-4 text-amber-600">
            Shopify integration is not configured yet. Add SHOPIFY_API_KEY and
            SHOPIFY_API_SECRET to your environment.
          </p>
        ) : null}

        {store ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex justify-between gap-4">
                <span className="text-sm text-muted-foreground">Store</span>
                <span className="text-sm font-medium">{store.shopName ?? store.shopDomain}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-sm text-muted-foreground">Domain</span>
                <span className="text-sm font-medium">{store.shopDomain}</span>
              </div>
              {store.shopEmail ? (
                <div className="flex justify-between gap-4">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="text-sm font-medium">{store.shopEmail}</span>
                </div>
              ) : null}
              <div className="flex justify-between gap-4">
                <span className="text-sm text-muted-foreground">Products</span>
                <span className="text-sm font-medium">{store.productCount}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-sm text-muted-foreground">Customers</span>
                <span className="text-sm font-medium">
                  {customerDataPending ? "Pending approval" : store.customerCount}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-sm text-muted-foreground">Orders</span>
                <span className="text-sm font-medium">
                  {customerDataPending ? "Pending approval" : store.orderCount}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-sm text-muted-foreground">Sync status</span>
                <span className="text-sm font-medium">
                  {isSyncing ? "Syncing..." : store.syncStatus.toLowerCase()}
                </span>
              </div>
              {store.syncError ? (
                <div className="flex justify-between gap-4">
                  <span className="text-sm text-muted-foreground">
                    {customerDataPending ? "Note" : "Last error"}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      customerDataPending ? "text-amber-700" : "text-destructive"
                    }`}
                  >
                    {store.syncError}
                  </span>
                </div>
              ) : null}
              {store.lastSyncAt ? (
                <div className="flex justify-between gap-4">
                  <span className="text-sm text-muted-foreground">Last sync</span>
                  <span className="text-sm font-medium">
                    {format(new Date(store.lastSyncAt), "PPp")}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={onSyncNow}
                disabled={isSyncing || syncNow.isPending}
              >
                {isSyncing || syncNow.isPending ? (
                  <Spinner className="w-4 h-4" />
                ) : (
                  "Sync now"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={onDisconnect}
                disabled={disconnect.isPending || isSyncing}
              >
                {disconnect.isPending ? <Spinner className="w-4 h-4" /> : "Disconnect"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="shop-domain"
                className="text-sm font-medium block mb-2"
              >
                Shopify store domain
              </label>
              <Input
                id="shop-domain"
                placeholder="your-store or your-store.myshopify.com"
                value={shopDomain}
                onChange={(event) => setShopDomain(event.target.value)}
              />
            </div>

            <Button
              onClick={onConnect}
              disabled={!shopDomain || getInstallUrl.isPending || !config?.configured}
            >
              {getInstallUrl.isPending ? (
                <Spinner className="w-4 h-4" />
              ) : (
                "Connect Shopify"
              )}
            </Button>
          </div>
        )}
      </Card>

      {store && trackingSetup ? (
        <Card className="rounded-xl p-8 space-y-6">
          <div>
            <h2 className="text-base font-semibold">Storefront tracking</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Add this script to your Shopify theme to capture page views,
              product views, add to cart, checkout, and purchase events.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium block">Tracking snippet</label>
            <pre className="rounded-lg border bg-muted/40 p-4 text-xs overflow-x-auto whitespace-pre-wrap break-all">
              {trackingSetup.snippet}
            </pre>
            <Button variant="outline" onClick={onCopySnippet}>
              {copiedSnippet ? "Copied" : "Copy snippet"}
            </Button>
          </div>

          <div className="rounded-lg border p-4 space-y-2 text-sm">
            <p className="font-medium">Install in Shopify</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Go to Online Store → Themes → Edit code</li>
              <li>Open <code className="text-xs">layout/theme.liquid</code></li>
              <li>Paste the snippet before <code className="text-xs">&lt;/head&gt;</code></li>
              <li>Save and visit your storefront to verify events appear below</li>
            </ol>
          </div>

          {eventStats && eventStats.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Last 24 hours</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {eventStats.map((stat) => (
                  <div key={stat.eventType} className="rounded-lg border px-3 py-2">
                    <p className="text-xs text-muted-foreground">
                      {stat.eventType.replaceAll("_", " ").toLowerCase()}
                    </p>
                    <p className="text-lg font-semibold">{stat.count}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No storefront events yet. Install the snippet and browse your store.
            </p>
          )}

          {recentEvents && recentEvents.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Recent events</p>
              <div className="rounded-lg border divide-y">
                {recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">
                        {event.eventType.replaceAll("_", " ").toLowerCase()}
                      </p>
                      <p className="text-muted-foreground truncate">
                        {event.productHandle ??
                          event.searchQuery ??
                          event.path ??
                          "—"}
                      </p>
                    </div>
                    <span className="text-muted-foreground shrink-0">
                      {format(new Date(event.occurredAt), "PPp")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}

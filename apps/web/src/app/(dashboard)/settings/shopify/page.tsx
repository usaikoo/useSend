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
  const { data: store, isLoading } = api.shopify.getStore.useQuery();
  const getInstallUrl = api.shopify.getInstallUrl.useMutation();
  const disconnect = api.shopify.disconnect.useMutation();

  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");

    if (connected === "1") {
      setMessage("Shopify store connected successfully.");
      void apiUtils.shopify.getStore.invalidate();
    } else if (error === "oauth_failed") {
      setMessage("Failed to connect Shopify store. Please try again.");
    } else if (error === "missing_params") {
      setMessage("Shopify returned an incomplete authorization response.");
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

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="rounded-xl p-8">
        <h2 className="text-base font-semibold">Connect Shopify</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Connect your Shopify store so RioReply can analyze products,
          customers, and orders to run AI marketing automatically.
        </p>

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
              {store.lastSyncAt ? (
                <div className="flex justify-between gap-4">
                  <span className="text-sm text-muted-foreground">Last sync</span>
                  <span className="text-sm font-medium">
                    {format(new Date(store.lastSyncAt), "PPp")}
                  </span>
                </div>
              ) : null}
            </div>

            <Button
              variant="outline"
              onClick={onDisconnect}
              disabled={disconnect.isPending}
            >
              {disconnect.isPending ? <Spinner className="w-4 h-4" /> : "Disconnect"}
            </Button>
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
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { Button } from "@usesend/ui/src/button";
import { Card } from "@usesend/ui/src/card";
import { Input } from "@usesend/ui/src/input";
import { Spinner } from "@usesend/ui/src/spinner";
import { Badge } from "@usesend/ui/src/badge";
import { Switch } from "@usesend/ui/src/switch";
import { Label } from "@usesend/ui/src/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@usesend/ui/src/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@usesend/ui/src/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@usesend/ui/src/dialog";
import { CodeBlockWithCopy } from "@usesend/ui/src/code-block-with-copy";
import { toast } from "@usesend/ui/src/toaster";
import { useTeam } from "~/providers/team-context";
import { api } from "~/trpc/react";
import {
  getShopifyOAuthErrorMessage,
  isShopifyOAuthErrorCode,
} from "~/lib/shopify-oauth-errors";
import { ShopifySetupChecklist } from "./shopify-setup-checklist";

type ShopifyTab = "overview" | "tracking" | "autopilot" | "activity";

export function ShopifyIntegrationPage() {
  const { currentIsAdmin } = useTeam();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<ShopifyTab>("overview");
  const [shopDomain, setShopDomain] = useState("");
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [autopilotEnabled, setAutopilotEnabled] = useState(false);
  const [fromEmail, setFromEmail] = useState("");
  const [demoEmail, setDemoEmail] = useState("");

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
  const { data: marketingSettings } = api.shopify.getMarketingSettings.useQuery(
    undefined,
    { enabled: !!store },
  );
  const { data: rioReplyActions } = api.shopify.getRioReplyActions.useQuery(
    undefined,
    { enabled: !!store, refetchInterval: 30000 },
  );
  const { data: domains } = api.domain.domains.useQuery(undefined, {
    enabled: !!store,
  });
  const updateMarketingSettings = api.shopify.updateMarketingSettings.useMutation();
  const runMarketingNow = api.shopify.runMarketingNow.useMutation();
  const seedDemoData = api.shopify.seedDemoData.useMutation();

  useEffect(() => {
    if (marketingSettings) {
      setAutopilotEnabled(marketingSettings.enabled);
      if (marketingSettings.fromEmail) {
        setFromEmail(marketingSettings.fromEmail);
      }
    }
  }, [marketingSettings]);

  useEffect(() => {
    if (store?.shopEmail && !demoEmail) {
      setDemoEmail(store.shopEmail);
    }
  }, [store?.shopEmail, demoEmail]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (
      tab === "overview" ||
      tab === "tracking" ||
      tab === "autopilot" ||
      tab === "activity"
    ) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");

    if (connected === "1") {
      toast.success("Shopify store connected successfully. Sync started.");
      void apiUtils.shopify.getStore.invalidate();
    } else if (error === "oauth_failed") {
      const errorDetail = searchParams.get("error_detail");
      toast.error(
        isShopifyOAuthErrorCode(errorDetail)
          ? getShopifyOAuthErrorMessage(errorDetail)
          : "Failed to connect Shopify store. Please try again.",
      );
    } else if (error === "missing_params") {
      toast.error("Shopify returned an incomplete authorization response.");
    } else if (error === "not_configured") {
      toast.error("Shopify integration is not configured on the server.");
    }
  }, [searchParams, apiUtils.shopify.getStore]);

  const verifiedDomainNames = useMemo(
    () => new Set(domains?.map((domain) => domain.name) ?? []),
    [domains],
  );

  const fromEmailDomain = fromEmail.includes("@")
    ? fromEmail.split("@")[1]?.toLowerCase()
    : null;
  const hasVerifiedSender =
    !!fromEmail &&
    !!fromEmailDomain &&
    verifiedDomainNames.has(fromEmailDomain);

  const trackingActive = trackingSetup?.embedStatus === "receiving_events";

  const setupSteps = useMemo(() => {
    if (!store) {
      return [
        {
          id: "connect",
          label: "Connect Shopify store",
          description: "Authorize RioReply to access your store data.",
          status: "pending" as const,
          tab: "overview",
        },
      ];
    }

    return [
      {
        id: "connect",
        label: "Connect Shopify store",
        description: store.shopName ?? store.shopDomain,
        status: "complete" as const,
      },
      {
        id: "tracking",
        label: "Enable storefront tracking",
        description: trackingActive
          ? "Events are being received from your storefront."
          : "Enable the app embed in your theme.",
        status: trackingActive ? ("complete" as const) : ("warning" as const),
        tab: "tracking",
      },
      {
        id: "sender",
        label: "Set verified sender email",
        description: hasVerifiedSender
          ? fromEmail
          : "Use an address from a verified domain.",
        status: hasVerifiedSender ? ("complete" as const) : ("pending" as const),
        tab: "autopilot",
      },
      {
        id: "autopilot",
        label: "Enable autopilot",
        description: marketingSettings?.enabled
          ? "Product interest emails are active."
          : "Turn on AI marketing autopilot.",
        status: marketingSettings?.enabled
          ? ("complete" as const)
          : ("pending" as const),
        tab: "autopilot",
      },
    ];
  }, [
    store,
    trackingActive,
    hasVerifiedSender,
    fromEmail,
    marketingSettings?.enabled,
  ]);

  const onConnect = async () => {
    try {
      const result = await getInstallUrl.mutateAsync({ shopDomain });
      window.location.href = result.url;
    } catch (error) {
      console.error("Failed to start Shopify OAuth:", error);
      toast.error("Could not start Shopify connection.");
    }
  };

  const onDisconnect = async () => {
    try {
      await disconnect.mutateAsync();
      await apiUtils.shopify.getStore.invalidate();
      setDisconnectOpen(false);
      toast.success("Shopify store disconnected.");
    } catch (error) {
      console.error("Failed to disconnect Shopify store:", error);
      toast.error("Could not disconnect Shopify store.");
    }
  };

  const onSaveMarketingSettings = async (enabled = autopilotEnabled) => {
    try {
      await updateMarketingSettings.mutateAsync({
        enabled,
        fromEmail: fromEmail || null,
      });
      await apiUtils.shopify.getMarketingSettings.invalidate();
      setAutopilotEnabled(enabled);
      toast.success("Autopilot settings saved.");
    } catch (error) {
      console.error("Failed to save marketing settings:", error);
      toast.error("Could not save autopilot settings.");
    }
  };

  const onRunMarketingNow = async () => {
    if (!marketingSettings?.enabled && !autopilotEnabled) {
      toast.error("Enable autopilot and save settings before running.");
      return;
    }

    if (!fromEmail) {
      toast.error("Set a verified sender email and save settings before running.");
      return;
    }

    try {
      const actions = await runMarketingNow.mutateAsync();
      await apiUtils.shopify.getRioReplyActions.invalidate();
      await apiUtils.shopify.getMarketingSettings.invalidate();

      const sentCount = actions.filter((action) => action.status === "SENT").length;
      const skippedCount = actions.filter(
        (action) => action.status === "SKIPPED",
      ).length;

      if (sentCount > 0) {
        toast.success(
          `RioReply sent ${sentCount} email${sentCount === 1 ? "" : "s"}${skippedCount > 0 ? ` and skipped ${skippedCount}` : ""}.`,
        );
      } else if (skippedCount > 0) {
        const latestSkip = actions.find((action) => action.status === "SKIPPED");
        toast.message(
          latestSkip?.explanation ??
            `RioReply skipped ${skippedCount} opportunities.`,
        );
      } else {
        toast.message("RioReply found no product interest opportunities to evaluate.");
      }
    } catch (error) {
      console.error("Failed to run RioReply marketing:", error);
      toast.error(
        error instanceof Error ? error.message : "RioReply marketing run failed.",
      );
    }
  };

  const onSeedDemoData = async () => {
    try {
      const result = await seedDemoData.mutateAsync({
        recipientEmail: demoEmail || undefined,
        fromEmail: fromEmail || undefined,
        enableAutopilot: true,
      });
      await Promise.all([
        apiUtils.shopify.getStore.invalidate(),
        apiUtils.shopify.getStorefrontEventStats.invalidate(),
        apiUtils.shopify.getRecentStorefrontEvents.invalidate(),
        apiUtils.shopify.getRioReplyActions.invalidate(),
        apiUtils.shopify.getMarketingSettings.invalidate(),
      ]);
      toast.success(
        `Demo ready: ${result.productViewsCreated} views on "${result.productTitle}". Run autopilot to send to ${result.recipientEmail}.`,
      );
    } catch (error) {
      console.error("Failed to seed demo data:", error);
      toast.error("Could not generate demo data. Sync products first, then try again.");
    }
  };

  const onSyncNow = async () => {
    try {
      await syncNow.mutateAsync();
      await apiUtils.shopify.getStore.invalidate();
      toast.success(
        customerDataPending
          ? "Products synced. Customer and order sync will start after Shopify approval."
          : "Shopify data synced successfully.",
      );
    } catch (error) {
      console.error("Failed to sync Shopify store:", error);
      toast.error("Shopify sync failed. Check server logs for details.");
      await apiUtils.shopify.getStore.invalidate();
    }
  };

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
  const hasDemoData =
    (store?.customerCount ?? 0) > 0 || (store?.orderCount ?? 0) > 0;
  const showCustomerDataPending = customerDataPending && !hasDemoData;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          href="/integrations"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Integrations
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-bold">Shopify</h1>
          {store ? (
            <Badge variant="outline" className="border-green-200 bg-green-50 text-green-800">
              Connected
            </Badge>
          ) : (
            <Badge variant="outline">Not connected</Badge>
          )}
          {isSyncing ? (
            <Badge variant="secondary">Syncing</Badge>
          ) : null}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Connect your store, enable tracking, and run AI marketing autopilot.
        </p>
      </div>

      {store ? (
        <ShopifySetupChecklist
          steps={setupSteps}
          onStepClick={(tab) => setActiveTab(tab as ShopifyTab)}
        />
      ) : null}

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ShopifyTab)}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {store ? (
            <>
              <TabsTrigger value="tracking">Tracking</TabsTrigger>
              <TabsTrigger value="autopilot">Autopilot</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </>
          ) : null}
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <Card className="rounded-xl p-8">
            <h2 className="text-base font-semibold">
              {store ? "Store connection" : "Connect Shopify"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {store
                ? "Manage sync and view store details."
                : "Connect your Shopify store so RioReply can analyze products, customers, and orders."}
            </p>

            {showCustomerDataPending ? (
              <div className="mt-4 space-y-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                <p>
                  Customer and order sync is paused until Shopify approves protected
                  customer data access for this app. Products sync normally.
                </p>
                <p>
                  Submit the protected customer data request in your Shopify Partner
                  Dashboard. Privacy policy:{" "}
                  <a
                    href="https://rioreply.app/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    rioreply.app/privacy
                  </a>
                </p>
              </div>
            ) : hasDemoData && customerDataPending ? (
              <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
                Demo customer and order data is loaded for App Store preview. Live
                Shopify sync will start after protected customer data approval.
              </div>
            ) : null}

            {!config?.configured ? (
              <p className="mt-4 text-sm text-amber-600">
                Shopify integration is not configured yet. Add SHOPIFY_API_KEY and
                SHOPIFY_API_SECRET to your environment.
              </p>
            ) : null}

            {store ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-lg border p-4 space-y-2">
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-muted-foreground">Store</span>
                    <span className="text-sm font-medium">
                      {store.shopName ?? store.shopDomain}
                    </span>
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
                      {showCustomerDataPending ? "Pending approval" : store.customerCount}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-muted-foreground">Orders</span>
                    <span className="text-sm font-medium">
                      {showCustomerDataPending ? "Pending approval" : store.orderCount}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-muted-foreground">Sync status</span>
                    <span className="text-sm font-medium">
                      {isSyncing ? "Syncing..." : store.syncStatus.toLowerCase()}
                    </span>
                  </div>
                  {store.syncError && !hasDemoData ? (
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
                      <Spinner className="h-4 w-4" />
                    ) : (
                      "Sync now"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDisconnectOpen(true)}
                    disabled={disconnect.isPending || isSyncing}
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div>
                  <Label htmlFor="shop-domain">Shopify store domain</Label>
                  <Input
                    id="shop-domain"
                    className="mt-2"
                    placeholder="your-store or your-store.myshopify.com"
                    value={shopDomain}
                    onChange={(event) => setShopDomain(event.target.value)}
                  />
                </div>
                <Button
                  onClick={onConnect}
                  disabled={
                    !shopDomain || getInstallUrl.isPending || !config?.configured
                  }
                >
                  {getInstallUrl.isPending ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    "Connect Shopify"
                  )}
                </Button>
              </div>
            )}
          </Card>

          {store ? (
            <Accordion type="single" collapsible>
              <AccordionItem value="demo-data" className="rounded-xl border px-6">
                <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                  Developer tools: Demo data
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Generate sample customer, order, and product view events to test
                    RioReply autopilot without waiting for Shopify customer data approval.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="demo-email">Demo recipient email</Label>
                    <Input
                      id="demo-email"
                      type="email"
                      placeholder="you@example.com"
                      value={demoEmail}
                      onChange={(event) => setDemoEmail(event.target.value)}
                    />
                  </div>
                  <Button
                    onClick={onSeedDemoData}
                    disabled={!demoEmail || seedDemoData.isPending || isSyncing}
                  >
                    {seedDemoData.isPending ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      "Generate demo data"
                    )}
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : null}
        </TabsContent>

        {store && trackingSetup ? (
          <TabsContent value="tracking" className="mt-6">
            <Card className="rounded-xl p-8 space-y-6">
              <div>
                <h2 className="text-base font-semibold">Storefront tracking</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Enable RioReply in your theme to capture page views, product views,
                  add to cart, checkout, and purchase events.
                </p>
              </div>

              {trackingActive ? (
                <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900">
                  Tracking is active — events received in the last 24 hours.
                </div>
              ) : (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  No storefront events detected yet. Enable the app embed in your
                  theme, then browse your store to verify tracking.
                </div>
              )}

              {trackingSetup.themeEditorEmbedUrl ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Recommended: App embed</p>
                  <p className="text-sm text-muted-foreground">
                    Opens the theme editor with RioReply selected under App embeds.
                    Toggle it on and save your theme.
                  </p>
                  <Button asChild>
                    <a
                      href={trackingSetup.themeEditorEmbedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Enable in Theme Editor
                    </a>
                  </Button>
                </div>
              ) : null}

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
                  No storefront events yet. Install tracking and browse your store.
                </p>
              )}

              <Accordion type="single" collapsible>
                <AccordionItem value="manual-snippet">
                  <AccordionTrigger className="text-sm font-medium hover:no-underline">
                    Advanced: Manual snippet install
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p className="text-xs text-muted-foreground">
                      Use this only if the app embed is not available yet.
                    </p>
                    <CodeBlockWithCopy code={trackingSetup.snippet}>
                      <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg border bg-muted/40 p-4 text-xs">
                        {trackingSetup.snippet}
                      </pre>
                    </CodeBlockWithCopy>
                    <div className="rounded-lg border p-4 space-y-2 text-sm">
                      <p className="font-medium">Manual install steps</p>
                      <ol className="list-inside list-decimal space-y-1 text-muted-foreground">
                        <li>Go to Online Store → Themes → Edit code</li>
                        <li>
                          Open <code className="text-xs">layout/theme.liquid</code>
                        </li>
                        <li>
                          Paste the snippet before{" "}
                          <code className="text-xs">&lt;/head&gt;</code>
                        </li>
                        <li>Save and visit your storefront to verify events</li>
                      </ol>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          </TabsContent>
        ) : null}

        {store && marketingSettings ? (
          <TabsContent value="autopilot" className="mt-6">
            <Card className="rounded-xl p-8 space-y-6">
              <div>
                <h2 className="text-base font-semibold">AI marketing autopilot</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  RioReply detects product interest from storefront behavior and can
                  send a personalized reminder email when the rules allow it.
                </p>
              </div>

              <div className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="autopilot-enabled">Product interest emails</Label>
                    <p className="text-xs text-muted-foreground">
                      Sends when a visitor views the same product 3+ times without purchasing.
                    </p>
                  </div>
                  <Switch
                    id="autopilot-enabled"
                    checked={autopilotEnabled}
                    onCheckedChange={setAutopilotEnabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from-email">Sender email</Label>
                  <Input
                    id="from-email"
                    placeholder="hello@yourdomain.com"
                    value={fromEmail}
                    onChange={(event) => setFromEmail(event.target.value)}
                    list="verified-domains"
                  />
                  <datalist id="verified-domains">
                    {domains?.map((domain) => (
                      <option key={domain.id} value={`hello@${domain.name}`} />
                    ))}
                  </datalist>
                  {fromEmail && !hasVerifiedSender ? (
                    <p className="text-xs text-amber-600">
                      Use an address from a verified domain.{" "}
                      <Link href="/domains" className="underline">
                        Manage domains
                      </Link>
                    </p>
                  ) : null}
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => onSaveMarketingSettings()}
                    disabled={updateMarketingSettings.isPending}
                  >
                    {updateMarketingSettings.isPending ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      "Save settings"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onRunMarketingNow}
                    disabled={runMarketingNow.isPending}
                  >
                    {runMarketingNow.isPending ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      "Run now"
                    )}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  {marketingSettings.openAiConfigured
                    ? "OpenAI is configured for email generation."
                    : "OpenAI is not configured. RioReply will use a template fallback."}
                </p>
              </div>
            </Card>
          </TabsContent>
        ) : null}

        {store ? (
          <TabsContent value="activity" className="mt-6 space-y-6">
            {recentEvents && recentEvents.length > 0 ? (
              <Card className="rounded-xl p-8 space-y-4">
                <h2 className="text-base font-semibold">Recent storefront events</h2>
                <div className="divide-y rounded-lg border">
                  {recentEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-medium">
                          {event.eventType.replaceAll("_", " ").toLowerCase()}
                        </p>
                        <p className="truncate text-muted-foreground">
                          {event.productHandle ??
                            event.searchQuery ??
                            event.path ??
                            "—"}
                        </p>
                      </div>
                      <span className="shrink-0 text-muted-foreground">
                        {format(new Date(event.occurredAt), "PPp")}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card className="rounded-xl p-8">
                <p className="text-sm text-muted-foreground">
                  No storefront events yet. Enable tracking and browse your store.
                </p>
              </Card>
            )}

            {rioReplyActions && rioReplyActions.length > 0 ? (
              <Card className="rounded-xl p-8 space-y-4">
                <h2 className="text-base font-semibold">Recent RioReply actions</h2>
                <div className="divide-y rounded-lg border">
                  {rioReplyActions.map((action) => (
                    <div key={action.id} className="space-y-1 px-4 py-3 text-sm">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-medium">
                          {action.productTitle ?? "Product interest"}
                        </p>
                        <Badge
                          variant={
                            action.status === "FAILED" ? "destructive" : "outline"
                          }
                          className={
                            action.status === "SENT"
                              ? "border-green-200 bg-green-50 text-green-800"
                              : undefined
                          }
                        >
                          {action.status.toLowerCase()}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{action.explanation}</p>
                      {action.recipientEmail ? (
                        <p className="text-xs text-muted-foreground">
                          {action.recipientEmail}
                          {action.subject ? ` · ${action.subject}` : ""}
                        </p>
                      ) : null}
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(action.createdAt), "PPp")}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card className="rounded-xl p-8">
                <p className="text-sm text-muted-foreground">
                  No RioReply actions yet. Enable autopilot, install tracking, and browse
                  products on your storefront.
                </p>
              </Card>
            )}
          </TabsContent>
        ) : null}
      </Tabs>

      <Dialog open={disconnectOpen} onOpenChange={setDisconnectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect Shopify store?</DialogTitle>
            <DialogDescription>
              RioReply will stop syncing data and sending autopilot emails for{" "}
              {store?.shopName ?? store?.shopDomain}. You can reconnect at any time.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisconnectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onDisconnect}
              disabled={disconnect.isPending}
            >
              {disconnect.isPending ? <Spinner className="h-4 w-4" /> : "Disconnect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { Button } from "@usesend/ui/src/button";

export function ShopifyInstallLanding({
  shopDomain,
  loginUrl,
  connectUrl,
}: {
  shopDomain: string;
  loginUrl?: string;
  connectUrl?: string;
}) {
  const href = loginUrl ?? connectUrl ?? "/integrations/shopify";
  const label = loginUrl ? "Sign in to RioReply" : "Connect store in RioReply";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-lg font-semibold">RioReply</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Connect <span className="font-medium">{shopDomain}</span> to RioReply
        AI marketing autopilot.
      </p>
      <Button asChild>
        <a href={href} target="_top" rel="noopener noreferrer">
          {label}
        </a>
      </Button>
    </div>
  );
}

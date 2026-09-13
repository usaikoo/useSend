"use client";

import { useEffect, useState } from "react";
import { Button } from "@usesend/ui/src/button";
import { Spinner } from "@usesend/ui/src/spinner";

export function ShopifyInstallClient({
  installUrl,
  shopDomain,
}: {
  installUrl: string;
  shopDomain: string;
}) {
  const [isEmbedded, setIsEmbedded] = useState(true);

  useEffect(() => {
    const embedded = window.self !== window.top;
    setIsEmbedded(embedded);

    if (!embedded) {
      window.location.href = installUrl;
    }
  }, [installUrl]);

  if (!isEmbedded) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3">
        <Spinner className="h-5 w-5" />
        <p className="text-sm text-muted-foreground">
          Connecting {shopDomain} to RioReply...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-lg font-semibold">Connect your store</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Approve RioReply access to {shopDomain} to start AI marketing.
      </p>
      <Button asChild>
        <a href={installUrl} target="_top" rel="noopener noreferrer">
          Connect {shopDomain}
        </a>
      </Button>
    </div>
  );
}

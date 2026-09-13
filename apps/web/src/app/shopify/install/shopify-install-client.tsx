"use client";

import { useEffect } from "react";
import { Spinner } from "@usesend/ui/src/spinner";
import { IframeBreakout } from "~/components/iframe-breakout";

export function ShopifyInstallClient({
  installUrl,
  shopDomain,
}: {
  installUrl: string;
  shopDomain: string;
}) {
  useEffect(() => {
    window.location.href = installUrl;
  }, [installUrl]);

  return (
    <IframeBreakout>
      <div className="flex h-screen flex-col items-center justify-center gap-3">
        <Spinner className="h-5 w-5" />
        <p className="text-sm text-muted-foreground">
          Connecting {shopDomain} to RioReply...
        </p>
      </div>
    </IframeBreakout>
  );
}

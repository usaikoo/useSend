"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@usesend/ui/src/spinner";

export function IframeBreakout({ children }: { children: React.ReactNode }) {
  const [isEmbedded, setIsEmbedded] = useState(true);
  const [href, setHref] = useState("");

  useEffect(() => {
    setHref(window.location.href);
    setIsEmbedded(window.self !== window.top);
  }, []);

  if (!href) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  if (isEmbedded) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="max-w-sm text-sm text-muted-foreground">
          RioReply needs to open outside Shopify to sign in or connect your
          store.
        </p>
        <a
          href={href}
          target="_top"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Continue in RioReply
        </a>
      </div>
    );
  }

  return children;
}

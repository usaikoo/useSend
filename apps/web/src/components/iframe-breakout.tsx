"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@usesend/ui/src/spinner";

export function IframeBreakout({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.self !== window.top) {
      window.top!.location.href = window.location.href;
      return;
    }

    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  return children;
}

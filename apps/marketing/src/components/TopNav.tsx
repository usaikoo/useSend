"use client";

import Link from "next/link";
import { RioReplyBrand } from "~/components/RioReplyLogo";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@usesend/ui/src/button";
import { APP_SIGNUP_URL } from "~/lib/site-config";

export function TopNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const featuresHref = isHome ? "#features" : "/#features";
  const pricingHref = isHome ? "#pricing" : "/#pricing";
  const howItWorksHref = isHome ? "#how-it-works" : "/#how-it-works";

  return (
    <header className="py-4 border-b border-border sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-sidebar-background/80">
      <div className="mx-auto max-w-6xl px-6 flex items-center justify-between gap-4 text-sm">
        <Link href="/" className="group hover:opacity-90">
          <RioReplyBrand />
        </Link>

        <nav className="hidden sm:flex items-center gap-4 text-muted-foreground">
          <Link href={howItWorksHref} className="hover:text-foreground">
            How it works
          </Link>
          <Link href={featuresHref} className="hover:text-foreground">
            Features
          </Link>
          <Link href={pricingHref} className="hover:text-foreground">
            Pricing
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Button size="sm" className="ml-2">
            <a href={APP_SIGNUP_URL}>Start free</a>
          </Button>
        </nav>

        <button
          aria-label="Open menu"
          className="sm:hidden inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-border"
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-6 w-6"
          >
            {open ? (
              <path
                d="M6 18 18 6M6 6l12 12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <path
                d="M3 6h18M3 12h18M3 18h18"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>
        </button>
      </div>

      {open ? (
        <div className="sm:hidden border-t border-border bg-sidebar-background/95 backdrop-blur">
          <div className="mx-auto max-w-6xl px-6 py-3 flex flex-col gap-2">
            <Link
              href={howItWorksHref}
              className="py-2 text-muted-foreground hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              How it works
            </Link>
            <Link
              href={featuresHref}
              className="py-2 text-muted-foreground hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              Features
            </Link>
            <Link
              href={pricingHref}
              className="py-2 text-muted-foreground hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/privacy"
              className="py-2 text-muted-foreground hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              Privacy
            </Link>
            <div className="pt-2">
              <Button className="w-full">
                <a href={APP_SIGNUP_URL} onClick={() => setOpen(false)}>
                  Start free
                </a>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

import Link from "next/link";
import { RioReplyBrand } from "~/components/RioReplyLogo";
import { APP_NAME } from "~/lib/brand";
import { APP_SIGNUP_URL } from "~/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="py-10 border-t border-border">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-8">
          <div className="sm:w-56">
            <RioReplyBrand />
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              AI marketing autopilot for Shopify stores.
            </p>
          </div>

          <div className="sm:ml-auto grid grid-cols-2 sm:grid-cols-3 gap-x-12 gap-y-2 text-sm">
            <div>
              <div className="text-xs uppercase tracking-wider mb-2">
                Product
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a
                    href={APP_SIGNUP_URL}
                    className="hover:text-foreground text-xs"
                  >
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="/#features" className="hover:text-foreground text-xs">
                    Features
                  </a>
                </li>
                <li>
                  <a href="/#pricing" className="hover:text-foreground text-xs">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wider mb-2">
                Contact
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a
                    href="mailto:privacy@rioreply.app"
                    className="hover:text-foreground text-xs"
                  >
                    privacy@rioreply.app
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wider mb-2">
                Legal
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/privacy" className="hover:text-foreground text-xs">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground text-xs">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

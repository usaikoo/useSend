import type { Metadata } from "next";
import { TopNav } from "~/components/TopNav";
import { APP_URL, SITE_URL } from "~/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy Policy – RioReply",
  description:
    "How RioReply collects, uses, and protects data for merchants and their customers.",
};

const CONTACT_EMAIL = "privacy@rioreply.app";
const LAST_UPDATED = "September 13, 2026";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-sidebar-background text-foreground">
      <TopNav />
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight mb-6">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground mb-8">
          This Privacy Policy explains how RioReply (&quot;RioReply&quot;,
          &quot;we&quot;, &quot;us&quot;) collects, uses, stores, and shares
          information when you visit {SITE_URL}, use our application at{" "}
          {APP_URL}, or connect a Shopify store to RioReply.
        </p>

        <section className="space-y-3 mb-8">
          <h2 className="text-xl font-medium">Who we are</h2>
          <p className="text-muted-foreground">
            RioReply is an AI marketing autopilot for Shopify merchants. We help
            merchants analyze store and customer behavior to send relevant,
            personalized marketing emails. For privacy questions or requests,
            contact us at{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="underline decoration-dotted"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-xl font-medium">Who this policy applies to</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>
              <span className="text-foreground">Merchants</span> who create a
              RioReply account or connect a Shopify store.
            </li>
            <li>
              <span className="text-foreground">Store visitors and customers</span>{" "}
              of merchants who use RioReply tracking and marketing features.
            </li>
            <li>
              <span className="text-foreground">Website visitors</span> to{" "}
              {SITE_URL}.
            </li>
          </ul>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-xl font-medium">Information we collect</h2>

          <h3 className="text-base font-medium pt-2">Merchant account data</h3>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>Name, email address, and authentication details.</li>
            <li>Team and billing information when applicable.</li>
            <li>Email domain and sending configuration.</li>
          </ul>

          <h3 className="text-base font-medium pt-4">
            Shopify store data (via Shopify APIs)
          </h3>
          <p className="text-muted-foreground">
            When a merchant connects Shopify, RioReply accesses store data
            authorized by the merchant during installation. This may include:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>
              <span className="text-foreground">Store information:</span> store
              name, domain, currency, timezone, and contact email.
            </li>
            <li>
              <span className="text-foreground">Products:</span> titles,
              descriptions, prices, inventory, images, tags, and URLs.
            </li>
            <li>
              <span className="text-foreground">Customers:</span> name, email,
              phone, order count, total spent, marketing consent status, and
              purchase dates.
            </li>
            <li>
              <span className="text-foreground">Orders:</span> order ID, line
              items, totals, currency, status, and associated customer.
            </li>
          </ul>

          <h3 className="text-base font-medium pt-4">
            Storefront behavior data (tracking script)
          </h3>
          <p className="text-muted-foreground">
            Merchants may install a RioReply tracking snippet on their Shopify
            storefront. This captures behavioral events such as:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>Page views, product views, and collection views.</li>
            <li>Search queries.</li>
            <li>Add to cart, checkout started, and purchase events.</li>
            <li>
              Anonymous visitor and session identifiers stored in first-party
              cookies (<code className="text-xs">_rr_vid</code>,{" "}
              <code className="text-xs">_rr_sid</code>).
            </li>
            <li>Page URL, referrer, and browser user agent.</li>
          </ul>
          <p className="text-muted-foreground">
            Storefront tracking does not intentionally collect payment card
            numbers or Shopify admin credentials.
          </p>

          <h3 className="text-base font-medium pt-4">Email engagement data</h3>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>Email delivery, open, click, bounce, and unsubscribe events.</li>
            <li>Campaign and message metadata needed to measure performance.</li>
          </ul>

          <h3 className="text-base font-medium pt-4">Website analytics</h3>
          <p className="text-muted-foreground">
            Our marketing site may use privacy-friendly analytics to understand
            aggregated traffic. We do not use this data to identify individual
            visitors.
          </p>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-xl font-medium">How we use information</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>Provide, operate, and improve RioReply.</li>
            <li>
              Synchronize Shopify store, product, customer, and order data for
              the connected merchant.
            </li>
            <li>
              Analyze customer behavior and purchase patterns to identify
              marketing opportunities.
            </li>
            <li>
              Generate and send personalized marketing emails on behalf of the
              merchant, respecting consent and frequency limits.
            </li>
            <li>Measure campaign performance and revenue attribution.</li>
            <li>Maintain security, prevent abuse, and comply with legal obligations.</li>
          </ul>
          <p className="text-muted-foreground">
            We do not sell personal information. We do not use Shopify customer
            data for advertising outside the merchant&apos;s own store
            marketing.
          </p>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-xl font-medium">Legal bases (EEA/UK)</h2>
          <p className="text-muted-foreground">
            Where applicable, we process data based on: (1) contract — to
            provide RioReply to merchants; (2) legitimate interests — to secure
            our services and improve product functionality; (3) consent — for
            marketing emails where required; and (4) legal obligation — where
            required by law.
          </p>
          <p className="text-muted-foreground">
            Merchants are responsible for obtaining any required consent from
            their customers before sending marketing communications.
          </p>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-xl font-medium">Data sharing</h2>
          <p className="text-muted-foreground">
            We share information only with service providers that help us operate
            RioReply, such as hosting, database, email delivery, and payment
            processors. These providers process data on our instructions and
            under appropriate agreements.
          </p>
          <p className="text-muted-foreground">
            We may also disclose information if required by law or to protect
            the rights, safety, and security of RioReply, merchants, and users.
          </p>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-xl font-medium">Data retention</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>
              Merchant account data is retained while the account is active and
              as needed afterward for legal and billing purposes.
            </li>
            <li>
              Shopify store data is retained while the store remains connected.
            </li>
            <li>
              Storefront events are retained to support behavior analysis and
              marketing decisions, typically up to 24 months unless deleted
              earlier.
            </li>
            <li>
              Email logs and engagement data are retained as needed for
              deliverability, analytics, and compliance.
            </li>
          </ul>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-xl font-medium">App uninstall and data deletion</h2>
          <p className="text-muted-foreground">
            When a merchant uninstalls the RioReply Shopify app or disconnects
            their store:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>We stop syncing new Shopify data immediately.</li>
            <li>
              We mark the store connection as uninstalled and revoke ongoing
              API access.
            </li>
            <li>
              Connected Shopify data (products, customers, orders, storefront
              events) is scheduled for deletion within 30 days unless the
              merchant requests earlier deletion or retention is required by law.
            </li>
            <li>
              Merchants may request deletion at any time by emailing{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="underline decoration-dotted"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </li>
          </ul>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-xl font-medium">Security</h2>
          <p className="text-muted-foreground">
            We use industry-standard measures to protect data, including
            encrypted connections (HTTPS/TLS), access controls, and secure
            storage of credentials such as Shopify access tokens. No method of
            transmission or storage is 100% secure, but we work to protect
            information appropriately.
          </p>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-xl font-medium">International transfers</h2>
          <p className="text-muted-foreground">
            Data may be processed in countries other than where you live. Where
            required, we implement appropriate safeguards for cross-border
            transfers.
          </p>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-xl font-medium">Your rights</h2>
          <p className="text-muted-foreground">
            Depending on your location, you may have rights to access, correct,
            delete, or export personal information, or to object to or restrict
            certain processing. Merchants can contact us to exercise these
            rights. End customers of a merchant should contact the merchant
            first; we will assist merchants with lawful requests.
          </p>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-xl font-medium">Children</h2>
          <p className="text-muted-foreground">
            RioReply is not directed to children, and we do not knowingly
            collect personal information from children.
          </p>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-xl font-medium">Changes</h2>
          <p className="text-muted-foreground">
            We may update this policy from time to time. Material changes will
            be reflected by updating the date below.
          </p>
        </section>

        <section className="space-y-3 mb-10">
          <h2 className="text-xl font-medium">Contact</h2>
          <p className="text-muted-foreground">
            Privacy questions or data requests:{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="underline decoration-dotted"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </section>

        <p className="text-xs text-muted-foreground">
          Last updated: {LAST_UPDATED}
        </p>
      </div>
    </main>
  );
}

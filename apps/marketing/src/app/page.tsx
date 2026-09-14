import Link from "next/link";
import { SiteFooter } from "~/components/SiteFooter";
import { Button } from "@usesend/ui/src/button";
import { TopNav } from "~/components/TopNav";
import { FeatureCardPlain } from "~/components/FeatureCardPlain";
import { APP_NAME } from "~/lib/brand";
import { APP_SIGNUP_URL } from "~/lib/site-config";

export default function Page() {
  return (
    <main className="min-h-screen text-foreground bg-background">
      <TopNav />
      <Hero />
      <HowItWorks />
      <Features />
      <Pricing />
      <About />
      <SiteFooter />
    </main>
  );
}

function Hero() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <p className="text-center text-sm uppercase tracking-[0.2em] text-primary">
          AI marketing autopilot for Shopify
        </p>
        <h1 className="mt-4 text-center text-3xl sm:text-5xl font-semibold text-primary font-sans max-w-3xl mx-auto leading-tight">
          Connect Shopify. Let AI handle your marketing.
        </h1>
        <p className="mt-5 text-center text-base sm:text-lg font-sans max-w-2xl mx-auto text-muted-foreground">
          {APP_NAME} analyzes products, customer behavior, and storefront
          activity to decide when personalized emails should go out — so you
          don&apos;t have to build complex automations yourself.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="lg" className="px-6">
            <a href={APP_SIGNUP_URL}>Start free</a>
          </Button>
          <Button size="lg" variant="outline" className="px-6">
            <a href="#how-it-works">See how it works</a>
          </Button>
        </div>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Built for Shopify merchants • One-click app embed • Free plan available
        </p>

        <div className="mt-16 mx-auto max-w-4xl rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
            <HeroStat label="Connect" value="OAuth in minutes" />
            <HeroStat label="Track" value="Storefront behavior" />
            <HeroStat label="Send" value="AI-timed emails" />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-primary">{label}</p>
      <p className="mt-1 text-sm sm:text-base font-medium">{value}</p>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      step: "1",
      title: "Connect your Shopify store",
      content:
        "Install RioReply from the Shopify App Store and connect your store. Products sync automatically so RioReply understands your catalog.",
    },
    {
      step: "2",
      title: "Enable storefront tracking",
      content:
        "Turn on the RioReply app embed in your theme editor. Page views, product views, and add-to-cart events flow in within seconds.",
    },
    {
      step: "3",
      title: "AI detects product interest",
      content:
        "RioReply watches for meaningful behavior — like a visitor viewing the same product multiple times — and evaluates whether outreach makes sense.",
    },
    {
      step: "4",
      title: "Personalized emails go out",
      content:
        "When the rules allow it, RioReply sends a tailored reminder email from your domain, respecting consent and avoiding spammy blast campaigns.",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-20 border-t border-border">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <div className="mb-2 text-sm uppercase tracking-wider text-primary">
            How it works
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            RioReply is not a drag-and-drop automation builder. It is an AI
            agent that decides what marketing action to take next.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {steps.map((item) => (
            <div
              key={item.step}
              className="rounded-xl border border-primary/20 p-6 bg-background"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {item.step}
              </div>
              <h3 className="mt-4 text-lg font-medium">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {item.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      key: "shopify-native",
      title: "Shopify-native setup",
      content:
        "OAuth connect, product sync, and a theme app embed — no manual theme.liquid editing required for tracking.",
    },
    {
      key: "storefront-tracking",
      title: "Storefront behavior tracking",
      content:
        "Capture page views, product views, add to cart, checkout, and purchase signals from your live storefront.",
    },
    {
      key: "product-interest",
      title: "Product interest detection",
      content:
        "RioReply flags when a visitor shows repeated interest in a product, a strong signal for a timely follow-up email.",
    },
    {
      key: "ai-autopilot",
      title: "AI marketing autopilot",
      content:
        "Enable product-interest emails and RioReply evaluates opportunities on a schedule — you stay in control of sender settings.",
    },
    {
      key: "consent-aware",
      title: "Consent-aware sending",
      content:
        "Built to respect Shopify customer marketing consent and frequency limits as customer data access is approved.",
    },
    {
      key: "action-log",
      title: "Transparent action log",
      content:
        "Every RioReply decision is logged with status, explanation, and recipient — so you always know what the AI did and why.",
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <div className="mb-2 text-sm uppercase tracking-wider text-primary">
            Features
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything RioReply needs to understand your store and act on
            marketing opportunities.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <FeatureCardPlain
              key={feature.key}
              title={feature.title}
              content={feature.content}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="py-16 sm:py-20 border-t border-border">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <div className="mb-2 text-sm uppercase tracking-wider text-primary">
            Pricing
          </div>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl mx-auto">
            Start free while RioReply is in beta. Upgrade when you need more
            automation volume.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <PricingCard
            title="Free"
            price="$0"
            note="per month"
            perks={[
              "Connect 1 Shopify store",
              "Product sync & storefront tracking",
              "App embed install in theme editor",
              "Product interest detection",
              "AI marketing autopilot (limited)",
            ]}
            cta="Start free"
            highlighted
          />
          <PricingCard
            title="Pro"
            price="$29"
            note="coming soon"
            perks={[
              "Everything in Free",
              "Higher email send volume",
              "Advanced lifecycle campaigns",
              "Priority support",
              "Shopify Billing integration",
            ]}
            cta="Join waitlist"
            disabled
          />
        </div>
      </div>
    </section>
  );
}

type PricingCardProps = {
  title: string;
  price: string;
  note: string;
  perks: string[];
  cta: string;
  highlighted?: boolean;
  disabled?: boolean;
};

function PricingCard({
  title,
  price,
  note,
  perks,
  cta,
  highlighted = false,
  disabled = false,
}: PricingCardProps) {
  return (
    <div
      className={`rounded-[18px] p-1 ${highlighted ? "bg-primary/20" : "bg-muted/40"}`}
    >
      <div className="h-full rounded-xl bg-background flex flex-col p-6 border border-border">
        <h3 className="font-medium">{title}</h3>
        <div className="mt-2 text-4xl text-primary">{price}</div>
        <div className="text-xs text-muted-foreground">{note}</div>
        <ul className="mt-5 space-y-2 text-sm flex-1">
          {perks.map((perk) => (
            <li key={perk} className="flex items-start gap-2">
              <CheckIcon className="w-4 h-4 mt-0.5 text-primary shrink-0" />
              <span>{perk}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          {disabled ? (
            <Button variant="outline" className="w-full" disabled>
              {cta}
            </Button>
          ) : (
            <Button className="w-full">
              <a href={APP_SIGNUP_URL}>{cta}</a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function About() {
  return (
    <section id="about" className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <div className="mb-2 text-sm uppercase tracking-wider text-primary">
            About {APP_NAME}
          </div>
        </div>

        <div className="mt-8 max-w-3xl mx-auto text-sm sm:text-base space-y-4 text-muted-foreground">
          <p>
            Most Shopify merchants know they should send more marketing emails,
            but they don&apos;t have time to constantly analyze behavior, write
            copy, and tune automations. RioReply takes a different approach: an
            AI agent that watches your store and acts when it makes sense.
          </p>
          <p>
            RioReply is built on a reliable email infrastructure stack, but it
            is not a generic email builder. The product is designed around
            Shopify data, storefront events, and merchant-friendly defaults —
            connect your store, enable tracking, and let RioReply handle the
            rest.
          </p>
          <p>
            Questions or partnership inquiries?{" "}
            <a
              href="mailto:privacy@rioreply.app"
              className="text-primary hover:underline"
            >
              privacy@rioreply.app
            </a>
            {" · "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy policy
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

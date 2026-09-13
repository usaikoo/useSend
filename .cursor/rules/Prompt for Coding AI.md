Read `RIOREPLY_PRODUCT.md` before making any product or architecture decisions.

You are helping me build RioReply.

Treat `RIOREPLY_PRODUCT.md` as the source of truth for the business concept, product direction, and AI behavior.

Your job is not simply to build another email marketing dashboard.

Build RioReply around this core concept:

> Shopify merchant connects their store → RioReply understands the store, products, customers and customer behavior → AI decides what marketing action should happen → RioReply executes the action automatically → AI measures the result and improves future decisions.

Important principles:

1. Shopify is the initial ecommerce platform.
2. RioReply is an AI marketing autopilot, not a traditional marketing automation builder.
3. The merchant should not need to manually create complicated workflows.
4. AI should analyze customer behavior and decide appropriate marketing actions.
5. AI can decide that no action should be taken.
6. Every marketing action must be based on real Shopify/store/customer data.
7. Never invent products, prices, discounts, inventory or customer information.
8. Respect marketing consent, unsubscribe requests and suppression rules.
9. Protect customers from excessive email communication.
10. The product should be simple enough for a small Shopify merchant to understand.
11. Prioritize revenue, retention, relevance and customer experience over the number of emails sent.
12. Build the MVP first. Do not prematurely build every possible marketing feature.
13. When proposing a feature, explain how it supports the AI marketing autopilot concept.
14. Avoid turning the product into a Mailchimp/HubSpot clone.
15. Prefer autonomous AI workflows over manual campaign configuration.

Before implementing a major feature, ask:

- What customer problem does this solve?
- What Shopify data does it use?
- What AI decision is being made?
- What action does RioReply take?
- How do we measure whether the action worked?
- How does the result improve future decisions?

Keep the architecture extensible because future versions may support additional ecommerce platforms and marketing channels, but do not over-engineer the MVP.

The ultimate goal is:

> **The merchant connects Shopify and RioReply takes care of the marketing.**
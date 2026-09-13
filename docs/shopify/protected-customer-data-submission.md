# RioReply — Shopify Protected Customer Data Submission

Use this document when requesting protected customer data access in the Shopify Partner Dashboard.

**Privacy policy URL:** https://rioreply.app/privacy  
**App URL:** https://app.rioreply.app/shopify/install  
**Support email:** privacy@rioreply.app

---

## App summary (paste into Partner Dashboard)

RioReply is an AI marketing autopilot for Shopify merchants. After a merchant connects their store, RioReply analyzes products, customer behavior, and purchase history to automatically decide when personalized marketing emails should be sent.

RioReply is not a generic email builder. The merchant connects Shopify and RioReply handles analysis, decision-making, and email execution on their behalf.

---

## Why RioReply needs protected customer data

RioReply requires customer and order data to deliver its core functionality:

| Data | Why we need it |
|------|----------------|
| Customer name, email, phone | Identify who to contact and personalize messages |
| Customer order count, total spent, last order date | Understand customer lifecycle (new, repeat, inactive, high-value) |
| Email marketing consent status | Respect Shopify marketing consent before sending emails |
| Order line items, totals, dates, status | Detect purchases, measure campaign attribution, avoid messaging after a completed purchase |
| Customer purchase history | Recommend relevant products and re-engagement campaigns |

Without customer and order data, RioReply cannot:

- Send marketing emails to the right person
- Respect consent and frequency limits
- Detect cart abandonment vs completed purchase
- Measure whether marketing drove revenue
- Run re-engagement for inactive customers

---

## Data fields requested

### Customer data

- Email address
- First name, last name
- Phone number (if available)
- Orders count
- Total amount spent
- Email marketing consent / subscription status
- Customer created date
- Last order date

**Purpose:** Audience selection, personalization, consent checks, lifecycle segmentation.

### Order data

- Order ID and order number
- Customer association
- Line items (product, variant, quantity, price)
- Order total and currency
- Financial and fulfillment status
- Order created date

**Purpose:** Purchase confirmation, attribution, suppression after purchase, product recommendation logic.

---

## Storefront tracking (supplemental, not a substitute)

RioReply also offers an optional storefront tracking script that captures anonymous behavior (page views, product views, add to cart, checkout, purchase) using first-party cookies.

This tracking helps detect product interest before purchase but does not replace the need for customer/order API data. We still require protected customer data to:

- Match behavior to identified customers when possible
- Send emails to customers with valid consent
- Use authoritative order data from Shopify

---

## How data is used (specific use cases)

1. **Product interest** — Customer views a product multiple times without purchasing → RioReply may send a personalized reminder after a cooldown period.
2. **Abandoned cart** — Customer adds to cart but does not complete checkout → RioReply may send a reminder if consent and timing rules allow.
3. **Post-purchase follow-up** — After an order, RioReply analyzes related products and may recommend complementary items at an appropriate time.
4. **Re-engagement** — Customer has not purchased recently → RioReply may send a win-back message based on past purchases.
5. **Suppression** — If a customer recently purchased or unsubscribed, RioReply will not send additional marketing.

RioReply may choose **not** to send an email when evidence is insufficient, consent is missing, or frequency limits apply. Doing nothing is a valid outcome.

---

## Data storage and security

- Data is stored in PostgreSQL on infrastructure controlled by RioReply.
- Shopify access tokens are stored encrypted at rest and used only for authorized API calls.
- All traffic uses HTTPS/TLS.
- Access is limited to authenticated merchant team members.
- RioReply does not sell customer data or use it for third-party advertising.

---

## Data retention

| Data type | Retention |
|-----------|-----------|
| Shopify customers & orders | While store is connected; deleted within 30 days after uninstall |
| Storefront events | Up to 24 months, or earlier on merchant request |
| Email engagement logs | As needed for analytics and compliance |

---

## App uninstall and data deletion

When a merchant uninstalls RioReply:

1. Shopify sends an `app/uninstalled` webhook.
2. RioReply immediately stops syncing and marks the store as uninstalled.
3. API access tokens are no longer used.
4. Store data (products, customers, orders, events) is deleted within 30 days unless retention is required by law.
5. Merchants may request immediate deletion via privacy@rioreply.app.

This is documented in our privacy policy: https://rioreply.app/privacy

---

## Scopes requested

```
read_products
read_customers
read_orders
read_content
```

We request the minimum scopes needed for sync and AI marketing. We do not write to Shopify customer or order records.

---

## Demo script for reviewers

Record a 2–3 minute screencast showing:

1. Install RioReply from the Shopify app listing (or custom install URL).
2. OAuth connect to a development store.
3. Product sync completing in Settings → Shopify.
4. Install the tracking snippet in the theme (Online Store → Themes → Edit code → `theme.liquid`).
5. Browse the storefront (view product, add to cart).
6. Show events appearing in Settings → Shopify → Recent events.
7. Explain that customer/order sync enables AI email marketing (show the pending state if approval is not yet granted).

---

## Answers for common Shopify review questions

**Do you share customer data with third parties?**  
No. Data is used only to provide RioReply to the merchant who installed the app. Infrastructure providers (hosting, email delivery) process data under our instructions.

**Do you use customer data for your own marketing?**  
No. We do not contact a merchant's customers for RioReply's own promotional purposes.

**How do you respect marketing consent?**  
RioReply checks Shopify email marketing consent status before sending marketing emails. Merchants remain responsible for lawful marketing practices in their jurisdiction.

**What happens on uninstall?**  
Sync stops immediately. Connected store data is deleted within 30 days. See privacy policy.

**Why do you need order data?**  
To confirm purchases, attribute revenue, suppress redundant messages after checkout, and power post-purchase recommendations.

---

## Checklist before submitting

- [ ] Privacy policy live at https://rioreply.app/privacy
- [ ] App URL configured: https://app.rioreply.app/shopify/install
- [ ] Redirect URL configured: https://app.rioreply.app/api/shopify/callback
- [ ] Demo store connected and product sync working
- [ ] Tracking snippet tested (events visible in dashboard)
- [ ] 2–3 minute demo video recorded
- [ ] Support email configured: privacy@rioreply.app
- [ ] Submit protected customer data request in Partner Dashboard → App → API access

---

## Partner Dashboard steps

1. Go to [Shopify Partners](https://partners.shopify.com) → Apps → RioReply.
2. Open **API access** or **Protected customer data**.
3. Complete the questionnaire using the sections above.
4. Provide privacy policy URL: `https://rioreply.app/privacy`
5. Upload demo video or provide a unlisted link.
6. Submit and monitor email for follow-up questions.

Approval typically takes several business days. Continue building Phase 3 while waiting.

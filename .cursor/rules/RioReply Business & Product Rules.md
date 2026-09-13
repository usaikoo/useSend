# RioReply — Business & Product Rules

## 1. Product Vision

RioReply is an AI-powered marketing autopilot for Shopify stores.

The goal is simple:

> A Shopify merchant connects their store to RioReply, and RioReply continuously analyzes their store, products, customers, and customer behavior to automatically decide and execute marketing actions.

The merchant should NOT need to become a marketing expert.

RioReply should reduce the amount of marketing work the merchant has to do manually.

### Core promise

**Connect Shopify. Let AI handle your marketing.**

RioReply should help merchants:

- Understand customer behavior
- Identify customers who may be ready to purchase
- Identify customers who are becoming inactive
- Recommend relevant products
- Recover potential lost sales
- Re-engage existing customers
- Automatically send personalized emails
- Continuously learn from campaign results
- Reduce the amount of manual marketing work

---

# 2. Target Customer

The initial target customer is:

**Shopify merchants and small-to-medium-sized ecommerce businesses.**

RioReply should initially focus on Shopify rather than trying to support every ecommerce platform.

The product should be designed around Shopify data and workflows first.

Future integrations can include other ecommerce platforms, but Shopify is the initial platform.

---

# 3. The Main Problem

Many Shopify merchants know they should do marketing, but they don't have enough time or expertise to constantly:

- Analyze customer behavior
- Create campaigns
- Segment customers
- Write emails
- Decide when to send emails
- Decide which products to promote
- Monitor campaign performance
- Adjust campaigns
- Re-engage inactive customers
- Build complex automations

Existing marketing platforms often require merchants to manually configure complicated workflows.

RioReply should take a different approach.

Instead of asking:

> "What automation do you want to create?"

RioReply should ask internally:

> "What should I do next to help this store generate more sales and retain customers?"

---

# 4. Core Product Concept

RioReply has four major responsibilities:

```text
UNDERSTAND
    ↓
ANALYZE
    ↓
DECIDE
    ↓
ACT
```

### Understand

RioReply collects information about:

- Shopify store
- Products
- Categories
- Prices
- Inventory
- Customers
- Orders
- Customer purchase history
- Customer browsing behavior
- Product views
- Website sessions
- Email engagement
- Campaign performance

### Analyze

AI analyzes:

- Customer interests
- Purchase behavior
- Product interest
- Customer lifecycle
- Engagement
- Purchase frequency
- Recency
- Potential churn
- Product relationships
- Campaign performance
- Store trends

### Decide

AI decides:

- Who should receive marketing
- Which customers should NOT receive marketing
- What product or topic is relevant
- What type of message should be sent
- When the message should be sent
- Whether a campaign should be created
- Whether an existing campaign should be changed or stopped

### Act

RioReply can:

- Generate email content
- Create marketing campaigns
- Send emails
- Schedule emails
- Recommend products
- Trigger follow-ups
- Stop campaigns when conditions change
- Adjust future marketing based on results

---

# 5. Important Product Philosophy

RioReply is NOT primarily a traditional email marketing tool.

It is an:

> **AI Marketing Autopilot**

Traditional tools:

```text
Merchant
   ↓
Creates campaign
   ↓
Creates segment
   ↓
Writes email
   ↓
Creates automation
   ↓
Schedules campaign
   ↓
Analyzes results
```

RioReply:

```text
Shopify data
     ↓
Customer behavior
     ↓
AI analysis
     ↓
AI decides marketing action
     ↓
AI creates message
     ↓
AI sends message
     ↓
AI analyzes result
     ↓
AI improves future decisions
```

The merchant should mainly monitor and approve important actions rather than manually build every automation.

---

# 6. Shopify Data

RioReply should understand Shopify data including:

## Store

- Store name
- Store URL
- Store settings
- Currency
- Store timezone

## Products

- Product name
- Description
- Price
- Compare-at price
- Product category
- Collections
- Variants
- Inventory
- Product URL
- Product images
- Product tags

## Customers

- Customer identity available through Shopify
- Purchase history
- Order count
- Total spending
- Last purchase
- First purchase
- Products purchased
- Customer activity
- Marketing consent/status

## Orders

- Order date
- Products
- Quantity
- Revenue
- Discounts
- Customer
- Order status

RioReply should continuously synchronize relevant Shopify information.

---

# 7. Website Behavior Tracking

RioReply should provide a lightweight tracking mechanism for the merchant's Shopify storefront.

The tracking system can capture events such as:

- Page view
- Product view
- Collection view
- Search
- Add to cart
- Remove from cart
- Checkout started
- Purchase
- Email click
- Email engagement
- Returning visitor

Example:

```text
Customer A

10:01 — Viewed Product A
10:05 — Viewed Product A
10:07 — Viewed Product B
10:12 — Added Product A to cart
10:15 — Left website
```

RioReply can interpret this behavior and determine whether a marketing action may be appropriate.

---

# 8. AI Customer Understanding

RioReply should create a continuously updated understanding of customer behavior.

Examples of possible customer states:

- New visitor
- New customer
- Returning customer
- Highly engaged customer
- Product interested
- Cart abandoner
- Repeat buyer
- High-value customer
- Inactive customer
- Potential churn
- Recently purchased
- Product-specific interest

These are not necessarily permanent labels.

The AI should continuously reevaluate customer state based on new behavior.

---

# 9. AI Marketing Decisions

RioReply should NOT blindly send emails whenever an event happens.

The AI should evaluate:

1. Is an email actually useful?
2. Is this customer eligible to receive marketing?
3. Is the customer already being contacted?
4. Has the customer recently received an email?
5. What is the customer's current intent?
6. What product or message is relevant?
7. Is the timing appropriate?
8. Is there enough evidence to justify contacting the customer?
9. Could another action be better than sending an email?
10. Should RioReply do nothing?

**Doing nothing is a valid AI decision.**

The system should prioritize useful communication over sending as many emails as possible.

---

# 10. Examples of AI Marketing Actions

## Product Interest

Customer repeatedly views a product but does not purchase.

Possible AI action:

```text
Detect product interest
        ↓
Evaluate previous communication
        ↓
Wait appropriate amount of time
        ↓
Generate personalized email
        ↓
Recommend the viewed product
```

---

## Abandoned Cart

Customer adds products to cart but does not complete purchase.

Possible AI action:

```text
Cart abandoned
      ↓
Wait
      ↓
Check whether purchase occurred
      ↓
If not purchased:
      ↓
Send appropriate reminder
```

The AI should determine whether another reminder is appropriate.

---

## Post-Purchase

Customer purchases Product A.

RioReply analyzes:

- Product A
- Customer purchase history
- Related products
- Typical purchase patterns

Possible action:

```text
Purchase Product A
        ↓
Analyze related products
        ↓
Determine appropriate timing
        ↓
Recommend Product B
```

---

## Customer Re-engagement

Customer previously purchased but has become inactive.

Possible action:

```text
Customer activity decreases
        ↓
AI evaluates customer lifecycle
        ↓
Determine whether customer is becoming inactive
        ↓
Create personalized re-engagement message
```

---

## New Product

Merchant launches a new product.

RioReply analyzes existing customers who may have an interest in the product.

Possible action:

```text
New product
    ↓
Analyze existing customer interests
    ↓
Identify relevant audience
    ↓
Generate campaign
    ↓
Send to appropriate customers
```

---

# 11. AI Should Understand Products

RioReply should not treat products as simple database records.

AI should understand:

- What the product is
- What problem it solves
- Product category
- Related products
- Potential complementary products
- Price range
- Product popularity
- Customer segments interested in it

This allows RioReply to generate more relevant marketing.

Example:

```text
Customer purchased running shoes.

AI identifies:
- Running-related product
- Customer likely interested in running accessories
- Existing store contains running socks

Potential action:
Recommend running socks at an appropriate time.
```

The AI must use actual products available in the Shopify store.

It must NOT invent products.

---

# 12. Personalized Email Generation

RioReply should generate email content dynamically.

Emails should consider:

- Customer behavior
- Customer purchase history
- Relevant products
- Store brand
- Product information
- Previous email engagement
- Current marketing objective

Emails should not feel like generic AI-generated spam.

The system should prioritize:

- Relevance
- Conciseness
- Natural language
- Brand consistency
- Useful recommendations

---

# 13. Marketing Frequency

RioReply must protect customers from excessive communication.

The system should have safeguards such as:

- Frequency limits
- Cooldown periods
- Duplicate campaign prevention
- Recent-email checks
- Customer-level communication limits
- Global store limits

Example rule:

```text
If customer received a marketing email recently:
    Do not send another email unless the action is sufficiently important.
```

The exact limits should be configurable.

---

# 14. Marketing Consent & Compliance

RioReply must respect applicable email marketing laws and platform requirements.

The system must:

- Respect Shopify customer marketing consent
- Never intentionally send marketing emails to customers who are not eligible
- Include unsubscribe functionality
- Maintain suppression lists
- Respect unsubscribe requests
- Avoid contacting suppressed customers
- Keep appropriate marketing records

RioReply should treat compliance as a core product requirement, not an optional feature.

---

# 15. AI Safety Rules

The AI must never:

- Invent products
- Invent discounts
- Invent prices
- Invent inventory
- Make false claims about products
- Claim a product is available when it is not
- Create fake customer information
- Send marketing to suppressed customers
- Ignore unsubscribe requests
- Send excessive duplicate emails

If the AI does not have enough information, it should choose a safer action such as:

```text
DO NOTHING
```

rather than making assumptions.

---

# 16. Merchant Control

Although RioReply is an autopilot, merchants must remain in control.

The merchant should be able to:

- Connect/disconnect Shopify
- Connect email provider
- Set brand information
- Set communication preferences
- Set marketing limits
- Pause AI marketing
- Review campaigns
- Approve certain campaign types
- Disable specific automation types
- View AI decisions
- View campaign results

The system should gradually allow more autonomy as trust increases.

---

# 17. AI Transparency

RioReply should explain important AI decisions in simple language.

Example:

> **Why did RioReply send this email?**

```text
This customer viewed the same product 3 times
and added it to their cart yesterday.

They have not purchased yet.

RioReply sent a product reminder because
the customer showed strong purchase intent.
```

The goal is not to expose technical AI reasoning.

The goal is to give the merchant a simple explanation of the action.

---

# 18. Analytics

The dashboard should focus on business outcomes.

Important metrics include:

- Revenue attributed to RioReply
- Emails sent
- Email delivery
- Opens
- Clicks
- Purchases
- Conversion rate
- Revenue per campaign
- Revenue per customer segment
- Unsubscribe rate
- Campaign performance
- Customer reactivation

Avoid making analytics unnecessarily complicated.

The primary question should be:

> **Is RioReply helping this store make more money and retain more customers?**

---

# 19. AI Learning Loop

RioReply should continuously learn from marketing outcomes.

```text
Analyze customer
       ↓
Make marketing decision
       ↓
Send email
       ↓
Observe result
       ↓
Purchase / click / ignore / unsubscribe
       ↓
Update understanding
       ↓
Improve future decisions
```

The system should use historical results to improve future recommendations and timing.

---

# 20. MVP

The first version should NOT attempt to build everything.

MVP should focus on:

### Shopify integration

- OAuth
- Store connection
- Product synchronization
- Customer synchronization
- Order synchronization

### Website tracking

- Page views
- Product views
- Add to cart
- Checkout
- Purchase

### AI customer analysis

- Customer behavior
- Product interest
- Customer lifecycle
- Basic segmentation

### AI email marketing

- Generate email
- Determine audience
- Determine timing
- Send email
- Track results

### Dashboard

Show:

- Store overview
- Customer activity
- AI recommendations/actions
- Campaigns
- Revenue generated
- Basic analytics

---

# 21. What RioReply Should NOT Become

Do NOT turn RioReply into:

- A generic Mailchimp clone
- A generic CRM
- A complicated marketing automation builder
- A social media management platform
- A generic analytics dashboard
- A newsletter editor with AI added
- A platform requiring merchants to manually create dozens of workflows

The differentiator is:

> **AI makes the marketing decisions instead of forcing the merchant to build the automation.**

---

# 22. Product UX Principle

The product should feel simple.

After onboarding, the merchant should be able to:

```text
Connect Shopify
      ↓
Connect email
      ↓
Confirm brand information
      ↓
Enable RioReply
      ↓
AI starts analyzing
```

The merchant should quickly see:

> **RioReply is working.**

Example dashboard:

```text
Good morning 👋

RioReply analyzed 1,248 customers this week.

AI actions
────────────────────────

37 customers re-engaged
14 product recommendations sent
8 abandoned carts recovered

Estimated revenue
$2,840

────────────────────────

What RioReply is doing

✓ Re-engaging inactive customers
✓ Following up with high-intent visitors
✓ Recommending related products

[View AI activity]
```

---

# 23. Long-Term Vision

The long-term goal is to make RioReply an autonomous AI marketing employee for ecommerce businesses.

Instead of merchants hiring multiple people or spending hours managing marketing tools:

```text
Merchant
   ↓
RioReply
   ↓
Understands business
   ↓
Understands customers
   ↓
Creates marketing strategy
   ↓
Executes campaigns
   ↓
Measures results
   ↓
Improves strategy
```

The merchant's role becomes:

> **Set the goals. RioReply handles the execution.**

---

# 24. Core Product Statement

Every product decision should be evaluated against this question:

> **Does this help RioReply understand the store and automatically make better marketing decisions for the merchant?**

If a feature makes the product significantly more complicated without improving autonomous marketing, it should not be prioritized.

---

# 25. One-Sentence Definition

**RioReply is an AI marketing autopilot that connects to Shopify, understands products and customer behavior, and automatically creates and executes personalized marketing to help merchants increase sales and customer retention without manually managing campaigns.**
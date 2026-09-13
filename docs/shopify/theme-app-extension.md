# RioReply Theme App Extension

RioReply storefront tracking can be enabled via **App embeds** in the Shopify theme editor (no manual `theme.liquid` editing).

## Deploy the extension

1. Install [Shopify CLI](https://shopify.dev/docs/api/shopify-cli)
2. Log in: `shopify auth login`
3. From repo root, link the app (first time only):
   ```bash
   shopify app config link
   ```
4. Deploy the extension:
   ```bash
   shopify app deploy
   ```
5. After deploy, copy the **Theme extension UUID** from Partner Dashboard → Apps → RioReply → Extensions
6. Set on server `.env`:
   ```
   SHOPIFY_THEME_EXTENSION_UID=<uuid-from-partner-dashboard>
   ```
   If unset, the deep link uses handle `rioreply-tracker`.

## Merchant flow

1. Connect store in RioReply → Settings → Shopify
2. Click **Enable in Theme Editor**
3. Toggle **RioReply** on under App embeds
4. Save theme
5. Visit storefront — events appear in RioReply within ~30 seconds

## Fallback

Manual snippet install in `layout/theme.liquid` still works if the extension is not deployed yet.

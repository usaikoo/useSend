import type { Prisma } from "@prisma/client";
import type {
  ShopifyRestCustomer,
  ShopifyRestOrder,
  ShopifyRestProduct,
} from "~/server/shopify/types";

function parsePrice(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function mapProductToUpsert(
  storeId: string,
  shopDomain: string,
  product: ShopifyRestProduct,
): Prisma.ShopifyProductUpsertArgs {
  const prices = product.variants
    .map((variant) => parsePrice(variant.price))
    .filter((price): price is number => price !== null);

  const compareAtPrices = product.variants
    .map((variant) => parsePrice(variant.compare_at_price))
    .filter((price): price is number => price !== null);

  const inventoryTotal = product.variants.reduce(
    (sum, variant) => sum + (variant.inventory_quantity ?? 0),
    0,
  );

  const shopifyId = String(product.id);
  const data = {
    title: product.title,
    handle: product.handle,
    description: product.body_html,
    vendor: product.vendor,
    productType: product.product_type,
    status: product.status,
    tags: product.tags,
    priceMin: prices.length > 0 ? Math.min(...prices) : null,
    priceMax: prices.length > 0 ? Math.max(...prices) : null,
    compareAtPrice:
      compareAtPrices.length > 0 ? Math.min(...compareAtPrices) : null,
    inventoryTotal,
    imageUrl: product.images[0]?.src ?? null,
    productUrl: product.handle
      ? `https://${shopDomain}/products/${product.handle}`
      : null,
    shopifyUpdatedAt: parseDate(product.updated_at),
  };

  return {
    where: {
      storeId_shopifyId: {
        storeId,
        shopifyId,
      },
    },
    create: {
      storeId,
      shopifyId,
      ...data,
    },
    update: data,
  };
}

export function mapCustomerToUpsert(
  storeId: string,
  customer: ShopifyRestCustomer,
): Prisma.ShopifyCustomerUpsertArgs {
  const shopifyId = String(customer.id);
  const data = {
    email: customer.email?.toLowerCase() ?? null,
    firstName: customer.first_name,
    lastName: customer.last_name,
    phone: customer.phone,
    ordersCount: customer.orders_count ?? 0,
    totalSpent: parsePrice(customer.total_spent),
    emailMarketingConsent:
      customer.email_marketing_consent?.state === "subscribed",
    shopifyCreatedAt: parseDate(customer.created_at),
  };

  return {
    where: {
      storeId_shopifyId: {
        storeId,
        shopifyId,
      },
    },
    create: {
      storeId,
      shopifyId,
      ...data,
    },
    update: data,
  };
}

export function mapOrderToUpsert(
  storeId: string,
  order: ShopifyRestOrder,
  customerId: string | null,
): Prisma.ShopifyOrderUpsertArgs {
  const shopifyId = String(order.id);
  const data = {
    customerId,
    orderNumber: order.name,
    email: order.email?.toLowerCase() ?? null,
    financialStatus: order.financial_status,
    fulfillmentStatus: order.fulfillment_status,
    totalPrice: parsePrice(order.total_price),
    currency: order.currency,
    lineItems: order.line_items,
    shopifyCreatedAt: parseDate(order.created_at),
  };

  return {
    where: {
      storeId_shopifyId: {
        storeId,
        shopifyId,
      },
    },
    create: {
      storeId,
      shopifyId,
      ...data,
    },
    update: data,
  };
}

import { SHOPIFY_API_VERSION, SHOPIFY_PAGE_LIMIT } from "~/server/shopify/constants";
import type {
  ShopifyRestCustomer,
  ShopifyRestOrder,
  ShopifyRestProduct,
  ShopifyRestWebhook,
} from "~/server/shopify/types";

type ShopifyShopResponse = {
  shop: {
    name: string;
    email: string;
    currency: string;
    iana_timezone: string;
  };
};

type PaginatedResponse<TKey extends string, TItem> = {
  [K in TKey]: TItem[];
} & Record<string, unknown>;

function parseNextPageInfo(linkHeader: string | null): string | undefined {
  if (!linkHeader) {
    return undefined;
  }

  const parts = linkHeader.split(",");
  for (const part of parts) {
    const match = part.match(/page_info=([^>&]+)[^>]*>;\s*rel="next"/);
    if (match?.[1]) {
      return match[1];
    }
  }

  return undefined;
}

export class ShopifyClient {
  constructor(
    private readonly shopDomain: string,
    private readonly accessToken: string,
  ) {}

  private async requestRaw(path: string, init?: RequestInit) {
    const response = await fetch(
      `https://${this.shopDomain}/admin/api/${SHOPIFY_API_VERSION}${path}`,
      {
        ...init,
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": this.accessToken,
          ...init?.headers,
        },
      },
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Shopify API error (${response.status}): ${body}`);
    }

    return response;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await this.requestRaw(path, init);
    return (await response.json()) as T;
  }

  private async paginate<TKey extends string, TItem>(
    resource: TKey,
    basePath: string,
  ): Promise<TItem[]> {
    const items: TItem[] = [];
    let pageInfo: string | undefined;

    do {
      const resourcePath = basePath.split("?")[0] ?? basePath;
      const path = pageInfo
        ? `${resourcePath}?limit=${SHOPIFY_PAGE_LIMIT}&page_info=${pageInfo}`
        : `${basePath}${basePath.includes("?") ? "&" : "?"}limit=${SHOPIFY_PAGE_LIMIT}`;

      const response = await this.requestRaw(path);
      const data = (await response.json()) as PaginatedResponse<TKey, TItem>;
      items.push(...data[resource]);
      pageInfo = parseNextPageInfo(response.headers.get("link"));
    } while (pageInfo);

    return items;
  }

  async getShop() {
    const data = await this.request<ShopifyShopResponse>("/shop.json");
    return data.shop;
  }

  async listProducts() {
    return this.paginate<"products", ShopifyRestProduct>("/products.json", "/products.json");
  }

  async getProduct(productId: string) {
    const data = await this.request<{ product: ShopifyRestProduct }>(
      `/products/${productId}.json`,
    );
    return data.product;
  }

  async listCustomers() {
    return this.paginate<"customers", ShopifyRestCustomer>(
      "customers",
      "/customers.json",
    );
  }

  async getCustomer(customerId: string) {
    const data = await this.request<{ customer: ShopifyRestCustomer }>(
      `/customers/${customerId}.json`,
    );
    return data.customer;
  }

  async listOrders() {
    return this.paginate<"orders", ShopifyRestOrder>(
      "orders",
      "/orders.json?status=any",
    );
  }

  async getOrder(orderId: string) {
    const data = await this.request<{ order: ShopifyRestOrder }>(
      `/orders/${orderId}.json`,
    );
    return data.order;
  }

  async listWebhooks() {
    const data = await this.request<{ webhooks: ShopifyRestWebhook[] }>(
      "/webhooks.json",
    );
    return data.webhooks;
  }

  async createWebhook(topic: string, address: string) {
    await this.request("/webhooks.json", {
      method: "POST",
      body: JSON.stringify({
        webhook: {
          topic,
          address,
          format: "json",
        },
      }),
    });
  }
}

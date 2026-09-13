import { SHOPIFY_API_VERSION } from "~/server/shopify/constants";

type ShopifyShopResponse = {
  shop: {
    name: string;
    email: string;
    currency: string;
    iana_timezone: string;
  };
};

export class ShopifyClient {
  constructor(
    private readonly shopDomain: string,
    private readonly accessToken: string,
  ) {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
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

    return (await response.json()) as T;
  }

  async getShop() {
    const data = await this.request<ShopifyShopResponse>("/shop.json");
    return data.shop;
  }
}

export type ShopifyRestProduct = {
  id: number;
  title: string;
  handle: string;
  body_html: string | null;
  vendor: string;
  product_type: string;
  status: string;
  tags: string;
  updated_at: string;
  variants: Array<{
    price: string;
    compare_at_price: string | null;
    inventory_quantity: number;
  }>;
  images: Array<{
    src: string;
  }>;
};

export type ShopifyRestCustomer = {
  id: number;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  orders_count: number;
  total_spent: string;
  created_at: string;
  updated_at: string;
  email_marketing_consent?: {
    state: string;
  } | null;
  last_order_id: number | null;
  last_order_name: string | null;
};

export type ShopifyRestOrder = {
  id: number;
  name: string;
  email: string | null;
  customer: {
    id: number;
  } | null;
  financial_status: string | null;
  fulfillment_status: string | null;
  total_price: string;
  currency: string;
  line_items: Array<{
    id: number;
    title: string;
    quantity: number;
    price: string;
    product_id: number | null;
    variant_id: number | null;
  }>;
  created_at: string;
};

export type ShopifyRestWebhook = {
  id: number;
  topic: string;
  address: string;
};

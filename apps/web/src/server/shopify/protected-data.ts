import { env } from "~/env";

export function isCustomerDataSyncEnabled() {
  return env.SHOPIFY_SYNC_CUSTOMER_DATA === true;
}

export function isProtectedCustomerDataError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes("protected customer data") ||
    error.message.includes("not approved to access REST endpoints")
  );
}

export const PROTECTED_CUSTOMER_DATA_MESSAGE =
  "Customer and order sync is disabled until Shopify approves protected customer data access for this app.";

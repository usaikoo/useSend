export type MarketingRulesInput = {
  enabled: boolean;
  fromEmail: string | null;
  recipientEmail: string | null;
  emailMarketingConsent: boolean | null;
  isSuppressed: boolean;
  productViewCount: number;
  minProductViews: number;
  hasPurchasedProduct: boolean;
  productInStock: boolean;
  recentMarketingEmailCount: number;
  maxEmailsPerVisitorWeek: number;
  hasRecentProductAction: boolean;
};

export type MarketingRulesResult =
  | { allowed: true }
  | { allowed: false; reason: string };

export function evaluateMarketingRules(
  input: MarketingRulesInput,
): MarketingRulesResult {
  if (!input.enabled) {
    return { allowed: false, reason: "AUTOPILOT_DISABLED" };
  }

  if (!input.fromEmail) {
    return { allowed: false, reason: "NO_FROM_EMAIL" };
  }

  if (!input.recipientEmail) {
    return { allowed: false, reason: "NO_EMAIL" };
  }

  if (input.isSuppressed) {
    return { allowed: false, reason: "SUPPRESSED" };
  }

  if (input.emailMarketingConsent === false) {
    return { allowed: false, reason: "NO_CONSENT" };
  }

  if (input.emailMarketingConsent !== true) {
    return { allowed: false, reason: "CONSENT_UNKNOWN" };
  }

  if (input.productViewCount < input.minProductViews) {
    return { allowed: false, reason: "INSUFFICIENT_VIEWS" };
  }

  if (input.hasPurchasedProduct) {
    return { allowed: false, reason: "ALREADY_PURCHASED" };
  }

  if (!input.productInStock) {
    return { allowed: false, reason: "OUT_OF_STOCK" };
  }

  if (input.recentMarketingEmailCount >= input.maxEmailsPerVisitorWeek) {
    return { allowed: false, reason: "FREQUENCY_LIMIT" };
  }

  if (input.hasRecentProductAction) {
    return { allowed: false, reason: "COOLDOWN_ACTIVE" };
  }

  return { allowed: true };
}

export function buildSkipExplanation(reason: string) {
  switch (reason) {
    case "AUTOPILOT_DISABLED":
      return "RioReply autopilot is disabled for this store.";
    case "NO_FROM_EMAIL":
      return "No sender email is configured for RioReply autopilot.";
    case "NO_EMAIL":
      return "No email address is available for this visitor yet.";
    case "NO_CONSENT":
      return "This customer has not opted in to marketing emails.";
    case "CONSENT_UNKNOWN":
      return "Marketing consent could not be verified for this visitor.";
    case "SUPPRESSED":
      return "This email address is on the suppression list.";
    case "INSUFFICIENT_VIEWS":
      return "The visitor has not viewed this product enough times yet.";
    case "ALREADY_PURCHASED":
      return "The visitor already purchased this product.";
    case "OUT_OF_STOCK":
      return "The product is out of stock.";
    case "FREQUENCY_LIMIT":
      return "This visitor has received too many marketing emails recently.";
    case "COOLDOWN_ACTIVE":
      return "RioReply recently contacted this visitor about this product.";
    default:
      return "RioReply decided not to send an email.";
  }
}

export function buildSendExplanation(input: {
  productTitle: string;
  productViewCount: number;
}) {
  return `This visitor viewed "${input.productTitle}" ${input.productViewCount} times without purchasing. RioReply sent a personalized product reminder.`;
}

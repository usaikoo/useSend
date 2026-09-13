import { env } from "~/env";
import { logger } from "~/server/logger/log";

export type ProductInterestEmailInput = {
  storeName: string;
  productTitle: string;
  productDescription: string | null;
  productUrl: string | null;
  productPrice: number | null;
  currency: string | null;
  customerFirstName: string | null;
};

export type GeneratedEmail = {
  subject: string;
  html: string;
  source: "openai" | "template";
};

const UNSUBSCRIBE_FOOTER = `<p style="margin-top:24px;font-size:12px;color:#666;"><a href="{{usesend_unsubscribe_url}}">Unsubscribe</a></p>`;

export class OpenAiEmailService {
  static isConfigured() {
    return Boolean(env.OPENAI_API_KEY);
  }

  static async generateProductInterestEmail(
    input: ProductInterestEmailInput,
  ): Promise<GeneratedEmail> {
    if (!this.isConfigured()) {
      return {
        ...this.buildTemplateEmail(input),
        source: "template",
      };
    }

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: env.OPENAI_MODEL ?? "gpt-4o-mini",
          temperature: 0.7,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "You write concise, helpful marketing emails for Shopify stores. Use only the product facts provided. Do not invent discounts, inventory, prices, or claims. Return JSON with keys subject and html. html must be simple HTML paragraphs and a product link if provided. Do not include an unsubscribe link.",
            },
            {
              role: "user",
              content: JSON.stringify({
                storeName: input.storeName,
                productTitle: input.productTitle,
                productDescription: input.productDescription,
                productUrl: input.productUrl,
                productPrice: input.productPrice,
                currency: input.currency,
                customerFirstName: input.customerFirstName,
                goal: "Remind a customer who viewed this product multiple times but has not purchased yet.",
              }),
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error (${response.status})`);
      }

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = payload.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("OpenAI returned an empty response");
      }

      const parsed = JSON.parse(content) as { subject?: string; html?: string };

      if (!parsed.subject || !parsed.html) {
        throw new Error("OpenAI response missing subject or html");
      }

      return {
        subject: parsed.subject.trim(),
        html: `${parsed.html.trim()}${UNSUBSCRIBE_FOOTER}`,
        source: "openai",
      };
    } catch (error) {
      logger.warn({ error }, "OpenAI email generation failed, using template");
      return {
        ...this.buildTemplateEmail(input),
        source: "template",
      };
    }
  }

  static buildTemplateEmail(
    input: ProductInterestEmailInput,
  ): Omit<GeneratedEmail, "source"> {
    const greeting = input.customerFirstName
      ? `Hi ${input.customerFirstName},`
      : "Hi there,";
    const priceText =
      input.productPrice != null
        ? `<p><strong>Price:</strong> ${input.productPrice}${input.currency ? ` ${input.currency}` : ""}</p>`
        : "";
    const linkText = input.productUrl
      ? `<p><a href="${input.productUrl}">View ${input.productTitle}</a></p>`
      : "";

    return {
      subject: `Still thinking about ${input.productTitle}?`,
      html: `<p>${greeting}</p><p>You recently viewed <strong>${input.productTitle}</strong> at ${input.storeName}. It is still available if you want to take another look.</p>${priceText}${linkText}${UNSUBSCRIBE_FOOTER}`,
    };
  }
}

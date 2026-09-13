import { db } from "~/server/db";
import { createContactBook } from "~/server/service/contact-book-service";
import { addOrUpdateContact } from "~/server/service/contact-service";
import { scheduleCampaign } from "~/server/service/campaign-service";
import { validateDomainFromEmail } from "~/server/service/domain-service";
import type { GeneratedEmail } from "~/server/service/openai-email-service";

export class ShopifyMarketingSendService {
  static async getOrCreateContactBook(teamId: number, storeId: string) {
    const settings = await db.shopifyMarketingSettings.findUnique({
      where: { storeId },
    });

    if (settings?.contactBookId) {
      const existing = await db.contactBook.findUnique({
        where: { id: settings.contactBookId },
      });

      if (existing) {
        return existing;
      }
    }

    const contactBook = await createContactBook(teamId, "RioReply Autopilot");

    await db.shopifyMarketingSettings.upsert({
      where: { storeId },
      create: {
        storeId,
        contactBookId: contactBook.id,
      },
      update: {
        contactBookId: contactBook.id,
      },
    });

    return contactBook;
  }

  static async sendProductInterestEmail(input: {
    teamId: number;
    storeId: string;
    fromEmail: string;
    recipientEmail: string;
    firstName: string | null;
    productTitle: string;
    generatedEmail: GeneratedEmail;
  }) {
    const contactBook = await this.getOrCreateContactBook(
      input.teamId,
      input.storeId,
    );

    const contact = await addOrUpdateContact(
      contactBook.id,
      {
        email: input.recipientEmail,
        firstName: input.firstName ?? undefined,
        subscribed: true,
      },
      input.teamId,
    );

    const domain = await validateDomainFromEmail(input.fromEmail, input.teamId);

    const campaign = await db.campaign.create({
      data: {
        name: `RioReply Product Interest - ${input.productTitle}`,
        from: input.fromEmail,
        subject: input.generatedEmail.subject,
        html: input.generatedEmail.html,
        contactBookId: contactBook.id,
        teamId: input.teamId,
        domainId: domain.id,
        total: 1,
      },
    });

    await scheduleCampaign({
      campaignId: campaign.id,
      teamId: input.teamId,
    });

    const email = await db.email.findFirst({
      where: {
        campaignId: campaign.id,
        contactId: contact.id,
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      campaignId: campaign.id,
      emailId: email?.id ?? null,
      contactId: contact.id,
    };
  }
}

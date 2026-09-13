-- CreateEnum
CREATE TYPE "RioReplyTriggerType" AS ENUM ('PRODUCT_INTEREST');

-- CreateEnum
CREATE TYPE "RioReplyActionStatus" AS ENUM ('DETECTED', 'SKIPPED', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "ShopifyMarketingSettings" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "fromEmail" TEXT,
    "minProductViews" INTEGER NOT NULL DEFAULT 3,
    "viewWindowHours" INTEGER NOT NULL DEFAULT 168,
    "cooldownHours" INTEGER NOT NULL DEFAULT 72,
    "maxEmailsPerVisitorWeek" INTEGER NOT NULL DEFAULT 2,
    "contactBookId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopifyMarketingSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopifyVisitorProfile" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "email" TEXT,
    "shopifyCustomerId" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "emailMarketingConsent" BOOLEAN,
    "lastMarketingEmailAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopifyVisitorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RioReplyAction" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "teamId" INTEGER NOT NULL,
    "triggerType" "RioReplyTriggerType" NOT NULL,
    "status" "RioReplyActionStatus" NOT NULL,
    "visitorId" TEXT,
    "shopifyProductId" TEXT,
    "productTitle" TEXT,
    "recipientEmail" TEXT,
    "emailId" TEXT,
    "campaignId" TEXT,
    "explanation" TEXT NOT NULL,
    "skipReason" TEXT,
    "subject" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RioReplyAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShopifyMarketingSettings_storeId_key" ON "ShopifyMarketingSettings"("storeId");

-- CreateIndex
CREATE INDEX "ShopifyVisitorProfile_storeId_email_idx" ON "ShopifyVisitorProfile"("storeId", "email");

-- CreateIndex
CREATE INDEX "ShopifyVisitorProfile_storeId_shopifyCustomerId_idx" ON "ShopifyVisitorProfile"("storeId", "shopifyCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "ShopifyVisitorProfile_storeId_visitorId_key" ON "ShopifyVisitorProfile"("storeId", "visitorId");

-- CreateIndex
CREATE INDEX "RioReplyAction_storeId_createdAt_idx" ON "RioReplyAction"("storeId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "RioReplyAction_storeId_visitorId_shopifyProductId_idx" ON "RioReplyAction"("storeId", "visitorId", "shopifyProductId");

-- CreateIndex
CREATE INDEX "RioReplyAction_teamId_createdAt_idx" ON "RioReplyAction"("teamId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "ShopifyMarketingSettings" ADD CONSTRAINT "ShopifyMarketingSettings_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "ShopifyStore"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopifyVisitorProfile" ADD CONSTRAINT "ShopifyVisitorProfile_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "ShopifyStore"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RioReplyAction" ADD CONSTRAINT "RioReplyAction_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "ShopifyStore"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RioReplyAction" ADD CONSTRAINT "RioReplyAction_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

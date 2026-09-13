-- CreateEnum
CREATE TYPE "ShopifyStorefrontEventType" AS ENUM ('PAGE_VIEW', 'PRODUCT_VIEW', 'COLLECTION_VIEW', 'SEARCH', 'ADD_TO_CART', 'REMOVE_FROM_CART', 'CHECKOUT_STARTED', 'PURCHASE');

-- AlterTable
ALTER TABLE "ShopifyStore" ADD COLUMN "trackingPublicKey" TEXT;

UPDATE "ShopifyStore"
SET "trackingPublicKey" = md5(random()::text || clock_timestamp()::text || id)
WHERE "trackingPublicKey" IS NULL;

ALTER TABLE "ShopifyStore" ALTER COLUMN "trackingPublicKey" SET NOT NULL;

CREATE UNIQUE INDEX "ShopifyStore_trackingPublicKey_key" ON "ShopifyStore"("trackingPublicKey");

-- CreateTable
CREATE TABLE "ShopifyStorefrontEvent" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "visitorId" TEXT,
    "eventType" "ShopifyStorefrontEventType" NOT NULL,
    "url" TEXT,
    "path" TEXT,
    "referrer" TEXT,
    "productId" TEXT,
    "productHandle" TEXT,
    "variantId" TEXT,
    "collectionHandle" TEXT,
    "searchQuery" TEXT,
    "orderId" TEXT,
    "value" DOUBLE PRECISION,
    "currency" TEXT,
    "quantity" INTEGER,
    "metadata" JSONB,
    "userAgent" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopifyStorefrontEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShopifyStorefrontEvent_storeId_occurredAt_idx" ON "ShopifyStorefrontEvent"("storeId", "occurredAt" DESC);

-- CreateIndex
CREATE INDEX "ShopifyStorefrontEvent_storeId_eventType_occurredAt_idx" ON "ShopifyStorefrontEvent"("storeId", "eventType", "occurredAt" DESC);

-- CreateIndex
CREATE INDEX "ShopifyStorefrontEvent_storeId_sessionId_idx" ON "ShopifyStorefrontEvent"("storeId", "sessionId");

-- CreateIndex
CREATE INDEX "ShopifyStorefrontEvent_storeId_visitorId_idx" ON "ShopifyStorefrontEvent"("storeId", "visitorId");

-- CreateIndex
CREATE INDEX "ShopifyStorefrontEvent_storeId_productId_occurredAt_idx" ON "ShopifyStorefrontEvent"("storeId", "productId", "occurredAt" DESC);

-- AddForeignKey
ALTER TABLE "ShopifyStorefrontEvent" ADD CONSTRAINT "ShopifyStorefrontEvent_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "ShopifyStore"("id") ON DELETE CASCADE ON UPDATE CASCADE;

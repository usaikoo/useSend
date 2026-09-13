-- CreateEnum
CREATE TYPE "ShopifySyncStatus" AS ENUM ('IDLE', 'SYNCING', 'FAILED');

-- AlterTable
ALTER TABLE "ShopifyStore" ADD COLUMN "syncStatus" "ShopifySyncStatus" NOT NULL DEFAULT 'IDLE';
ALTER TABLE "ShopifyStore" ADD COLUMN "syncError" TEXT;
ALTER TABLE "ShopifyStore" ADD COLUMN "productCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ShopifyStore" ADD COLUMN "customerCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ShopifyStore" ADD COLUMN "orderCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ShopifyProduct" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "shopifyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "handle" TEXT,
    "description" TEXT,
    "vendor" TEXT,
    "productType" TEXT,
    "status" TEXT,
    "tags" TEXT,
    "priceMin" DOUBLE PRECISION,
    "priceMax" DOUBLE PRECISION,
    "compareAtPrice" DOUBLE PRECISION,
    "inventoryTotal" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "productUrl" TEXT,
    "shopifyUpdatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopifyProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopifyCustomer" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "shopifyId" TEXT NOT NULL,
    "email" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "ordersCount" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DOUBLE PRECISION,
    "emailMarketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "lastOrderAt" TIMESTAMP(3),
    "shopifyCreatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopifyCustomer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopifyOrder" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "shopifyId" TEXT NOT NULL,
    "customerId" TEXT,
    "orderNumber" TEXT,
    "email" TEXT,
    "financialStatus" TEXT,
    "fulfillmentStatus" TEXT,
    "totalPrice" DOUBLE PRECISION,
    "currency" TEXT,
    "lineItems" JSONB,
    "shopifyCreatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopifyOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShopifyProduct_storeId_idx" ON "ShopifyProduct"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "ShopifyProduct_storeId_shopifyId_key" ON "ShopifyProduct"("storeId", "shopifyId");

-- CreateIndex
CREATE INDEX "ShopifyCustomer_storeId_idx" ON "ShopifyCustomer"("storeId");

-- CreateIndex
CREATE INDEX "ShopifyCustomer_storeId_email_idx" ON "ShopifyCustomer"("storeId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "ShopifyCustomer_storeId_shopifyId_key" ON "ShopifyCustomer"("storeId", "shopifyId");

-- CreateIndex
CREATE INDEX "ShopifyOrder_storeId_idx" ON "ShopifyOrder"("storeId");

-- CreateIndex
CREATE INDEX "ShopifyOrder_customerId_idx" ON "ShopifyOrder"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "ShopifyOrder_storeId_shopifyId_key" ON "ShopifyOrder"("storeId", "shopifyId");

-- AddForeignKey
ALTER TABLE "ShopifyProduct" ADD CONSTRAINT "ShopifyProduct_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "ShopifyStore"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopifyCustomer" ADD CONSTRAINT "ShopifyCustomer_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "ShopifyStore"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopifyOrder" ADD CONSTRAINT "ShopifyOrder_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "ShopifyStore"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopifyOrder" ADD CONSTRAINT "ShopifyOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "ShopifyCustomer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

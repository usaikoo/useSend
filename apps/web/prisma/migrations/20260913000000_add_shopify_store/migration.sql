-- CreateEnum
CREATE TYPE "ShopifyStoreStatus" AS ENUM ('ACTIVE', 'UNINSTALLED', 'DISCONNECTED');

-- CreateTable
CREATE TABLE "ShopifyStore" (
    "id" TEXT NOT NULL,
    "teamId" INTEGER NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "scope" TEXT,
    "status" "ShopifyStoreStatus" NOT NULL DEFAULT 'ACTIVE',
    "shopName" TEXT,
    "shopEmail" TEXT,
    "currency" TEXT,
    "timezone" TEXT,
    "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uninstalledAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopifyStore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShopifyStore_shopDomain_key" ON "ShopifyStore"("shopDomain");

-- CreateIndex
CREATE INDEX "ShopifyStore_teamId_idx" ON "ShopifyStore"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "ShopifyStore_teamId_shopDomain_key" ON "ShopifyStore"("teamId", "shopDomain");

-- AddForeignKey
ALTER TABLE "ShopifyStore" ADD CONSTRAINT "ShopifyStore_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

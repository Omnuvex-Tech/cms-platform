/*
  Warnings:

  - You are about to drop the column `tags` on the `portfolios` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "portfolios" DROP COLUMN "tags";

-- CreateTable
CREATE TABLE "portfolio_services" (
    "id" SERIAL NOT NULL,
    "portfolioId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "coverImage" TEXT NOT NULL,
    "coverImageAlt" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "portfolio_services_portfolioId_serviceId_key" ON "portfolio_services"("portfolioId", "serviceId");

-- AddForeignKey
ALTER TABLE "portfolio_services" ADD CONSTRAINT "portfolio_services_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_services" ADD CONSTRAINT "portfolio_services_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

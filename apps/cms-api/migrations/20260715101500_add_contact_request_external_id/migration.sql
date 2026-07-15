-- AlterTable
ALTER TABLE "contact_requests" ADD COLUMN     "externalId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "contact_requests_externalId_key" ON "contact_requests"("externalId");

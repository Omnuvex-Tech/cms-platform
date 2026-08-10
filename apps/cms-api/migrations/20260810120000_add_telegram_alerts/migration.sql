-- CreateTable
CREATE TABLE "telegram_alerts" (
    "id" SERIAL NOT NULL,
    "handoffId" INTEGER NOT NULL,
    "chatId" TEXT NOT NULL,
    "messageId" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "claimedBy" TEXT,
    "claimedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "telegram_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "telegram_alerts_handoffId_key" ON "telegram_alerts"("handoffId");

-- AddForeignKey
ALTER TABLE "telegram_alerts" ADD CONSTRAINT "telegram_alerts_handoffId_fkey" FOREIGN KEY ("handoffId") REFERENCES "handoffs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

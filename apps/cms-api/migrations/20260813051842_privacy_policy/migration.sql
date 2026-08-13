-- CreateTable
CREATE TABLE "privacy_policy_settings" (
    "id" SERIAL NOT NULL,
    "title" JSONB NOT NULL DEFAULT '{}',
    "description" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "privacy_policy_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "privacy_policy_sections" (
    "id" SERIAL NOT NULL,
    "title" JSONB NOT NULL DEFAULT '{}',
    "description" JSONB NOT NULL DEFAULT '{}',
    "order" INTEGER NOT NULL DEFAULT 0,
    "settingsId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "privacy_policy_sections_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "privacy_policy_sections" ADD CONSTRAINT "privacy_policy_sections_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "privacy_policy_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

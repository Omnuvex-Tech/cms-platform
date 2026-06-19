-- CreateTable
CREATE TABLE "PortfolioSettings" (
    "id" SERIAL NOT NULL,
    "sectionTitle" JSONB NOT NULL,
    "dropdownLabel" JSONB NOT NULL,
    "moreButtonLabel" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hero_settings" (
    "id" SERIAL NOT NULL,
    "title" JSONB NOT NULL DEFAULT '{}',
    "description" JSONB NOT NULL DEFAULT '{}',
    "primaryBtnText" JSONB NOT NULL DEFAULT '{}',
    "primaryBtnLink" TEXT NOT NULL DEFAULT '/contact',
    "primaryBtnNewTab" BOOLEAN NOT NULL DEFAULT false,
    "secondaryBtnText" JSONB NOT NULL DEFAULT '{}',
    "secondaryBtnLink" TEXT NOT NULL DEFAULT '/services',
    "secondaryBtnNewTab" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_settings_pkey" PRIMARY KEY ("id")
);
